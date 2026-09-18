import { useLayoutEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Footer, Header } from './components/Wireframe'
import { navigation } from './navigation'
import { ActivitiesPage, GoodsPage, NotFoundPage, ProfilePage, VoicePage } from './pages/ContentPages'
import { TalkPage } from './pages/TalkPage'
import './App.css'

function App() {
  const { pathname } = useLocation()
  const isTalk = pathname === '/'

  useLayoutEffect(() => {
    document.body.classList.toggle('talk-is-open', isTalk)
    const title = navigation.find((item) => item.path === pathname)?.label ?? 'Not found'
    document.title = `${title} | ワイヤープロトタイプ`
    window.scrollTo(0, 0)
    return () => document.body.classList.remove('talk-is-open')
  }, [isTalk, pathname])

  return (
    <div className={`site-shell ${isTalk ? 'site-shell-talk' : ''}`}>
      <a className="skip-link" href="#main-content">本文へ移動</a>
      <Header />
      <Routes>
        <Route path="/" element={<TalkPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/voice" element={<VoicePage />} />
        <Route path="/goods" element={<GoodsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
