import { useNavigate } from 'react-router-dom'
import Shell from './Shell'
import FighterCard from './FighterCard'
import { OBJECTS } from '../services/fighterData'

/** Dramatic pre-battle screen. CPU label only ever appears in bot mode. */
export default function Vs({ game }) {
  const navigate = useNavigate()
  const one = game.playerOne || OBJECTS[0]
  const two = game.playerTwo || OBJECTS[2]
  const isBot = game.mode === 'bot'

  return (
    <Shell>
      <section className="vs-page">
        <p className="kicker centered">MATCH CONFIRMED / ROUND 01</p>
        <div className="vs-layout">
          <div className="vs-side left">
            <span className="player-label">PLAYER 01</span>
            <FighterCard fighter={one} emote="left" />
          </div>
          <div className="vs-mark">VS<span>READY?</span></div>
          <div className="vs-side right">
            <span className="player-label">{isBot ? 'CPU' : 'PLAYER 02'}</span>
            <FighterCard fighter={two} enemy emote="right" />
          </div>
        </div>
        <button className="primary-button fight-button" onClick={() => navigate('/battle')}>ENTER THE ARENA <span>→</span></button>
      </section>
    </Shell>
  )
}
