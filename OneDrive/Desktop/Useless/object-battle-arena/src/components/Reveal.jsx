import { useNavigate } from 'react-router-dom'
import Shell from './Shell'
import FighterCard from './FighterCard'
import { displayName } from '../services/fighterUtils'

/** P1 fighter reveal. Shown after scanner confirm, before mode select. */
export default function Reveal({ game }) {
  const navigate = useNavigate()
  const fighter = game.playerOne
  if (!fighter) {
    return (
      <Shell back="/scan/1">
        <section className="vibe-loading-screen">
          <div className="loading-orbit" />
          <h2>VIBE CHECKING...</h2>
        </section>
      </Shell>
    )
  }
  return (
    <Shell back="/scan/1">
      <section className="fighter-page reveal-page">
        <div className="reveal-burst" />
        <div className="section-heading centered reveal-heading">
          <p className="kicker">IDENTITY CONFIRMED / PLAYER 01</p>
          <h2>MEET YOUR<br /><em>FIGHTER.</em></h2>
        </div>
        <FighterCard fighter={fighter} large />
        <p className="reveal-caption">“{displayName(fighter)}” HAS ENTERED THE LEGENDS.</p>
        <button className="primary-button continue-button" onClick={() => navigate('/mode')}>CHOOSE OPPONENT <span>→</span></button>
      </section>
    </Shell>
  )
}
