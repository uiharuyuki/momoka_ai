import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeading, Placeholder } from '../components/Wireframe'

const profileViews = [
  { id: 'standard', label: '通常', placeholder: 'CHARACTER / STANDARD POSE' },
  { id: 'smile', label: '笑顔', placeholder: 'CHARACTER / SMILE POSE' },
  { id: 'thinking', label: '考え中', placeholder: 'CHARACTER / THINKING POSE' },
]

const profileFacts = [
  { label: '誕生日', value: '未設定' },
  { label: '身長', value: '未設定' },
  { label: '好きなもの', value: '未設定' },
  { label: '活動テーマ', value: '未設定' },
]

export function ProfilePage() {
  const [characterView, setCharacterView] = useState(profileViews[0].id)
  const activeView = profileViews.find((view) => view.id === characterView) ?? profileViews[0]

  return (
    <main id="main-content" className="content-page profile-page">
      <section className="profile-hero" aria-labelledby="profile-name">
        <div className="profile-visual">
          <span className="profile-visual-label">CHARACTER VIEW</span>
          <Placeholder label={activeView.placeholder} className="profile-character" />
          <div className="profile-view-switcher" role="group" aria-label="表情とポーズを切り替える">
            {profileViews.map((view) => (
              <button type="button" key={view.id} aria-pressed={characterView === view.id} onClick={() => setCharacterView(view.id)}>
                {view.label}
              </button>
            ))}
          </div>
        </div>

        <header className="profile-identity">
          <p className="profile-kicker">AI VTUBER</p>
          <h1 id="profile-name">小鳥遊ももか</h1>
          <p className="profile-romanized">MOMOKA TAKANASHI</p>
        </header>

        <div className="profile-intro-copy">
          <p className="profile-tagline">少し、話していく？</p>
          <p className="profile-summary">Webサイトであなたと話す、ひとりのAI VTuber。ここでは人柄や活動テーマを、短い言葉で紹介します。</p>
          <div className="profile-actions">
            <Link className="button-link profile-primary-action" to="/">ももかと話す</Link>
            <Link className="button-link" to="/voice">声を聴く</Link>
          </div>
          <div className="profile-socials" aria-label="外部アカウント（未設定）">
            <button type="button" disabled aria-label="XのURLは未設定">X</button>
            <button type="button" disabled aria-label="YouTubeのURLは未設定">YT</button>
          </div>
        </div>
      </section>

      <dl className="profile-facts" aria-label="基本情報">
        {profileFacts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}
      </dl>

      <section className="profile-about" aria-labelledby="profile-about-title">
        <div className="profile-section-heading">
          <span>ABOUT MOMOKA</span>
          <h2 id="profile-about-title">ももかについて</h2>
        </div>
        <div className="profile-about-copy">
          <p>性格、好きなこと、話し方を、設定表ではなく一続きの紹介文として伝えるエリアです。正式なプロフィール文はキャラクター設定の確定後に差し替えます。</p>
          <div className="profile-tags" aria-label="プロフィール要素（仮）"><span>PERSONALITY</span><span>LIKES</span><span>STYLE</span></div>
        </div>
      </section>

      <section className="profile-ai-section" aria-labelledby="profile-ai-title">
        <div className="profile-section-heading">
          <span>AI IDENTITY</span>
          <h2 id="profile-ai-title">AIとしての特徴</h2>
        </div>
        <div className="profile-ai-grid">
          <article><span>01</span><h3>会話できる</h3><p>Talkページで、テキストを通じてキャラクターと話せます。</p></article>
          <article><span>02</span><h3>設定に基づく</h3><p>公開設定をもとに、キャラクターらしい返答を目指します。</p></article>
          <article><span>03</span><h3>セッション限定</h3><p>会話履歴はページ内だけで保持し、再読み込みでリセットします。</p></article>
        </div>
      </section>

      <section className="profile-related" aria-labelledby="profile-related-title">
        <div><span>MEET MOMOKA</span><h2 id="profile-related-title">もっと知る</h2></div>
        <nav aria-label="関連ページ">
          <Link to="/">Talk <span>会話する →</span></Link>
          <Link to="/voice">Voice <span>声を聴く →</span></Link>
          <Link to="/activities">Activities <span>活動を見る →</span></Link>
        </nav>
      </section>

      <p className="profile-credits">ILLUSTRATOR / LIVE2D CREDITS：未設定</p>
    </main>
  )
}

export { ActivitiesPage, VoicePage, GoodsPage } from './CatalogPages'

export function NotFoundPage() {
  return <main id="main-content" className="content-page"><PageHeading title="ページが見つかりません" /><p className="back-to-talk"><Link to="/">Talkへ戻る</Link></p></main>
}
