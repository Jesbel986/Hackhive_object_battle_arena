import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Shell from './Shell'
import FighterCharacter from './FighterCharacter'
import { OBJECTS } from '../services/fighterData'
import { buildMoves, deriveStats, displayName } from '../services/fighterUtils'
import { playCombatSound, setCombatAudioMuted, speakWarLine, stopCombatAudio } from '../services/combatAudio'

const INITIAL_POSITIONS = { one: { x: 0.29, y: 0.5 }, two: { x: 0.71, y: 0.5 } }

export default function Battle({ game, updateGame }) {
  const navigate = useNavigate()
  const p1 = useMemo(() => game.playerOne || { ...OBJECTS[0], color: 'red', customName: 'RUBY RUMBLER' }, [game.playerOne])
  const p2 = useMemo(() => game.playerTwo || { ...OBJECTS[2], color: 'blue', customName: 'CYAN CYCLONE' }, [game.playerTwo])
  const local = game.mode === 'local'
  const moves = useMemo(() => ({ one: buildMoves(p1), two: buildMoves(p2) }), [p1, p2])
  const [positions, setPositions] = useState(INITIAL_POSITIONS)
  const [poses, setPoses] = useState({ one: '', two: '' })
  const [shout, setShout] = useState(null)
  const [message, setMessage] = useState('GET READY...')
  const [fallen, setFallen] = useState(null)
  const [phase, setPhase] = useState('loading')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [round, setRound] = useState(1)
  const [roundScores, setRoundScores] = useState({ one: 0, two: 0 })
  const [cooldowns, setCooldowns] = useState({})
  const [edgeState, setEdgeState] = useState({ one: 'SAFE', two: 'SAFE' })
  const [impact, setImpact] = useState(null)
  const [dialogue, setDialogue] = useState(null)
  const [soundOn, setSoundOn] = useState(true)
  const [stats, setStats] = useState({ one: { knockbacks: 0, abilities: 0, shouts: 0, nearFalls: 0 }, two: { knockbacks: 0, abilities: 0, shouts: 0, nearFalls: 0 } })
  const stateRef = useRef({ positions: INITIAL_POSITIONS, velocity: { one: { x: 0, y: 0 }, two: { x: 0, y: 0 } }, scores: { one: 0, two: 0 }, over: false })
  const timersRef = useRef([])
  const roundTimerRef = useRef(null)
  const micRef = useRef(null)
  const previousEdgeRef = useRef({ one: 'SAFE', two: 'SAFE' })
  const dialogueTimerRef = useRef(null)
  const dialogueLines = useMemo(() => ({
    hit: ['HEY! WATCH IT!', 'BRO, SERIOUSLY?', 'THAT ACTUALLY HURT.'],
    strong: ['BOOM!', 'DID YOU SEE THAT?', 'CRITICAL BONK!'],
    win: ['EASY.', "WHO'S NEXT?", 'GG.'],
    lose: ["WAIT... I'M NOT READY!", 'THIS WAS NOT THE PLAN.', 'OKAY, YOU WIN.'],
  }), [])

  const showDialogue = useCallback((player, lines) => {
    setDialogue({ player, text: lines[Math.floor(Math.random() * lines.length)] })
    if (dialogueTimerRef.current) clearTimeout(dialogueTimerRef.current)
    dialogueTimerRef.current = window.setTimeout(() => setDialogue(null), 1100)
  }, [])

  useEffect(() => { setCombatAudioMuted(!soundOn) }, [soundOn])
  useEffect(() => () => { setCombatAudioMuted(false); if (dialogueTimerRef.current) clearTimeout(dialogueTimerRef.current) }, [])

  useEffect(() => {
    if (phase !== 'loading') return undefined
    let progress = 0
    const progressTimer = window.setInterval(() => {
      progress = Math.min(100, progress + 2)
      setLoadingProgress(progress)
      if (progress === 100) {
        window.clearInterval(progressTimer)
        window.setTimeout(() => setPhase('intro'), 420)
      }
    }, 52)
    return () => window.clearInterval(progressTimer)
  }, [phase])

  useEffect(() => {
    if (phase !== 'intro') return undefined
    playCombatSound('intro')
    speakWarLine()
    return () => stopCombatAudio()
  }, [phase])

  const finish = useCallback((winner, loser, finalScores) => {
    stateRef.current.over = true
    setFallen(loser)
    playCombatSound('heavy')
    playCombatSound('fall')
    playCombatSound('victory')
    showDialogue(winner, dialogueLines.win)
    setMessage(`${displayName(winner === 'one' ? p1 : p2)} OWNS THE ARENA`)
    timersRef.current.push(window.setTimeout(() => { updateGame({ result: { winner, loser, stats, roundScores: finalScores } }); navigate('/result') }, 1300))
  }, [dialogueLines, navigate, p1, p2, showDialogue, stats, updateGame])

  const endRound = useCallback((loser) => {
    if (stateRef.current.over || phase !== 'battle') return
    const winner = loser === 'one' ? 'two' : 'one'
    const finalScores = { ...stateRef.current.scores, [winner]: stateRef.current.scores[winner] + 1 }
    stateRef.current.scores = finalScores
    setRoundScores(finalScores)
    setFallen(loser)
    showDialogue(loser, dialogueLines.lose)
    setMessage(`${displayName(winner === 'one' ? p1 : p2)} TAKES ROUND ${round}`)
    if (round >= 3) {
      finish(finalScores.one > finalScores.two ? 'one' : 'two', finalScores.one > finalScores.two ? 'two' : 'one', finalScores)
      return
    }
    setPhase('round-break')
    playCombatSound('round')
    roundTimerRef.current = window.setTimeout(() => {
      stateRef.current.positions = { ...INITIAL_POSITIONS }
      stateRef.current.velocity = { one: { x: 0, y: 0 }, two: { x: 0, y: 0 } }
      setPositions({ ...INITIAL_POSITIONS })
      setEdgeState({ one: 'SAFE', two: 'SAFE' })
      setFallen(null)
      setRound((current) => current + 1)
      setPhase('battle')
      setMessage(`ROUND ${round + 1} - FIGHT!`)
    }, 1200)
  }, [dialogueLines, finish, p1, p2, phase, round, showDialogue])

  useEffect(() => {
    const previous = previousEdgeRef.current
    for (const key of ['one', 'two']) {
      const current = edgeState[key]
      if (current !== previous[key] && current !== 'SAFE') playCombatSound(current === 'CRITICAL' ? 'heavy' : 'warning')
    }
    previousEdgeRef.current = edgeState
  }, [edgeState])

  useEffect(() => {
    let frame
    const tick = () => {
      const current = stateRef.current
      if (!current.over && phase === 'battle') {
        const nextPositions = { one: { ...current.positions.one }, two: { ...current.positions.two } }
        const nextVelocity = { one: { ...current.velocity.one }, two: { ...current.velocity.two } }
        let loser = null
        for (const key of ['one', 'two']) {
          nextVelocity[key].x *= 0.91
          nextVelocity[key].y *= 0.91
          nextPositions[key].x += nextVelocity[key].x
          nextPositions[key].y += nextVelocity[key].y
          const radius = Math.hypot(nextPositions[key].x - 0.5, nextPositions[key].y - 0.5)
          const nextState = radius > 0.435 ? 'CRITICAL' : radius > 0.39 ? 'DANGER' : radius > 0.33 ? 'WARNING' : 'SAFE'
          setEdgeState((currentState) => currentState[key] === nextState ? currentState : { ...currentState, [key]: nextState })
          if (radius > 0.47) loser = key
        }
        current.positions = nextPositions
        current.velocity = nextVelocity
        setPositions(nextPositions)
        if (loser) endRound(loser)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(frame); micRef.current?.() }
  }, [endRound, phase])

  useEffect(() => () => {
    roundTimerRef.current && clearTimeout(roundTimerRef.current)
    timersRef.current.forEach(clearTimeout)
    micRef.current?.()
  }, [])

  useEffect(() => {
    if (phase !== 'intro') return undefined
    const sequence = [
      [700, `${displayName(p1)} ENTERS THE ARENA`],
      [1700, `${displayName(p2)} WANTS THE SMOKE`],
      [2700, '3...'], [3500, '2...'], [4300, '1...'], [5100, 'FIGHT!'],
    ]
    const timers = sequence.map(([delay, text]) => window.setTimeout(() => setMessage(text), delay))
    const banterOne = window.setTimeout(() => showDialogue('one', ['YOU REALLY WANNA FIGHT ME?', "LET'S DO THIS."]), 800)
    const banterTwo = window.setTimeout(() => showDialogue('two', ['THIS IS GOING TO BE EMBARRASSING.']), 1850)
    const start = window.setTimeout(() => setPhase('battle'), 5750)
    return () => { timers.forEach(clearTimeout); clearTimeout(banterOne); clearTimeout(banterTwo); clearTimeout(start) }
  }, [p1, p2, phase, showDialogue])

  const push = useCallback((attacker, move = moves[attacker][0], source = 'ABILITY') => {
    if (phase !== 'battle' || stateRef.current.over || cooldowns[`${attacker}-${move.id}`]) return
    const defender = attacker === 'one' ? 'two' : 'one'
    const from = stateRef.current.positions[attacker]
    const to = stateRef.current.positions[defender]
    const distance = Math.max(0.01, Math.hypot(to.x - from.x, to.y - from.y))
    stateRef.current.velocity[defender] = { x: ((to.x - from.x) / distance) * move.force, y: ((to.y - from.y) / distance) * move.force }
    setPoses((current) => ({ ...current, [attacker]: move.pose, [defender]: move.force > 0.06 ? 'critical' : 'hit' }))
    const strong = source === 'SHOUT' || move.force > 0.06
    playCombatSound(strong ? 'heavy' : 'hit')
    if (strong) showDialogue(attacker, dialogueLines.strong)
    else showDialogue(defender, dialogueLines.hit)
    setImpact({ id: Date.now(), target: defender, position: { ...to }, strong, shout: source === 'SHOUT' })
    setMessage(source === 'SHOUT' ? 'BOOM! THE SHOUT HIT!' : `${displayName(attacker === 'one' ? p1 : p2)}: ${move.name}`)
    setCooldowns((current) => ({ ...current, [`${attacker}-${move.id}`]: move.cooldown }))
    setStats((current) => ({ ...current, [attacker]: { ...current[attacker], knockbacks: current[attacker].knockbacks + 1, abilities: current[attacker].abilities + 1, shouts: current[attacker].shouts + (source === 'SHOUT' ? 1 : 0) } }))
    timersRef.current.push(window.setTimeout(() => { setPoses({ one: '', two: '' }); setImpact(null) }, strong ? 700 : 520))
  }, [cooldowns, dialogueLines, moves, p1, p2, phase, showDialogue])

  const startShout = useCallback((attacker) => {
    if (phase !== 'battle' || stateRef.current.over || shout || cooldowns[`${attacker}-shout`]) return
    if (!navigator.mediaDevices?.getUserMedia) { setMessage('MIC NOT AVAILABLE - PUSH STILL WORKS'); return }
    setShout({ player: attacker, volume: 0, countdown: 3 })
    playCombatSound('warning')
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (!AudioContextClass) throw new Error('audio')
      const context = new AudioContextClass()
      const analyser = context.createAnalyser()
      analyser.fftSize = 256
      context.createMediaStreamSource(stream).connect(analyser)
      const data = new Uint8Array(analyser.fftSize)
      const started = performance.now()
      let peak = 0
      const timer = window.setInterval(() => {
        analyser.getByteTimeDomainData(data)
        let sum = 0
        data.forEach((value) => { const sample = (value - 128) / 128; sum += sample * sample })
        const volume = Math.min(1, Math.sqrt(sum / data.length) * 3)
        peak = Math.max(peak, volume)
        const elapsed = performance.now() - started
        setShout({ player: attacker, volume, countdown: Math.max(1, Math.ceil((2600 - elapsed) / 1000)) })
        if (elapsed > 2600) {
          clearInterval(timer)
          stream.getTracks().forEach((track) => track.stop())
          context.close()
          setShout(null)
          push(attacker, { ...moves[attacker][3], force: moves[attacker][3].force + peak * 0.18 }, 'SHOUT')
        }
      }, 50)
      micRef.current = () => { clearInterval(timer); stream.getTracks().forEach((track) => track.stop()); context.close() }
    }).catch(() => { setShout(null); setMessage('MIC NOT AVAILABLE - PUSH STILL WORKS') })
  }, [cooldowns, moves, phase, push, shout])

  useEffect(() => {
    const timer = window.setInterval(() => setCooldowns((current) => Object.fromEntries(Object.entries(current).map(([key, value]) => [key, Math.max(0, value - 0.1)]).filter(([, value]) => value > 0))), 100)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const onKey = (event) => {
      const keyMap = {
        '1': ['one', 0], '2': ['one', 1], '3': ['one', 2], '4': ['one', 3],
        '5': ['two', 0], '6': ['two', 1], '7': ['two', 2], '8': ['two', 3],
      }
      const mapping = keyMap[event.key]
      if (!mapping) return
      event.preventDefault()
      const [player, moveIndex] = mapping
      const move = moves[player][moveIndex]
      if (move?.id === 'shout') startShout(player)
      else if (move) push(player, move)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [moves, push, startShout])

  useEffect(() => {
    if (local || phase !== 'battle' || fallen) return undefined
    const botTimer = window.setInterval(() => {
      const bot = stateRef.current.positions.two
      const target = stateRef.current.positions.one
      const botNearEdge = Math.hypot(bot.x - 0.5, bot.y - 0.5) > 0.36
      const targetNearEdge = Math.hypot(target.x - 0.5, target.y - 0.5) > 0.36
      const available = moves.two.filter((move) => !cooldowns[`two-${move.id}`])
      const move = available.find((candidate) => targetNearEdge && candidate.id !== 'impact') || available.find((candidate) => candidate.id === 'impact') || available[0]
      if (move && !botNearEdge) push('two', move, move.id === 'shout' ? 'SHOUT' : 'ABILITY')
    }, 900)
    return () => clearInterval(botTimer)
  }, [cooldowns, fallen, local, moves, phase, push])

  if (phase === 'loading') return <Shell><BattleLoading progress={loadingProgress} fighterOne={p1} fighterTwo={p2} /></Shell>

  return <Shell><section className={`physics-battle ${impact ? 'has-impact' : ''} ${shout ? 'is-shouting' : ''}`}>
    <div className="physics-hud"><Hud fighter={p1} side="left" /><div className="round-readout">ROUND <b>{round} / 3</b><small>{roundScores.one} - {roundScores.two}</small></div><Hud fighter={p2} side="right" /><button className="battle-sound-toggle" type="button" onClick={() => setSoundOn((value) => !value)}>{soundOn ? 'SOUND ON' : 'SOUND OFF'}</button></div>
    <div className="intro-stats"><strong>{message}</strong>{phase === 'intro' && <span>{displayName(message.includes(displayName(p2)) ? p2 : p1)} · POWER {deriveStats(message.includes(displayName(p2)) ? p2 : p1).threat}</span>}</div>
    <p className="battle-instruction">{phase === 'battle' ? 'PUSH THEM OUT. STAY INSIDE.' : ' '}</p>
    <div className={`physics-arena ${phase} ${impact?.strong ? 'impact-heavy' : impact ? 'impact-light' : ''} ${Object.values(edgeState).some((state) => state === 'DANGER' || state === 'CRITICAL') ? 'danger' : ''}`}><div className="arena-vines" aria-hidden="true" /><div className="arena-ring" /><div className="arena-grid" /><div className="arena-dust" aria-hidden="true" />
      <BattleFighter fighter={p1} side="left" position={positions.one} edge={edgeState.one} fallen={fallen === 'one'} celebrate={fallen === 'two'} pose={poses.one} intro={phase === 'intro'} />
      <BattleFighter fighter={p2} side="right" position={positions.two} edge={edgeState.two} fallen={fallen === 'two'} celebrate={fallen === 'one'} pose={poses.two} intro={phase === 'intro'} />
      {dialogue && <div className={`battle-dialogue ${dialogue.player}`} key={dialogue.text}>{dialogue.text}</div>}
      {impact && <ImpactBurst key={impact.id} position={impact.position} strong={impact.strong} shout={impact.shout} />}
      {shout && <div className="shout-overlay"><strong>MAKE SOME NOISE!</strong><span>{shout.countdown}...</span><div className="live-meter"><i style={{ width: `${shout.volume * 100}%` }} /></div><small>LOUDNESS {Math.round(shout.volume * 100)}%</small></div>}
    </div>
    <div className="battle-controls"><Control fighter={p1} player="one" moves={moves.one} cooldowns={cooldowns} disabled={Boolean(fallen) || phase !== 'battle'} /><Control fighter={p2} player="two" moves={moves.two} cooldowns={cooldowns} disabled={Boolean(fallen) || phase !== 'battle'} /></div>
  </section></Shell>
}

function ImpactBurst({ position, strong, shout }) {
  return <div className={`impact-burst ${strong ? 'strong' : ''} ${shout ? 'shout' : ''}`} style={{ left: `${position.x * 100}%`, top: `${position.y * 100}%` }} aria-hidden="true"><i /><i /><i /><i /><b /></div>
}

function BattleLoading({ progress, fighterOne, fighterTwo }) {
  const stage = progress < 20 ? 'BATTLE SYSTEMS INITIALIZING'
    : progress < 40 ? 'LOADING ARENA'
      : progress < 60 ? 'CALIBRATING COMBATANTS'
        : progress < 80 ? 'ACTIVATING WEAPON SYSTEMS'
          : progress < 100 ? 'FINALIZING MATCH' : 'MATCH INITIALIZED'
  const ready = progress === 100
  return <section className={`battle-loading ${ready ? 'ready' : ''}`} aria-live="polite">
    <div className="battle-loading-line top" /><div className="battle-loading-line bottom" />
    <div className="loading-corner-meta"><span>OBJECT BATTLE<br /><b>ARENA</b></span><span>BATTLE SESSION // 001</span></div>
    <div className="loading-center">
      <p className="loading-kicker">BATTLE PROTOCOL // INITIALIZING</p>
      <h1>LET THE WAR BEGIN</h1>
      <div className="loading-status"><span>{ready ? 'ARENA READY' : 'PREPARING THE ARENA'}</span><b>{progress}%</b></div>
      <div className="loading-track"><i style={{ width: `${progress}%` }} /></div>
      <p className="loading-stage">{stage}</p>
      <div className="loading-combatants"><span>PLAYER 01 / {displayName(fighterOne)}</span><b>VS</b><span>{displayName(fighterTwo)} / PLAYER 02</span></div>
    </div>
    <div className="loading-footer"><span>SYSTEM STATUS <b><i /> ONLINE</b></span><span>ARENA CONNECTION <b>STABLE</b></span></div>
  </section>
}

function BattleFighter({ fighter, side, position, edge, fallen, celebrate, pose, intro }) {
  return <div className={`physics-fighter ${side} ${intro ? 'intro-entry' : ''} ${fallen ? 'fallen' : ''} edge-${edge.toLowerCase()}`} style={{ left: `${position.x * 100}%`, top: `${position.y * 100}%` }}><div className="physics-name" style={{ '--team': fighter.color === 'blue' ? '#4d8dff' : '#ff4f5e' }}><span>{fighter.color?.toUpperCase()}</span><strong>{displayName(fighter)}</strong>{edge !== 'SAFE' && <small>⚠ {edge}</small>}</div><FighterCharacter fighter={fighter} flipped={side === 'right'} fallen={fallen} celebrate={celebrate} pose={pose} /></div>
}

function Hud({ fighter, side }) {
  return <div className={`physics-hud-player ${side}`} style={{ '--team': fighter.color === 'blue' ? '#4d8dff' : '#ff4f5e' }}><span>{fighter.color?.toUpperCase()} PLAYER</span><strong>{displayName(fighter)}</strong><i><b /></i></div>
}

function Control({ fighter, player, moves, cooldowns, disabled }) {
  const keyFor = (move) => move.key?.[player] || (move.id === 'shout' ? (player === 'one' ? '4' : '8') : '?')
  return <div className={`physics-control ${player}`}><span className="control-player">{fighter.color?.toUpperCase()} / {displayName(fighter)} · KEYBOARD ONLY</span><div aria-label={`${fighter.color} keyboard controls`}>{moves.slice(0, 3).map((move) => <div key={move.id} className={`control-move ${disabled ? 'inactive' : ''}`} aria-label={`${keyFor(move)} ${move.name}: ${move.detail}`}><kbd>{keyFor(move)}</kbd><b>{move.icon} {move.name}</b><small>{cooldowns[`${player}-${move.id}`] ? `${cooldowns[`${player}-${move.id}`].toFixed(1)}s cooldown` : move.detail}</small></div>)}<div className={`control-move ${disabled ? 'inactive' : ''}`} aria-label={`${keyFor(moves[3])} shout: ${moves[3].detail}`}><kbd>{keyFor(moves[3])}</kbd><b>🎤 SHOUT</b><small>{cooldowns[`${player}-shout`] ? `${cooldowns[`${player}-shout`].toFixed(1)}s cooldown` : moves[3].detail}</small></div></div></div>
}
