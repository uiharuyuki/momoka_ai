import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { navigation } from '../navigation'
import type { PortraitMode } from '../pages/TalkPage'

function NavigationLinks({ mobile, onSelect, children }: { mobile?: boolean; onSelect?: () => void; children?: ReactNode }) {
  return (
    <nav aria-label="メインナビゲーション">
      <ul className={mobile ? 'menu-links' : 'navigation'}>
        {navigation.map(({ label, path }) => (
          <li key={path}><NavLink to={path} end onClick={onSelect}>{label}</NavLink></li>
        ))}
        {children}
      </ul>
    </nav>
  )
}

export function Header({ onInfo }: { onInfo: () => void }) {
  const menu = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const closeMenu = () => {
    menu.current?.close()
    setOpen(false)
  }

  useEffect(() => { menu.current?.close() }, [pathname])
  useEffect(() => {
    const compact = window.matchMedia('(max-width: 720px), (max-width: 960px) and (max-height: 520px) and (pointer: coarse)')
    const onResize = () => { if (!compact.matches) menu.current?.close() }
    compact.addEventListener('change', onResize)
    return () => compact.removeEventListener('change', onResize)
  }, [])

  return (
    <>
      <header className="site-header">
        <Link className="logo-placeholder" to="/" aria-label="Momoka Talkへ戻る">
          <span className="brand-wordmark">MOMOKA</span>
          <span className="brand-tagline">AI VTUBER</span>
        </Link>
        <NavigationLinks>
          <li>
            <button type="button" aria-label="サイト情報" title="サイト情報" aria-haspopup="dialog" onClick={onInfo}>ⓘ</button>
          </li>
        </NavigationLinks>
        <button type="button" className="menu-square menu-trigger" aria-label="メニューを開く"
          aria-haspopup="dialog" aria-controls="mobile-navigation" aria-expanded={open}
          onClick={() => { menu.current?.showModal(); setOpen(true) }}>
          MENU
        </button>
      </header>
      <dialog id="mobile-navigation" className="mobile-menu" aria-label="サイトメニュー"
        ref={menu} aria-hidden={open ? undefined : true} onClose={event => setOpen(event.currentTarget.open)}>
        <div className="menu-masthead">
          <span className="brand-wordmark">MOMOKA</span>
          <button className="menu-square menu-close" type="button" aria-label="メニューを閉じる" onClick={closeMenu}>
            CLOSE
          </button>
        </div>
        <NavigationLinks mobile onSelect={closeMenu} />
        <button className="menu-info" type="button" aria-haspopup="dialog" onClick={() => { closeMenu(); onInfo() }}>サイト情報</button>
      </dialog>
    </>
  )
}

const infoTopics = ['About', 'Credits', 'Privacy'] as const
export type InfoTopic = typeof infoTopics[number]

export function Footer({ onInfo }: { onInfo: (topic: InfoTopic) => void }) {
  return (
    <footer className="site-footer">
      <nav aria-label="補助リンク">
        {infoTopics.map(label => <a key={label} href={'#' + label.toLowerCase()} onClick={event => {
          event.preventDefault()
          onInfo(label)
        }}>{label}</a>)}
      </nav>
    </footer>
  )
}

export function InformationDialog({ topic, choose, close, portraitMode, choosePortrait }: {
  topic: InfoTopic | 'サイト情報'
  choose: (topic: InfoTopic) => void
  close: () => void
  portraitMode: PortraitMode
  choosePortrait: (mode: PortraitMode) => void
}) {

  return (
      <dialog ref={node => { if (node && !node.open) node.showModal() }}
        onClose={close} className="wire-dialog" aria-labelledby="information-title">
        <h2 id="information-title">{topic}</h2>
        {topic === 'サイト情報' && <div className="portrait-choices" role="group" aria-label="立ち絵の飲み物">
          <span>立ち絵</span>
          {([['neutral', 'タピオカなし'], ['tapioca', 'タピオカあり']] as const).map(([value, label]) => <button type="button" key={value}
            aria-pressed={portraitMode === value}
            onClick={() => choosePortrait(value)}>
            {label}
          </button>)}
        </div>}
        <div className="info-topics">{infoTopics.map(label =>
          <button type="button" key={label} aria-pressed={topic === label} onClick={() => choose(label)}>{label}</button>
        )}</div>
        {topic !== 'サイト情報' && <p>{topic === 'Credits'
          ? '人物画像はAI生成を使用しています。ロゴは仮の文字表記です。正式なクレジットは制作中です。'
          : topic === 'Privacy'
            ? 'このデザインプレビューは固定返信です。入力を外部のAIへ送信せず、会話はページを閉じると消えます。個人情報は入力しないでください。'
            : '小鳥遊ももか公式サイトの卒業制作・デザイン確認版です。実際のAI会話や活動実績を示すものではありません。'}</p>}
        <form method="dialog"><button type="submit">閉じる</button></form>
      </dialog>
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
