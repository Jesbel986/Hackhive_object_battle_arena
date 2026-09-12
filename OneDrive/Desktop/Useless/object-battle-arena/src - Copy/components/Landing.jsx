import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Shell from './Shell'

/** Landing page: title, tagline and Enter the Arena. */
export default function Landing() {
  const navigate = useNavigate()
  const [soundOn, setSoundOn] = useState(true)

  return (
    <Shell className="arena-shell">
      <section className="landing landing-arena">
        <div className="cosmos" />
        <div className="landing-topline">
          <span>SYSTEM STATUS <i /> ONLINE</span>
        </div>
        <div className="landing-copy">
          <p className="kicker">WEB-CAM COMBAT SYSTEM // ONLINE</p>
          <h1 className="game-logo"><span>OBJECT BATTLE</span><span>ARENA</span></h1>
          <p className="tagline">Combat the unexpected.</p>
          <p className="lede">Turn everyday objects into fighters. Scan an object, assign its combat profile, and enter the arena.</p>
          <button className="primary-button arena-button" onClick={() => navigate('/scan/1')}>ENTER THE ARENA <span>→</span></button>
        </div>
        <div className="landing-combat-visual" aria-hidden="true">
          <div className="combat-emblem"><div className="lion-silhouette lion-orange"><i /><b /></div><div className="emblem-core"><span /><i /><i /><i /></div><div className="lion-silhouette lion-cyan"><i /><b /></div></div>
          <div className="emblem-readout"><span>VERSUS ARRAY // 01</span><b>RED <em>VS</em> BLUE</b><small>COMBATANTS STANDING BY</small></div>
        </div>
        <div className="landing-system-panel">
          <div className="panel-heading"><span>COMBAT SYSTEM</span><b><i /> ONLINE</b></div>
          <div className="system-readout"><span className="system-orbit" aria-hidden="true"><i /><i /><i /></span><div><p className="kicker">WEBCAM-POWERED ARENA</p><h2>READY TO SCAN</h2><p>Turn an everyday object into a combatant profile.</p></div></div>
          <div className="scan-progress"><div><span>OBJECT ENGINE</span><b>STANDBY</b></div><i><b /></i><small>CAMERA // AI PROFILE // ARENA DEPLOYMENT</small></div>
        </div>
        <button className="sound-toggle" onClick={() => setSoundOn((value) => !value)}>
          <span className={soundOn ? 'sound-bars' : 'sound-bars muted'}>▮▮▮</span> SOUND {soundOn ? 'ON' : 'OFF'}
        </button>
      </section>
      <section className="ticker">
        <span>01 / SHOW US YOUR OBJECT</span>
        <span>02 / GET A FIGHTER</span>
        <span>03 / SETTLE THE SCORE</span>
      </section>
    </Shell>
  )
}

