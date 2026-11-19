import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import momokaNeutral from '../assets/momoka-neutral.webp'
import momokaTapioca from '../assets/momoka-tapioca.webp'
import eyesHalf from '../assets/momoka-eyes-half.webp'
import eyesClosed from '../assets/momoka-eyes-closed.webp'
import mouthSmile from '../assets/momoka-mouth-smile.webp'
import sendArrow from '../assets/send-arrow.svg'

type Message = { id: number; role: 'character' | 'user'; text: string }
type TalkMode = 'intro' | 'conversation'
export type PortraitMode = 'neutral' | 'tapioca'
type EyeState = 'open' | 'half' | 'closed'

const neutralReply = 'デモ用の固定返信だよ。今日は商店街を歩いていたよ。'
const tapiocaReply = 'デモ用の固定返信だよ。今日はタピオカミルクティーにしたよ。'
const INPUT_LIMIT = 100
function countInput(text: string) { return Array.from(text.trim()).length }

const topics = [
  { label: '好きな紅茶', question: 'ももかはどんな紅茶が好き？' },
  { label: '普段の活動', question: 'ももかは普段どんな活動をしているの？' },
  { label: '自己紹介', question: 'ももかの自己紹介を聞かせて。' },
  { label: '好きなお菓子', question: '紅茶に合わせるなら、どんなお菓子が好き？' },
  { label: '休日の過ごし方', question: 'ももかは休みの日に何をして過ごすの？' },
  { label: '名前の読み方', question: 'ももかの名字はどう読むの？' },
  { label: 'カフェの一杯', question: '今日の気分に合う飲み物を選んでくれる？' },
  { label: '最近の楽しみ', question: 'ももかが最近楽しみにしていることは何？' },
  { label: '気分転換', question: 'ももかはひと息つきたいとき、何をしているの？' },
]

type Bubble = { topic: typeof topics[number]; slot: number }
const slots = Array.from({ length: 12 }, (_, index) => index)

function sample<T>(pool: T[]) {
  return pool[Math.floor(Math.random() * pool.length)]
}

function drawBubble(neighbor?: Bubble, previous?: Bubble): Bubble {
  const topic = sample(topics.filter(item => item !== previous?.topic && item !== neighbor?.topic))
  const slot = sample(slots.filter(place =>
    (!previous || Math.floor(place / 2) !== Math.floor(previous.slot / 2)) &&
    (!neighbor || place % 2 !== neighbor.slot % 2 || Math.abs(place - neighbor.slot) > 2)))
  return { topic, slot }
}

function BubbleOutline({ slot }: { slot: number }) {
  const outline = useRef<SVGSVGElement>(null)
  useLayoutEffect(() => {
    const svg = outline.current
    const button = svg?.parentElement
    const stage = button?.closest('.character-stage')
    const portrait = stage?.querySelector('.momoka-portrait')
    const path = svg?.querySelector('path')
    if (!button || !stage || !portrait || !path) return

    const aim = () => {
      const body = button.getBoundingClientRect()
      const art = portrait.getBoundingClientRect()
      // Both portraits share the same mouth anchor on their transparent canvas.
      const mouthX = art.left + art.width * .68
      const mouthY = art.top + art.height * .295
      const edge = mouthX < body.left + body.width / 2 ? body.left : body.right
      const dy = mouthY - (body.top + body.height / 2)
      const dx = Math.abs(mouthX - edge)
      const reach = Math.min(14, body.height / 4)
      const halfBase = reach * .56
      const slope = Math.max(-halfBase, Math.min(halfBase, reach * dy / Math.max(1, dx)))
      const mid = body.height / 2 + slope * .3
      const tip = mid + slope
      const r = Math.min(16, body.height / 2 - 11)
      const w = body.width - .5
      const h = body.height - .5
      // Draw the tail into the same perimeter as the body for a seamless join.
      path.setAttribute('d', [
        `M ${r} .5 H ${w-r} Q ${w} .5 ${w} ${r} V ${h-r} Q ${w} ${h} ${w-r} ${h}`,
        `H ${r} Q .5 ${h} .5 ${h-r} V ${mid + halfBase}`,
        `L ${-reach} ${tip} L .5 ${mid - halfBase}`,
        `V ${r} Q .5 .5 ${r} .5 Z`,
      ].join(' '))
    }
    aim()
    const observer = new ResizeObserver(aim)
    observer.observe(button)
    observer.observe(portrait)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [slot])
  return <svg className="bubble-outline" ref={outline} aria-hidden="true"><path /></svg>
}

function TopicSuggestions({ onChoose }: { onChoose: (question: string) => void }) {
  const [visible, setVisible] = useState(() => {
    const first = drawBubble()
    return [first, drawBubble(first)]
  })

  function cycle(index: number) {
    setVisible(current => current.map((bubble, i) =>
      i === index ? drawBubble(current[1 - index], bubble) : bubble))
  }

  return (
    <div className="hero-topics" role="group" aria-label="質問の候補">
      {visible.map(({ topic, slot }, index) => (
        <button key={index} className="hero-topic" type="button" onClick={() => onChoose(topic.question)}
          data-side={slot % 2 ? 'right' : 'left'}
          data-lower={slot >= 6 || undefined}
          style={{ gridColumn: slot % 2 + 1, '--row-offset': Math.floor(slot / 2) } as CSSProperties}
          onAnimationIteration={() => cycle(index)}>
          <BubbleOutline slot={slot} />{topic.label}
        </button>
      ))}
    </div>
  )
}

export function TalkPage({ portraitMode }: { portraitMode: PortraitMode }) {
  const [mode, setMode] = useState<TalkMode>('intro')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [replyPending, setReplyPending] = useState(false)
  const [eyeState, setEyeState] = useState<EyeState>('open')
  const [smile, setSmile] = useState(false)
  const portraitModeRef = useRef<PortraitMode>(portraitMode)
  useLayoutEffect(() => { portraitModeRef.current = portraitMode }, [portraitMode])
  const scene = useRef<HTMLElement>(null)
  const history = useRef<HTMLDivElement>(null)
  const textInput = useRef<HTMLInputElement>(null)
  const composing = useRef(false)
  const nextId = useRef(1)
  const replyTimer = useRef<number | null>(null)
  const smileTimer = useRef<number | null>(null)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const timers = new Set<number>()
    let cancelled = false
    let blinkPhase: EyeState = 'open'
    let idleActive = false
    const clearTimers = () => {
      timers.forEach(timer => window.clearTimeout(timer))
      timers.clear()
    }
    const applyEyes = () => setEyeState(blinkPhase === 'open' && idleActive ? 'half' : blinkPhase)
    const neutralize = () => {
      blinkPhase = 'open'
      idleActive = false
      applyEyes()
      if (smileTimer.current !== null) {
        window.clearTimeout(smileTimer.current)
        smileTimer.current = null
      }
      setSmile(false)
    }
    const allowed = () => !cancelled && portraitMode === 'neutral' && !document.hidden && !reducedMotion.matches
    const later = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer)
        if (allowed()) callback()
      }, delay)
      timers.add(timer)
    }
    const scheduleBlink = () => {
      later(() => {
        blinkPhase = 'half'
        applyEyes()
        later(() => { blinkPhase = 'closed'; applyEyes() }, 45)
        later(() => { blinkPhase = 'half'; applyEyes() }, 130)
        later(() => {
          blinkPhase = 'open'
          applyEyes()
          scheduleBlink()
        }, 180)
      }, 4000 + Math.random() * 4000)
    }
    const scheduleIdle = () => {
      later(() => {
        idleActive = true
        applyEyes()
        later(() => {
          idleActive = false
          applyEyes()
          scheduleIdle()
        }, 1000 + Math.random() * 1000)
      }, 20000 + Math.random() * 20000)
    }
    const sync = () => {
      clearTimers(); neutralize()
      if (allowed()) { scheduleBlink(); scheduleIdle() }
    }
    document.addEventListener('visibilitychange', sync)
    reducedMotion.addEventListener('change', sync)
    sync()
    return () => {
      cancelled = true
      clearTimers()
      document.removeEventListener('visibilitychange', sync)
      reducedMotion.removeEventListener('change', sync)
    }
  }, [portraitMode])

  useEffect(() => () => {
    if (replyTimer.current !== null) window.clearTimeout(replyTimer.current)
    if (smileTimer.current !== null) window.clearTimeout(smileTimer.current)
  }, [])

  useEffect(() => {
    const stage = scene.current
    if (!stage) return
    const pointerMotion = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
    let frame = 0
    let x = 0
    let y = 0

    function update() {
      frame = 0
      stage?.style.setProperty('--look-x', x.toFixed(3))
      stage?.style.setProperty('--look-y', y.toFixed(3))
    }
    function track(event: PointerEvent) {
      if (!pointerMotion.matches || event.pointerType === 'touch') return
      x = 1 - 2 * event.clientX / window.innerWidth
      y = 1 - 2 * event.clientY / window.innerHeight
      if (!frame) frame = requestAnimationFrame(update)
    }
    function recenter() {
      cancelAnimationFrame(frame)
      x = y = 0
      update()
    }
    stage.addEventListener('pointermove', track, { passive: true })
    stage.addEventListener('pointerleave', recenter)
    window.addEventListener('blur', recenter)
    pointerMotion.addEventListener('change', recenter)
    return () => {
      cancelAnimationFrame(frame)
      stage.removeEventListener('pointermove', track)
      stage.removeEventListener('pointerleave', recenter)
      window.removeEventListener('blur', recenter)
      pointerMotion.removeEventListener('change', recenter)
    }
  }, [])

  useEffect(() => {
    const element = history.current
    if (element) element.scrollTop = element.scrollHeight
  }, [messages])

  function submitText(text: string) {
    const normalized = text.trim()
    if (!normalized || countInput(text) > INPUT_LIMIT || composing.current || replyPending) return

    const userId = nextId.current++
    const answerId = nextId.current++
    setMessages((previous) => [...previous, { id: userId, role: 'user', text: normalized }])
    setReplyPending(true)
    setInput('')
    setMode('conversation')
    if (replyTimer.current !== null) window.clearTimeout(replyTimer.current)
    replyTimer.current = window.setTimeout(() => {
      const mockReply = portraitModeRef.current === 'tapioca' ? tapiocaReply : neutralReply
      setMessages((previous) => [...previous, { id: answerId, role: 'character', text: mockReply }])
      replyTimer.current = null
      if (portraitModeRef.current === 'neutral' && !document.hidden && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        if (smileTimer.current !== null) window.clearTimeout(smileTimer.current)
        setSmile(true)
        smileTimer.current = window.setTimeout(() => { smileTimer.current = null; setSmile(false) }, 2200)
      }
      setReplyPending(false)
      textInput.current?.focus()
    }, 650)
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    submitText(input)
  }

  function chooseTopic(question: string) {
    setInput(previous => {
      if (!previous.trim() || topics.some(topic => topic.question === previous)) return question
      return previous.endsWith(question) ? previous : previous + ' ' + question
    })
    const field = textInput.current
    if (!field) return
    field.focus({ preventScroll: true })
    requestAnimationFrame(() => {
      field.setSelectionRange(field.value.length, field.value.length)
      field.scrollIntoView({ block: 'center', inline: 'nearest',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
    })
  }

  function resetTalk() {
    setMode('intro')
    setMessages([])
    setInput('')
    setEyeState('open')
    setSmile(false)
    if (smileTimer.current !== null) { window.clearTimeout(smileTimer.current); smileTimer.current = null }
  }

  const inputCount = countInput(input)
  const counter = (
    <p id="input-limit" className="wire-note" aria-live="polite">
      {inputCount} / 100文字{inputCount > INPUT_LIMIT && <span className="limit-warning">100文字以内に短くしてね。</span>}
    </p>
  )
  const composer = (
    <>
    <form className="message-form" onSubmit={sendMessage}>
      <label className="visually-hidden" htmlFor="message-input">メッセージ（100文字まで）</label>
      <input ref={textInput} id="message-input" name="message" value={input}
        aria-describedby="input-limit" aria-invalid={countInput(input) > INPUT_LIMIT}
        placeholder={mode === 'conversation' ? 'ももかにメッセージを入力' : undefined} autoComplete="off"
        onChange={(event) => setInput(event.target.value)}
        onCompositionStart={() => { composing.current = true }}
        onCompositionEnd={() => { composing.current = false }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault()
        }} />
      <button type="submit" aria-label="送信" disabled={!input.trim() || countInput(input) > INPUT_LIMIT || replyPending}>
        <img className="send-icon" src={sendArrow} alt="" width="24" height="24" />
      </button>
    </form>
    {mode === 'conversation' && counter}
    </>
  )

  return (
    <main ref={scene} id="main-content" className={`talk-page talk-page-${mode}`}>
      <h1 className="visually-hidden">Talk</h1>
      <div className="street-camera" aria-hidden="true" />

      <section className="character-stage" aria-label="キャラクター表示エリア">
        <div className="portrait-depth">
          <div className="portrait-stack" data-portrait-mode={portraitMode} data-eye-state={eyeState} data-smile={smile}>
            <img className="momoka-portrait" src={portraitMode === 'tapioca' ? momokaTapioca : momokaNeutral} width="1024" height="1536"
              alt={portraitMode === 'tapioca' ? 'タピオカミルクティーをストローで飲む小鳥遊ももか' : '商店街で振り向く小鳥遊ももか'} fetchPriority="high" />
            {portraitMode === 'neutral' && <>
              <img className="portrait-layer portrait-eyes eyes-half" src={eyesHalf} width="1024" height="1536" alt="" />
              <img className="portrait-layer portrait-eyes eyes-closed" src={eyesClosed} width="1024" height="1536" alt="" />
              <img className="portrait-layer portrait-mouth" src={mouthSmile} width="1024" height="1536" alt="" />
            </>}
          </div>
        </div>
        {mode === 'intro' && <TopicSuggestions onChoose={chooseTopic} />}
      </section>

      {mode === 'intro' ? (
        <section className="intro-composer" aria-label="会話を始める" aria-describedby="talk-preview-note">
          {composer}
          <div className="intro-feedback" hidden={!input}>{counter}</div>
          <p className="visually-hidden" id="talk-preview-note">デザイン確認用 · 固定返信です。実際のAIには送信しません。</p>
        </section>
      ) : (
        <section className="conversation-panel" aria-labelledby="conversation-title">
          <header className="conversation-heading">
            <div><span className="wire-label">DESIGN PREVIEW · 固定返信</span><h2 id="conversation-title">ももかと話す</h2></div>
            <button type="button" disabled={replyPending} className="reset-talk" onClick={resetTalk}>最初の画面へ</button>
          </header>
          <div ref={history} className="conversation-log conversation-history" role="log" aria-label="会話履歴" aria-live="polite" aria-relevant="additions" tabIndex={0}>
            {messages.map((message) => (
              <article key={message.id} className={`message message-${message.role}`}>
                <span className="message-avatar" aria-hidden="true" />
                <div className="message-content">
                  <span className="message-author">{message.role === 'user' ? 'あなた' : '小鳥遊ももか（モック）'}</span>
                  <p>{message.text}</p>
                </div>
              </article>
            ))}
            {replyPending && (
              <article className="message message-character message-typing" aria-label="ももかが返信中">
                <span className="message-avatar" aria-hidden="true" />
                <div className="message-content">
                  <span className="message-author">小鳥遊ももか（モック）</span>
                  <p className="typing-dots" aria-hidden="true"><span>•</span><span>•</span><span>•</span></p>
                </div>
              </article>
            )}
          </div>
          {composer}
        </section>
      )}
    </main>
  )
}
