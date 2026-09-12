import { useLocation, useNavigate } from 'react-router-dom'

/** Shared page chrome: topbar, footer, back button. */
export default function Shell({ children, eyebrow = 'OBJECT BATTLE ARENA', back, className = '' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const pageName = location.pathname === '/' ? 'COMMAND CENTER' : location.pathname.replace('/', '').replace('-', ' ').toUpperCase()
  const navItems = [
    ['01', 'ARENA', '/'],
    ['02', 'SCANNER', '/scan/1'],
    ['03', 'HOW TO PLAY', '/mode'],
  ]
  return (
    <main className={`app-shell ${className}`}>
      <aside className="tactical-sidebar">
        <button className="sidebar-brand" onClick={() => navigate('/')}>
          <span className="sidebar-logo"><i /><i /><i /></span>
          <span><b>OBJECT BATTLE</b><strong>ARENA</strong></span>
        </button>
        <p className="sidebar-label">NAVIGATION</p>
        <nav aria-label="Primary navigation">
          {navItems.map(([number, label, path]) => <button key={path} className={location.pathname === path ? 'active' : ''} onClick={() => navigate(path)}><small>{number}</small><span>{label}</span></button>)}
        </nav>
        <div className="sidebar-system"><p className="sidebar-label">SYSTEM</p><span><i /> CAMERA <b>READY</b></span><span><i /> MIC <b>READY</b></span><span><i /> SOUND <b>ONLINE</b></span></div>
        <div className="sidebar-footer">SESSION 001<br /><b>LOCAL NETWORK</b></div>
      </aside>
      <div className="shell-viewport">
        <header className="topbar">
          <button className="wordmark" onClick={() => navigate('/')}>
            <span>{eyebrow}</span>
          </button>
          <span className="topbar-page">ARENA // {pageName}</span>
          {back && <button className="back-button" onClick={() => navigate(back)}>← BACK</button>}
          <span className="live-status"><i /> ONLINE // CAMERA READY // MIC READY</span>
        </header>
        {children}
        <footer className="footer">
          <span>OBA INDUSTRIES / OBJECTS ARE COMBAT-READY</span>
          <span>LOCAL PLAY • v2.0.0</span>
        </footer>
      </div>
    </main>
  )
}
