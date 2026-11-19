import { useLayoutEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Footer, Header, InformationDialog, type InfoTopic } from './components/Wireframe'
import { navigation } from './navigation'
import { ActivitiesPage, GoodsPage, NotFoundPage, ProfilePage, VoicePage } from './pages/ContentPages'
import { TalkPage, type PortraitMode } from './pages/TalkPage'
import './App.css'
import './pages/TalkDesign.css'

function App() {
  const [info, setInfo] = useState<InfoTopic | 'サイト情報' | null>(null)
  const [portraitMode, setPortraitMode] = useState<PortraitMode>(() => {
    try {
      const saved = localStorage.getItem('momoka-portrait-mode')
      return saved === 'neutral' || saved === 'tapioca' ? saved : 'auto'
    } catch {
      return 'auto'
    }
  })
  function choosePortrait(value: PortraitMode) {
    setPortraitMode(value)
    try { localStorage.setItem('momoka-portrait-mode', value) } catch { /* Keep the choice for this visit. */ }
  }
  const { pathname } = useLocation()
  const isTalk = pathname === '/'

  useLayoutEffect(() => {
    document.body.classList.toggle('talk-is-open', isTalk)
    const title = navigation.find((item) => item.path === pathname)?.label ?? 'Not found'
    document.title = `${title} | 小鳥遊ももか デザインプレビュー`
    document.getElementById('root')?.scrollTo(0, 0)
    window.scrollTo(0, 0)
    return () => document.body.classList.remove('talk-is-open')
  }, [isTalk, pathname])

  return (
    <div className={`site-shell ${isTalk ? 'site-shell-talk' : ''}`}>
      <a className="skip-link" href="#main-content">本文へ移動</a>
      <Header onInfo={() => setInfo('サイト情報')} />
      <Routes>
        <Route path="/" element={<TalkPage portraitMode={portraitMode} />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/voice" element={<VoicePage />} />
        <Route path="/goods" element={<GoodsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer onInfo={setInfo} />
      {info && <InformationDialog topic={info} choose={setInfo} close={() => setInfo(null)}
        portraitMode={portraitMode} choosePortrait={choosePortrait} />}
    </div>
  )
}

export default App
