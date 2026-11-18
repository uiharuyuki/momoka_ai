import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import momokaPortrait from '../assets/momoka-approved.webp'

type Message = { id: number; role: 'character' | 'user'; text: string }
type TalkMode = 'intro' | 'conversation'

const starters = ['自己紹介して', 'どんな活動をするの？', '少し話したい']
const mockReply = 'これはレイアウト確認用の固定返信です。実際のAIには送信していません。'

export function TalkPage() {
  const [mode, setMode] = useState<TalkMode>('intro')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const history = useRef<HTMLDivElement>(null)
  const textInput = useRef<HTMLInputElement>(null)
  const composing = useRef(false)
  const nextId = useRef(1)

  useEffect(() => {
    const element = history.current
    if (element) element.scrollTop = element.scrollHeight
  }, [messages])

  function submitText(text: string) {
    const normalized = text.trim()
    if (!normalized || composing.current) return

    const userId = nextId.current++
    const answerId = nextId.current++
    setMessages((previous) => [
      ...previous,
      { id: userId, role: 'user', text: normalized },
      { id: answerId, role: 'character', text: mockReply },
    ])
    setInput('')
    setMode('conversation')
    window.setTimeout(() => textInput.current?.focus(), 350)
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    submitText(input)
  }

  function resetTalk() {
    setMode('intro')
    setMessages([])
    setInput('')
  }

  const composer = (
    <form className="message-form" onSubmit={sendMessage}>
      <label className="visually-hidden" htmlFor="message-input">メッセージ</label>
      <input ref={textInput} id="message-input" name="message" value={input} maxLength={400}
        placeholder="ももかにメッセージを入力" autoComplete="off"
        onChange={(event) => setInput(event.target.value)}
        onCompositionStart={() => { composing.current = true }}
        onCompositionEnd={() => { composing.current = false }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault()
        }} />
      <button type="submit" aria-label="送信" disabled={!input.trim()}>
        <span className="send-icon" aria-hidden="true">➤</span>
      </button>
    </form>
  )

  return (
    <main id="main-content" className={`talk-page talk-page-${mode}`}>
      <h1 className="visually-hidden">Talk</h1>

      <section className="character-stage" aria-label="キャラクター表示エリア">
        {mode === 'intro' && (
          <div className="character-copy">
            <p className="character-name">小鳥遊ももか<span>TAKANASHI MOMOKA</span></p>
            <p className="character-greeting">少し、話していく？</p>
          </div>
        )}
        <span className="hero-orbit hero-orbit-one" aria-hidden="true" />
        <span className="hero-orbit hero-orbit-two" aria-hidden="true" />
        <img className="momoka-portrait" src={momokaPortrait} width="580" height="790"
          alt="ピンクの髪と輪のアホ毛、緑の服の小鳥遊ももか" fetchPriority="high" />
      </section>

      {mode === 'intro' ? (
        <section className="intro-composer" aria-label="会話を始める">
          <div className="starter-list" aria-label="質問例">
            {starters.map((starter) => (
              <button type="button" key={starter} onClick={() => submitText(starter)}>{starter}</button>
            ))}
          </div>
          {composer}
          <p className="wire-note">デザイン確認用 · 固定返信です。実際のAIには送信しません。</p>
        </section>
      ) : (
        <section className="conversation-panel" aria-labelledby="conversation-title">
          <header className="conversation-heading">
            <div><span className="wire-label">DESIGN PREVIEW · 固定返信</span><h2 id="conversation-title">ももかと話す</h2></div>
            <button type="button" className="reset-talk" onClick={resetTalk}>最初の画面へ</button>
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
          </div>
          {composer}
        </section>
      )}
    </main>
  )
}
