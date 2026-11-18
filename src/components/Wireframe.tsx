import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { navigation } from '../navigation'

export function Header() {
  return (
    <header className="site-header">
      <Link className="logo-placeholder" to="/" aria-label="Momoka Talkへ戻る">
        <span className="brand-wordmark">MOMOKA</span>
        <span className="brand-tagline">AI VTUBER</span>
      </Link>
      <nav aria-label="メインナビゲーション">
        <ul className="navigation">
          {navigation.map(({ label, path }) => (
            <li key={path}><NavLink to={path} end>
              <span className="navigation-icon" aria-hidden="true">{label.slice(0, 1)}</span>
              <span>{label}</span>
            </NavLink></li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

export function Footer() {
  const dialog = useRef<HTMLDialogElement>(null)
  const [topic, setTopic] = useState('About')

  return (
    <>
      <footer className="site-footer">
        <nav aria-label="補助リンク">
          {['About', 'Credits', 'Privacy'].map((label) => (
            <a key={label} href={`#${label.toLowerCase()}`} onClick={(event) => {
              event.preventDefault()
              setTopic(label)
              dialog.current?.showModal()
            }}>{label}</a>
          ))}
        </nav>
      </footer>
      <dialog ref={dialog} className="wire-dialog" aria-labelledby="information-title">
        <h2 id="information-title">{topic}</h2>
        <p>{topic === 'Credits'
          ? '人物画像はAI生成を使用しています。ロゴは仮の文字表記です。正式なクレジットは制作中です。'
          : topic === 'Privacy'
            ? 'このデザインプレビューは固定返信です。入力を外部のAIへ送信せず、会話はページを閉じると消えます。個人情報は入力しないでください。'
            : '小鳥遊ももか公式サイトの卒業制作・デザイン確認版です。実際のAI会話や活動実績を示すものではありません。'}</p>
        <form method="dialog"><button type="submit">閉じる</button></form>
      </dialog>
    </>
  )
}

export function Placeholder({ label, className = '' }: { label: string; className?: string }) {
  return <div className={`placeholder ${className}`}>{label}</div>
}

export function TextLines({ short = false }: { short?: boolean }) {
  return <div className={`text-lines ${short ? 'text-lines-short' : ''}`} aria-hidden="true"><span /><span /><span /></div>
}

export function PageHeading({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="page-heading"><h1>{title}</h1>{children && <p>{children}</p>}</div>
}
