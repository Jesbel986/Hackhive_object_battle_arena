import { displayName } from '../services/fighterUtils'

/**
 * The tiny arcade fighter: the scanned object becomes an oversized head,
 * sitting on a small cartoon body (original CSS shapes only).
 *
 * pose: '' | 'punch' | 'kick' | 'special' | 'shout' | 'hit' | 'miss' | 'critical'
 * poseKey: change this number to replay the same pose animation.
 */
export default function FighterCharacter({ fighter, pose = '', poseKey = 0, flipped = false, fallen = false, celebrate = false, size = 'arena' }) {
  const accent = fighter?.accent || '#ef7654'
  const classes = [
    'fighter-character',
    size === 'card' ? 'size-card' : 'size-arena',
    pose ? `pose-${pose}` : 'pose-idle',
    flipped ? 'flipped' : '',
    fallen ? 'fallen' : '',
    celebrate ? 'celebrate' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={classes} style={{ '--fighter-accent': accent }} data-pose-key={poseKey}>
      <div className="fighter-rig">
        <div className="fighter-head">
          {fighter?.image
            ? <img src={fighter.image} alt={`${displayName(fighter)} head`} draggable="false" />
            : <span className="fighter-head-emoji">{fighter?.icon || '◆'}</span>}
          {fallen && <span className="defeat-tears" aria-hidden="true"><i /><i /></span>}
        </div>
        <div className="fighter-neck" />
        <div className="fighter-torso">
          <span className="fighter-belt" />
        </div>
        <div className="fighter-arm left"><span className="fighter-fist" /></div>
        <div className="fighter-arm right"><span className="fighter-fist" /></div>
        <div className="fighter-leg left"><span className="fighter-shoe" /></div>
        <div className="fighter-leg right"><span className="fighter-shoe" /></div>
      </div>
      <span className="fighter-shadow" />
    </div>
  )
}
