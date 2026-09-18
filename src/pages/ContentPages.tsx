import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeading, Placeholder, TextLines } from '../components/Wireframe'

export function ProfilePage() {
  return (
    <main id="main-content" className="content-page profile-page">
      <PageHeading title="PROFILE" />
      <div className="profile-grid">
        <Placeholder label="CHARACTER PLACEHOLDER" className="profile-character" />
        <section className="wire-card"><h2>BASIC PROFILE</h2>
          <dl className="profile-fields">
            {['Name', 'Birthday', 'Height', 'Illustrator', 'Live2D'].map((label) => <div key={label}><dt>{label}</dt><dd>未設定</dd></div>)}
          </dl>
        </section>
        <section className="wire-card"><h2>PERSONALITY</h2><p className="muted">性格：未設定</p><TextLines /></section>
        <section className="wire-card"><h2>LIKES / DISLIKES</h2>
          <dl className="profile-fields"><div><dt>Likes</dt><dd>未設定</dd></div><div><dt>Dislikes</dt><dd>未設定</dd></div></dl>
          <TextLines short />
        </section>
        <section className="wire-card"><h2>SPEECH STYLE</h2><p className="muted">話し方：未設定</p><TextLines /></section>
      </div>
      <section className="wire-card profile-detail"><h2>INTRODUCTION</h2><p className="muted">紹介文の表示エリア（未設定）</p><TextLines /></section>
      <section className="wire-card profile-detail"><h2>CHARACTER DETAILS</h2><p className="muted">詳細情報の表示エリア（未設定）</p><TextLines /></section>
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
