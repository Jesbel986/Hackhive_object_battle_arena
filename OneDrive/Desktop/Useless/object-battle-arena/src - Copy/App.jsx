import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { preloadBackgroundRemoval } from './services/clipartService'
import Landing from './components/Landing'
import Scanner from './components/Scanner'
import Reveal from './components/Reveal'
import Mode from './components/Mode'
import Vs from './components/Vs'
import Battle from './components/Battle'
import Result from './components/Result'
import './App.css'
import './arena.css'
import './tactical.css'

// Single source of truth for everything that must survive navigation:
// playerOne, playerTwo, mode, result.
const DEFAULTS = { playerOne: null, playerTwo: null, mode: null, result: null }

function loadInitialState() {
  try {
    const saved = window.sessionStorage.getItem('oba-game')
    if (saved) return { ...DEFAULTS, ...JSON.parse(saved) }
  } catch { /* private mode / quota — fall through to defaults */ }
  return DEFAULTS
}

export default function App() {
  const [game, setGame] = useState(loadInitialState)

  // Persist so a route change, refresh or accidental back-navigation never
  // wipes scanned fighters mid-tournament.
  useEffect(() => {
    try { window.sessionStorage.setItem('oba-game', JSON.stringify(game)) } catch { /* ignore */ }
  }, [game])

  useEffect(() => { preloadBackgroundRemoval() }, [])

  const updateGame = (changes) => setGame((current) => ({ ...current, ...changes }))

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/scan/:player" element={<ScannerRoute game={game} updateGame={updateGame} />} />
        <Route path="/fighter" element={<Reveal game={game} />} />
        <Route path="/mode" element={<Mode game={game} updateGame={updateGame} />} />
        <Route path="/vs" element={<Vs game={game} />} />
        <Route path="/battle" element={<Battle game={game} updateGame={updateGame} />} />
        <Route path="/result" element={<Result game={game} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

/** Reads :player from the router (the old code parsed window.location). */
function ScannerRoute({ game, updateGame }) {
  const { player } = useParams()
  return <Scanner game={game} updateGame={updateGame} player={player} />
}
