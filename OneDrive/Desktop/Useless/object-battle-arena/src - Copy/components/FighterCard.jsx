import { displayName, deriveStats } from '../services/fighterUtils'
import FighterCharacter from './FighterCharacter'

/** Small labelled percentage bar used for the uselessness stats. */
export function StatBar({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <div className="stat-track"><i style={{ width: `${value}%` }} /></div>
      <b>{value}%</b>
    </div>
  )
}

/** Compact uselessness stat block, reused on reveal + VS screens. */
export function UselessnessStats({ fighter }) {
  const stats = deriveStats(fighter)
  return (
    <div className="stat-list">
      <StatBar label="USELESSNESS" value={stats.uselessness} />
      <StatBar label="DRAMA" value={stats.drama} />
      <StatBar label="THREAT" value={stats.threat} />
      <StatBar label="CONFUSION" value={stats.confusion} />
      <StatBar label="REASON TO EXIST" value={stats.reason} />
    </div>
  )
}

/**
 * Fighter summary card. Shows the tiny-body character, the display name
 * (custom name always wins), AI title/ability and the uselessness stats.
 */
export default function FighterCard({ fighter, large = false, enemy = false, showStats = true, emote = null }) {
  if (!fighter) return null
  return (
    <article className={`fighter-card ${large ? 'large' : ''} ${enemy ? 'enemy' : ''}`} style={{ '--accent': fighter.accent || '#ef7654' }}>
      <div className="fighter-portrait">
        <span className="portrait-ring" />
        <FighterCharacter fighter={fighter} size="card" celebrate={Boolean(emote) || !enemy} />
        <span className="portrait-stamp">{enemy ? 'P02' : 'P01'}</span>
      </div>
      <div className="fighter-info">
        <p className="kicker">{fighter.title}</p>
        <h3>{displayName(fighter)}</h3>
        <p className="ability"><span>ABILITY</span> {fighter.ability}</p>
        <p className="ability-text">“{fighter.abilityText}”</p>
        {showStats && <UselessnessStats fighter={fighter} />}
      </div>
    </article>
  )
}
