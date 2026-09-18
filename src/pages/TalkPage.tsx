import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Placeholder } from '../components/Wireframe'

type Message = { id: number; role: 'character' | 'user'; text: string }

const initialMessages: Message[] = [
  { id: 1, role: 'character', text: 'こんにちは。ここは会話のサンプルです。' },
  { id: 2, role: 'user', text: 'こんにちは。よろしくお願いします。' },
]

const mockReply = 'これは固定のモック回答です。送信されたメッセージを確認しました。'

export function TalkPage() {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const history = useRef<HTMLDivElement>(null)
  const textInput = useRef<HTMLInputElement>(null)
  const composing = useRef(false)
  const nextId = useRef(3)

  useEffect(() => {
    const element = history.current
    if (element) element.scrollTop = element.scrollHeight
  }, [messages])

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = input.trim()
    if (!text || composing.current) return

    const userId = nextId.current++
    const answerId = nextId.current++
    setMessages((previous) => [...previous,
      { id: userId, role: 'user', text },
      { id: answerId, role: 'character', text: mockReply },
    ])
    setInput('')
    textInput.current?.focus()
  }

  return (
    <main id="main-content" className="talk-page">
      <h1 className="visually-hidden">Talk</h1>
      <section className="character-stage" aria-label="キャラクター表示エリア">
        <Placeholder label="CHARACTER PLACEHOLDER" className="character-placeholder" />
      </section>
      <section className="conversation-panel" aria-labelledby="conversation-title">
        <header className="conversation-heading"><h2 id="conversation-title">CONVERSATION</h2></header>
        <div ref={history} className="conversation-history" role="log" aria-label="会話履歴" aria-live="polite" aria-relevant="additions" tabIndex={0}>
          {messages.map((message) => (
            <article key={message.id} className={`message message-${message.role}`}>
              <span className="message-avatar" aria-hidden="true" />
              <div className="message-content">
                <span className="message-author">{message.role === 'user' ? 'あなた' : 'キャラクター（モック）'}</span>
                <p>{message.text}</p>
              </div>
            </article>
          ))}
        </div>
        <form className="message-form" onSubmit={sendMessage}>
          <label className="visually-hidden" htmlFor="message-input">メッセージ</label>
          <input ref={textInput} id="message-input" name="message" value={input} maxLength={1000}
            placeholder="メッセージを入力" autoComplete="off"
            onChange={(event) => setInput(event.target.value)}
            onCompositionStart={() => { composing.current = true }}
            onCompositionEnd={() => { composing.current = false }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && (event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault()
            }} />
          <button type="submit" disabled={!input.trim()}>送信</button>
        </form>
      </section>
    </main>
  )
}
