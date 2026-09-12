import { useNavigate } from 'react-router-dom'
import Shell from './Shell'
import { OBJECTS } from '../services/fighterData'

const COLOR_NAMES = {
  red: ['RUBY RUMBLER', 'CRIMSON CRUSHER', 'RED RIOT', 'SCARLET SMASHER'],
  blue: ['CYAN CYCLONE', 'BLUE BRAWLER', 'AZURE ATTACKER', 'COBALT CRUSHER'],
}

/** Battle configuration: fight the bot or pass the keyboard. */
export default function Mode({ game, updateGame }) {
  const navigate = useNavigate()
  const color = game.playerOne?.color || 'red'
  const name = game.playerOne?.customName || COLOR_NAMES[color][0]
  const chooseBot = () => {
    const bot = OBJECTS[Math.floor(Math.random() * OBJECTS.length)]
    updateGame({ mode: 'bot', playerOne: { ...game.playerOne, color, customName: name }, playerTwo: { ...bot, color: color === 'red' ? 'blue' : 'red', customName: COLOR_NAMES[color === 'red' ? 'blue' : 'red'][0] } })
    navigate('/vs')
  }
  const chooseLocal = () => {
    updateGame({ mode: 'local', playerOne: { ...game.playerOne, color, customName: name }, playerTwo: null })
    navigate('/scan/2')
  }
  return (
    <Shell back="/fighter">
      <section className="mode-page">
        <div className="section-heading centered">
          <p className="kicker">BATTLE PROTOCOL // 01</p>
          <h2>BEFORE YOU ENTER<br /><em>THE ARENA.</em></h2>
          <p>One rule. One arena. One survivor. Listen up, fighter.</p>
        </div>
        <div className="briefing-layout">
          <section className="war-briefing">
            <div className="briefing-heading"><span>COMBAT BRIEFING</span><b>WARNING // READ CAREFULLY</b></div>
            <h3>THE RULES OF WAR</h3>
            <Brief number="01" title="ENTER THE CIRCLE">Step into the arena. Stay inside the boundary. Leave the circle and you lose.</Brief>
            <Brief number="02" title="PUSH OR BE PUSHED">Use your PUSH attack to knock your opponent outside the arena.</Brief>
            <Brief number="03" title="USE YOUR VOICE">Your microphone is a weapon. Shout, scream, clap or make noise to unleash a sound-powered attack.</Brief>
            <Brief number="04" title="SURVIVE">Reduce your opponent's strength and force them out before they do the same to you.</Brief>
          </section>
          <aside className="briefing-side">
            <div className="warning-block"><span>REMEMBER.</span><strong>THE ARENA DOESN'T CARE<br />WHO YOU ARE.</strong><p>STAY INSIDE.<br />HIT HARD.<br />MAKE NOISE.<br />DON'T GET PUSHED OUT.</p></div>
            <div className="weapon-panel"><div><span>YOUR WEAPONS</span><b>KEYBOARD INPUT</b></div><p><kbd>1 2 3</kbd> PLAYER 01 ATTACKS</p><p><kbd>5 6 7</kbd> PLAYER 02 ATTACKS</p><p><kbd>4 / 8</kbd> VOICE ATTACK</p></div>
          </aside>
        </div>
        <div className="briefing-footer"><div><span>NO SECOND CHANCES.</span><small>Once you enter the arena, the fight begins.</small></div><button className="primary-button fight-button" onClick={game.mode === 'local' ? chooseLocal : chooseBot}>ENTER THE ARENA <b>→</b></button></div>
        <div className="mode-grid briefing-modes">
          <button className="mode-card" onClick={chooseBot}><span className="mode-number">01</span><h3>FIGHT THE BOT</h3><span className="mode-link">SELECT BOT →</span></button>
          <button className="mode-card" onClick={chooseLocal}><span className="mode-number">02</span><h3>2 PLAYER LOCAL</h3><span className="mode-link">PASS THE OBJECT →</span></button>
        </div>
      </section>
    </Shell>
  )
}

function Brief({ number, title, children }) {
  return <article className="brief-item"><b>{number}</b><div><h4>{title}</h4><p>{children}</p></div></article>
}
