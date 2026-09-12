import { useNavigate } from 'react-router-dom'
import Shell from './Shell'
import FighterCharacter from './FighterCharacter'
import { OBJECTS } from '../services/fighterData'
import { displayName } from '../services/fighterUtils'

export default function Result({ game }) {
  const navigate = useNavigate()
  const result = game.result || { winner: 'one', loser: 'two', stats: {} }
  const one = game.playerOne || { ...OBJECTS[0], color: 'red', customName: 'RUBY RUMBLER' }
  const two = game.playerTwo || { ...OBJECTS[2], color: 'blue', customName: 'CYAN CYCLONE' }
  const winner = result.winner === 'one' ? one : two
  const loser = result.loser === 'one' ? one : two
  const color = winner.color || 'red'
  const winnerStats = result.stats?.[result.winner] || {}
  const loserStats = result.stats?.[result.loser] || {}
  const entertainment = [
    ['KNOCKBACKS', winnerStats.knockbacks || 0],
    ['ABILITIES USED', winnerStats.abilities || 0],
    ['SHOUTS', winnerStats.shouts || 0],
    ['TIMES ALMOST FELL', loserStats.nearFalls || 0],
    ['BRAIN CELLS USED', Math.max(1, 7 - (winnerStats.abilities || 0))],
  ]
  const confetti = Array.from({ length: 24 }, (_, index) => index)

  const teamColor = color === 'blue' ? '#4d8dff' : '#ff4f5e'

  return <Shell><section className={`victory-page ${color}`} style={{ '--winner-color': teamColor }}>
    <div className="confetti" aria-hidden="true">{confetti.map((piece) => <i key={piece} style={{ '--i': piece, '--x': `${(piece * 37) % 100}%`, '--delay': `${(piece % 8) * 0.12}s` }} />)}</div>
    <p className="kicker centered">THE ARENA HAS SPOKEN</p>
    <div className="victory-burst" aria-hidden="true" />
    <p className="victory-color">{color === 'red' ? '●' : '●'} {color.toUpperCase()}</p>
    <h1>{displayName(winner)}</h1>
    <div className="victory-word">WINS!</div>
    <p className="result-copy">{displayName(winner)} pushed them into oblivion.</p>
    <div className="result-stage"><div className="result-fighter winner"><span className="winner-trophy" aria-label="Trophy">🏆</span><FighterCharacter fighter={winner} size="card" celebrate /><span>{displayName(winner)}</span></div><div className="result-fighter loser"><FighterCharacter fighter={loser} size="card" fallen /><span>OUT OF THE CIRCLE</span></div></div>
    <div className="battle-result-stats" aria-label="Battle statistics">{entertainment.map(([label, value]) => <div key={label}><b>{value}</b><span>{label}</span></div>)}</div>
    <div className="result-actions"><button className="primary-button" onClick={() => navigate('/battle')}>REMATCH <span>↻</span></button><button className="secondary-button" onClick={() => navigate('/')}>BACK TO HOME</button></div>
  </section></Shell>
}
