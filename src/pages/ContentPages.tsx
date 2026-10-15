import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeading, Placeholder, TextLines } from '../components/Wireframe'

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

const activitySamples = [
  { id: 1, category: 'TALK', title: '活動記録サンプル 01' },
  { id: 2, category: 'LIVE', title: '活動記録サンプル 02' },
  { id: 3, category: 'OTHER', title: '制作記録サンプル 03' },
]

export function ActivitiesPage() {
  const [filter, setFilter] = useState('ALL')
  const [selected, setSelected] = useState(activitySamples[0])
  const dialog = useRef<HTMLDialogElement>(null)
  const shownActivities = activitySamples.filter((activity) => filter === 'ALL' || activity.category === filter)

  return (
    <main id="main-content" className="content-page activities-page">
      <PageHeading title="ACTIVITIES">一覧の全項目はサンプルです。実際の活動記録ではありません。</PageHeading>
      <div className="activity-filters" role="group" aria-label="活動カテゴリ">
        {['ALL', 'TALK', 'LIVE', 'OTHER'].map((category) => <button key={category} type="button" aria-pressed={filter === category} onClick={() => setFilter(category)}>{category}</button>)}
      </div>
      <div className="activity-list" aria-live="polite">
        {shownActivities.map((activity) => (
          <article className="activity-card" key={activity.id}>
            <Placeholder label="SAMPLE" className="activity-image" />
            <span className="activity-date" aria-label="日付未設定">YYYY.MM.DD</span>
            <div className="activity-copy"><h2>{activity.title}</h2><p className="muted">{activity.category} / サンプルの説明文</p><TextLines short /></div>
            <a className="button-link" href={`#sample-${activity.id}`} onClick={(event) => {
              event.preventDefault()
              setSelected(activity)
              dialog.current?.showModal()
            }} aria-label={`${activity.title}の仮詳細を表示`}>DETAIL →</a>
          </article>
        ))}
      </div>
      <dialog ref={dialog} className="wire-dialog" aria-labelledby="activity-detail-title">
        <h2 id="activity-detail-title">{selected.title}</h2>
        <p>サンプルの詳細表示です。実際の活動内容・日付は未設定です。</p>
        <form method="dialog"><button type="submit">閉じる</button></form>
      </dialog>
    </main>
  )
}

export function VoicePage() {
  return (
    <main id="main-content" className="content-page voice-page">
      <PageHeading title="VOICE">音声サンプルの表示エリア</PageHeading>
      <div className="voice-list">
        {[1, 2, 3].map((number) => (
          <article key={number} className="voice-card">
            <Placeholder label="IMAGE PLACEHOLDER" className="voice-image" />
            <div className="voice-copy"><h2>音声タイトル {String(number).padStart(2, '0')}（仮）</h2><p className="muted">音声の説明文が入ります。</p><TextLines short /></div>
            <span className="voice-duration">DURATION<br /><span className="muted">未設定</span></span>
            <button type="button" disabled aria-label={`音声サンプル${number}：音声未実装のため再生不可`}>PLAY</button>
          </article>
        ))}
      </div>
      <p className="page-note">音声素材・再生機能は未実装です。</p>
    </main>
  )
}

export function GoodsPage() {
  return (
    <main id="main-content" className="content-page goods-page">
      <PageHeading title="GOODS">外部Goodsサイトへのリンクエリア（URL未設定）</PageHeading>
      <div className="goods-grid">
        {[1, 2, 3, 4].map((number) => (
          <article key={number} className="goods-card">
            <Placeholder label="PRODUCT IMAGE" className="product-image" />
            <h2>商品名 {String(number).padStart(2, '0')}（仮）</h2>
            <p className="muted">価格未設定</p>
            <button type="button" disabled>外部サイトへ移動 ↗</button>
          </article>
        ))}
      </div>
      <div className="external-store"><button type="button" disabled>外部Goodsサイトへ移動 ↗</button><p className="muted">URLが未設定のため、現在は移動できません。</p></div>
      <p className="back-to-talk"><Link to="/">Back to Talk</Link></p>
    </main>
  )
}

export function NotFoundPage() {
  return <main id="main-content" className="content-page"><PageHeading title="ページが見つかりません" /><p className="back-to-talk"><Link to="/">Talkへ戻る</Link></p></main>
}
