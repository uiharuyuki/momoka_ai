import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './CatalogPages.css'

type ArtKind = 'film' | 'note' | 'voice' | 'stand' | 'keyring' | 'mug' | 'tote' | 'wallpaper' | 'card'

// Original schematic artwork: no third-party images or finished character art.
function CatalogArt({ kind, label, className = '' }: { kind: ArtKind; label: string; className?: string }) {
  return (
    <div className={`catalog-art catalog-art-${kind} ${className}`}>
      <span className="catalog-art-mark" aria-hidden="true">M / M</span>
      <svg viewBox="0 0 240 200" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">
        {kind === 'film' && <><rect x="32" y="42" width="176" height="116" rx="14" /><path d="m105 78 39 22-39 22Z" /><path d="M48 30h144M48 170h144" /></>}
        {kind === 'note' && <><path d="M67 26h83l28 28v120H67Z" /><path d="M150 26v30h28M87 84h67M87 105h67M87 126h43" /><circle cx="93" cy="58" r="6" /></>}
        {kind === 'voice' && <><circle cx="120" cy="100" r="73" /><circle cx="120" cy="100" r="53" strokeDasharray="3 5" /><circle cx="120" cy="100" r="12" /><path d="M120 27v18M120 155v18M47 100h18M175 100h18" /></>}
        {kind === 'stand' && <><ellipse cx="120" cy="170" rx="63" ry="12" /><path d="M82 156V84c0-31 17-56 38-56s38 25 38 56v72Z" /><circle cx="120" cy="72" r="21" /><path d="M86 151c2-40 15-56 34-56s32 16 34 56M102 158v10h36v-10" /></>}
        {kind === 'keyring' && <><circle cx="120" cy="33" r="17" /><path d="M120 50v15" /><rect x="67" y="64" width="106" height="106" rx="28" /><path d="m120 86 10 22 24 3-18 17 4 24-20-11-20 11 4-24-18-17 24-3Z" /></>}
        {kind === 'mug' && <><path d="M58 61h110v85a24 24 0 0 1-24 24H82a24 24 0 0 1-24-24Z" /><path d="M168 72h19c27 0 27 59 0 59h-19M85 35v13M112 27v21M139 35v13" /><path d="m89 127 12-28 12 28 12-28 12 28" /></>}
        {kind === 'tote' && <><path d="M61 66h118l10 111H51Z" /><path d="M92 79V53a28 28 0 0 1 56 0v26" /><path d="m87 139 16-35 17 35 17-35 16 35" /></>}
        {kind === 'wallpaper' && <><rect x="65" y="18" width="110" height="164" rx="17" /><path d="M103 31h34M73 149l36-46 24 25 34-42M73 166h94" /><circle cx="106" cy="71" r="15" /></>}
        {kind === 'card' && <><rect x="37" y="46" width="153" height="108" rx="10" transform="rotate(-8 113 100)" /><rect x="52" y="53" width="153" height="108" rx="10" fill="var(--art-fill)" /><circle cx="93" cy="99" r="22" /><path d="M131 84h52M131 104h52M131 124h32" /></>}
      </svg>
      <span className="catalog-art-label">{label}</span>
    </div>
  )
}

function CatalogHeader({ title, heading, children }: { title: string; heading: string; children: ReactNode }) {
  return <header className="catalog-heading"><div><p className="catalog-eyebrow">MOMOKA / {title}</p><h1>{title}</h1></div><div className="catalog-heading-copy"><h2>{heading}</h2><p>{children}</p></div></header>
}

function SampleNotice({ children }: { children: ReactNode }) {
  return <p className="catalog-sample-note"><span>WIREFRAME</span>{children}</p>
}

function Filters({ label, categories, value, onChange, count }: { label: string; categories: string[]; value: string; onChange: (value: string) => void; count: number }) {
  return <div className="catalog-toolbar"><div className="catalog-filters" role="group" aria-label={label}>{categories.map(category => <button key={category} type="button" aria-pressed={value === category} onClick={() => onChange(category)}>{category}</button>)}</div><p className="catalog-count" role="status">{count}<span>件のサンプル</span></p></div>
}

function ReturnToTalk() {
  return <div className="catalog-return"><p>気になったら、少し話していく？</p><Link className="button-link" to="/">ももかと話す <span aria-hidden="true">↗</span></Link></div>
}

function DetailDialog({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (!open) return
    const dialog = ref.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog?.showModal()
    return () => {
      dialog?.close()
      document.body.style.overflow = previousOverflow
    }
  }, [open])
  return <dialog ref={ref} className="catalog-dialog" aria-labelledby="catalog-dialog-title" onClose={onClose}>
    <div className="catalog-dialog-top"><span className="catalog-eyebrow">SAMPLE DETAIL</span><button type="button" onClick={() => ref.current?.close()}>閉じる <span aria-hidden="true">×</span></button></div>
    <h2 id="catalog-dialog-title">{title}</h2>{children}
  </dialog>
}

const activities: { id: string; category: string; title: string; description: string; kind: ArtKind }[] = [
  { id: 'a1', category: 'お知らせ', title: 'はじめまして、小鳥遊ももかです。', description: 'キャラクターの紹介と、サイトでできることを伝えるお知らせ。', kind: 'note' },
  { id: 'a2', category: '動画', title: 'ももかを知る、短い自己紹介。', description: '最初の出会いになる、自己紹介動画の掲載枠です。', kind: 'film' },
  { id: 'a3', category: '制作ノート', title: 'いつもの表情が、できるまで。', description: '表情やポーズの制作過程を紹介する記事の掲載枠です。', kind: 'note' },
  { id: 'a4', category: '動画', title: '声で届ける、ひとこと。', description: '短いボイスや映像を紹介する記事の掲載枠です。', kind: 'film' },
  { id: 'a5', category: 'お知らせ', title: '新しいコレクションのこと。', description: 'Goodsの企画を紹介するお知らせの掲載枠です。', kind: 'stand' },
  { id: 'a6', category: '制作ノート', title: 'この場所に込めたもの。', description: 'サイトづくりの考え方を伝える制作記事の掲載枠です。', kind: 'note' },
]

export function ActivitiesPage() {
  const [filter, setFilter] = useState('すべて')
  const [selected, setSelected] = useState<(typeof activities)[number] | null>(null)
  const shown = activities.filter(item => filter === 'すべて' || item.category === filter)
  const featured = activities[0]
  return <main id="main-content" className="content-page catalog-page activities-page">
    <CatalogHeader title="ACTIVITIES" heading="ももかの、いままでとこれから。">お知らせも、動画も、制作のひとこまも。ここから。</CatalogHeader>
    <SampleNotice>活動内容・タイトルはすべて仮です。実際の公開・開催を示すものではありません。</SampleNotice>
    <section className="activity-feature" aria-labelledby="activity-feature-title">
      <CatalogArt kind="film" label="FEATURE VISUAL / 16:9" />
      <div className="feature-copy"><p className="catalog-eyebrow">PICK UP / 掲載イメージ</p><h2 id="activity-feature-title">{featured.title}</h2><p>{featured.description}</p><button className="catalog-primary" type="button" onClick={() => setSelected(featured)}>記事を読む <span aria-hidden="true">↗</span></button></div>
    </section>
    <section className="catalog-section" aria-labelledby="activity-list-title">
      <div className="catalog-section-title"><h2 id="activity-list-title">活動をたどる</h2><span>ALL ACTIVITIES</span></div>
      <Filters label="活動カテゴリ" categories={['すべて', 'お知らせ', '動画', '制作ノート']} value={filter} onChange={setFilter} count={shown.length} />
      <div className="activity-grid">{shown.map(item => <article className="activity-card" key={item.id}>
        <CatalogArt kind={item.kind} label="THUMBNAIL / 16:9" />
        <div className="activity-card-copy"><div className="catalog-meta"><span className="catalog-tag">{item.category}</span><span>日付未定</span></div><h3>{item.title}</h3><p>{item.description}</p><button className="catalog-text-button" type="button" onClick={() => setSelected(item)} aria-label={`${item.title}のサンプル詳細`}>記事を読む <span aria-hidden="true">↗</span></button></div>
      </article>)}</div>
    </section>
    <ReturnToTalk />
    <DetailDialog open={selected !== null} title={selected?.title ?? ''} onClose={() => setSelected(null)}>
      {selected && <><div className="catalog-meta"><span className="catalog-tag">{selected.category}</span><span>サンプル / 日付未定</span></div><CatalogArt kind={selected.kind} label="ARTICLE VISUAL / SAMPLE" className="article-detail-art" /><p>{selected.description}</p><p>記事本文の表示イメージです。実際の活動内容、日付、動画やリンクは、公開する素材が決まってから設定します。</p><p className="catalog-inline-note">実際の活動記録ではありません。</p></>}
    </DetailDialog>
  </main>
}

const voices = [
  { id: 'v1', category: 'あいさつ', title: '少し、話していく？', description: 'はじめて訪れた人に向けた、短いあいさつ。', script: '少し、話していく？　急がなくていいから。' },
  { id: 'v2', category: 'あいさつ', title: 'また、ここで。', description: '会話を終えるときの、ささやかなひとこと。', script: 'うん。また話そう。気が向いたときでいいよ。' },
  { id: 'v3', category: '気持ち', title: 'ちょっと、照れる。', description: '褒められたときの、照れ隠しのひとこと。', script: 'そんなに言われると、ちょっと照れるんだけど。' },
  { id: 'v4', category: '気持ち', title: 'ありがとう。', description: '嬉しい気持ちを、短い言葉に。', script: 'ありがとう。……ちゃんと、嬉しいよ。' },
  { id: 'v5', category: 'シチュエーション', title: 'ひと休みしよ。', description: '作業の合間に聴く、休憩の誘い。', script: 'いったん、ひと休みしよ。続きはそのあとで。' },
  { id: 'v6', category: 'シチュエーション', title: '今日は、ここまで。', description: '一日の終わりに添える、静かなひとこと。', script: '今日は、ここまでにしよ。おつかれさま。' },
]

export function VoicePage() {
  const [filter, setFilter] = useState('すべて')
  const [selectedId, setSelectedId] = useState(voices[0].id)
  const spotlight = useRef<HTMLElement>(null)
  const selected = voices.find(voice => voice.id === selectedId) ?? voices[0]
  const shown = voices.filter(voice => filter === 'すべて' || voice.category === filter)
  function chooseVoice(id: string) {
    setSelectedId(id)
    spotlight.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
    spotlight.current?.focus({ preventScroll: true })
  }
  return <main id="main-content" className="content-page catalog-page voice-page">
    <CatalogHeader title="VOICE" heading="声で、もう少し近くに。">あいさつ、気持ち、何気ない場面。好きなひとことから。</CatalogHeader>
    <SampleNotice>タイトル・台詞は仮のサンプルです。音源未登録のため、再生はできません。</SampleNotice>
    <section ref={spotlight} tabIndex={-1} className="voice-spotlight" aria-labelledby="voice-selected-title">
      <CatalogArt kind="voice" label="VOICE JACKET / SAMPLE" />
      <div className="voice-player-copy"><p className="catalog-eyebrow">SELECTED VOICE / {selected.category}</p><h2 id="voice-selected-title" aria-live="polite">{selected.title}</h2><p>{selected.description}</p>
        <div className="voice-player"><button className="voice-play" type="button" disabled aria-label="再生：音源未登録"><span aria-hidden="true">▶</span></button><div className="voice-progress"><label className="visually-hidden" htmlFor="voice-seek">再生位置（音源未登録）</label><input id="voice-seek" className="voice-seek" type="range" min="0" max="100" value="0" disabled readOnly /><div className="voice-time"><span>--:-- / --:--</span><span>音源準備中</span></div></div></div>
        <details className="voice-script" key={selected.id}><summary>台詞例を見る</summary><p>「{selected.script}」</p><small>台詞は確認用の文案です。収録済みの音声ではありません。</small></details>
      </div>
    </section>
    <section className="catalog-section" aria-labelledby="voice-library-title"><div className="catalog-section-title"><h2 id="voice-library-title">気分にあう、ひとことを。</h2><span>VOICE LIBRARY</span></div>
      <Filters label="音声カテゴリ" categories={['すべて', 'あいさつ', '気持ち', 'シチュエーション']} value={filter} onChange={setFilter} count={shown.length} />
      <div className="voice-list">{shown.map(voice => <article className={`voice-card${voice.id === selected.id ? ' is-selected' : ''}`} key={voice.id}>
        <span className="voice-number" aria-hidden="true">{String(voices.indexOf(voice) + 1).padStart(2, '0')}</span><div className="voice-copy"><span className="catalog-eyebrow">{voice.category}</span><h3>{voice.title}</h3><p>サンプル / 音源未登録</p></div><button className="voice-select" type="button" onClick={() => chooseVoice(voice.id)} aria-label={`${voice.title}を選ぶ`} aria-pressed={voice.id === selected.id}><span aria-hidden="true">↗</span></button>
      </article>)}</div>
    </section>
    <p className="catalog-inline-note">自動再生・リアルタイム音声生成は行いません。音声の公開時は、この場所から試聴できます。</p>
    <ReturnToTalk />
  </main>
}

const products: { id: string; category: string; title: string; description: string; kind: ArtKind; views: string[] }[] = [
  { id: 'g1', category: 'アクリル', title: 'アクリルスタンド', description: '机の片隅に置ける、基本衣装の立ち姿を使ったグッズ案。', kind: 'stand', views: ['正面', '裏面'] },
  { id: 'g2', category: 'アクリル', title: 'アクリルキーホルダー', description: 'バッグなどにつけられる、小さなモチーフのグッズ案。', kind: 'keyring', views: ['正面', '裏面'] },
  { id: 'g3', category: '日用品', title: 'マグカップ', description: 'ひと休みの時間に使える、ワンポイントのグッズ案。', kind: 'mug', views: ['正面', '裏面'] },
  { id: 'g4', category: '日用品', title: 'トートバッグ', description: '普段の持ち歩きに使える、シンプルなグッズ案。', kind: 'tote', views: ['正面', '裏面'] },
  { id: 'g5', category: 'デジタル', title: 'スマートフォン壁紙', description: 'スマートフォン向けのデジタルアイテム案。', kind: 'wallpaper', views: ['全体', '使用イメージ'] },
  { id: 'g6', category: 'デジタル', title: 'デジタルメッセージカード', description: 'イラストと短い言葉を組み合わせたデジタルアイテム案。', kind: 'card', views: ['全体', '使用イメージ'] },
]

export function GoodsPage() {
  const [filter, setFilter] = useState('すべて')
  const [selected, setSelected] = useState<(typeof products)[number] | null>(null)
  const [view, setView] = useState('正面')
  const shown = products.filter(item => filter === 'すべて' || item.category === filter)
  function showProduct(item: (typeof products)[number]) { setView(item.views[0]); setSelected(item) }
  return <main id="main-content" className="content-page catalog-page goods-page">
    <CatalogHeader title="GOODS" heading="いつもの場所に、ももかを。">手元に置きたくなるものを、少しずつ。</CatalogHeader>
    <SampleNotice>商品はすべて企画・表示サンプルです。価格や仕様は未定で、購入はできません。</SampleNotice>
    <section className="goods-collection" aria-labelledby="goods-collection-title"><div className="collection-copy"><p className="catalog-eyebrow">COLLECTION 01 / 企画イメージ</p><h2 id="goods-collection-title">そばに置く、<br />小さなももか。</h2><p>毎日に馴染むものから。<br />基本ビジュアルを使ったコレクション案。</p><a className="button-link catalog-primary" href="#goods-items" onClick={event => { event.preventDefault(); document.getElementById('goods-items')?.scrollIntoView({ behavior: 'instant' }); document.getElementById('goods-items')?.focus({ preventScroll: true }) }}>アイテムを見る <span aria-hidden="true">↓</span></a></div><div className="collection-art"><CatalogArt kind="stand" label="ACRYLIC STAND" /><CatalogArt kind="mug" label="MUG" /></div></section>
    <section id="goods-items" tabIndex={-1} className="catalog-section" aria-labelledby="goods-list-title"><div className="catalog-section-title"><h2 id="goods-list-title">アイテム一覧</h2><span>ALL ITEMS</span></div><Filters label="商品カテゴリ" categories={['すべて', 'アクリル', '日用品', 'デジタル']} value={filter} onChange={setFilter} count={shown.length} />
      <div className="goods-grid">{shown.map(item => <article className="goods-card" key={item.id}><CatalogArt kind={item.kind} label="PRODUCT IMAGE / SAMPLE" className="product-image" /><div className="goods-card-copy"><span className="catalog-eyebrow">{item.category} / 企画中</span><h3>{item.title}</h3><p className="goods-price">価格未定</p><button className="catalog-text-button" type="button" onClick={() => showProduct(item)} aria-label={`${item.title}のサンプル詳細`}>詳細を見る <span aria-hidden="true">↗</span></button></div></article>)}</div>
    </section>
    <section className="goods-store" aria-labelledby="goods-store-title"><div><p className="catalog-eyebrow">EXTERNAL GOODS DEMO</p><h2 id="goods-store-title">外部Goodsサイトを見る。</h2><p>新しいタブでショップのワイヤーを開きます。実際の購入はできません。</p></div><a className="button-link" href="https://uiharuyuki.github.io/momoka-goods-demo/" target="_blank" rel="noopener noreferrer">外部Goodsサイトへ <span aria-hidden="true">↗</span></a></section>
    <ReturnToTalk />
    <DetailDialog open={selected !== null} title={selected?.title ?? ''} onClose={() => setSelected(null)}>{selected && <div className="product-detail"><div><CatalogArt kind={selected.kind} label={`${view} / 仮画像`} className={`product-detail-art${view === selected.views[1] ? ' alternate-view' : ''}`} /><div className="product-views" role="group" aria-label="商品画像の切替">{selected.views.map(option => <button type="button" key={option} aria-pressed={view === option} onClick={() => setView(option)}>{option}</button>)}</div></div><div className="product-detail-copy"><span className="catalog-tag">{selected.category} / サンプル</span><p>{selected.description}</p><dl><div><dt>価格</dt><dd>未定</dd></div><div><dt>サイズ・仕様</dt><dd>未定</dd></div><div><dt>販売先</dt><dd>準備中</dd></div></dl><button type="button" disabled>販売準備中</button><p className="catalog-inline-note">企画と形状の確認用です。実際の商品・完成画像ではありません。</p></div></div>}</DetailDialog>
  </main>
}
