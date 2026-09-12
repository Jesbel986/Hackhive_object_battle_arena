import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Shell from './Shell'
import { createObjectClipart } from '../services/clipartService'
import { generateVibeFighter } from '../services/aiVibeService'
import { buildFighterRecord, normalizeCustomName } from '../services/fighterUtils'
import CropEditor from '../components/CropEditor'
import FighterCharacter from '../components/FighterCharacter'

const CAPTURE_STEPS = [
  'BACKGROUND REMOVAL ONLINE.',
  'CUTTING OUT THE OBJECT...',
  'JUDGING YOUR OBJECT SILENTLY...',
  'APPLYING UNNECESSARY STATS...',
  'VIBE CHECK IN PROGRESS...',
]

/** Scanner for either player: camera OR upload → crop → cutout → vibe → name. */
export default function Scanner({ game, updateGame, player }) {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const scannerVideoRef = useRef(null)
  const streamRef = useRef(null)
  const stepTimerRef = useRef(null)
  const fileInputRef = useRef(null)

  const isPlayerTwo = player === '2'
  const currentPlayer = isPlayerTwo ? 'PLAYER 02' : 'PLAYER 01'
  const existingFighter = isPlayerTwo ? game.playerTwo : game.playerOne

  // Pipeline state: idle → camera → crop → processing → naming
  const [phase, setPhase] = useState(existingFighter ? 'naming' : 'idle')
  const [rawImage, setRawImage] = useState(existingFighter?.croppedImage || null)
  const [cutoutImage, setCutoutImage] = useState(existingFighter?.image || null)
  const [fighter, setFighter] = useState(existingFighter || null)
  const [customName, setCustomName] = useState(existingFighter?.customName || '')
  const [statusText, setStatusText] = useState(existingFighter ? 'FIGHTER ALREADY GENERATED. CONFIRM OR REPLACE IT.' : 'ACTIVATE THE CAMERA OR UPLOAD A PHOTO OF AN OBJECT.')
  const [busy, setBusy] = useState(false)

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  useEffect(() => () => {
    stopCamera()
    window.clearInterval(stepTimerRef.current)
  }, [stopCamera])

  const openCamera = async () => {
    stopCamera()
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatusText('CAMERA API UNAVAILABLE. UPLOAD AN IMAGE INSTEAD.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      setPhase('camera')
      setStatusText('CAMERA LIVE / GET THE OBJECT IN FRAME')
    } catch (error) {
      console.error('CAMERA ERROR:', error?.name, error?.message)
      const reason = error?.name === 'NotAllowedError' ? 'CAMERA PERMISSION BLOCKED.'
        : error?.name === 'NotFoundError' ? 'NO CAMERA DEVICE FOUND.'
          : error?.name === 'NotReadableError' ? 'CAMERA IS BUSY IN ANOTHER APP.' : 'CAMERA COULD NOT START.'
      setStatusText(`${reason} TRY UPLOADING AN IMAGE INSTEAD.`)
    }
  }

  const handleVideoRef = (node) => {
    videoRef.current = node
    if (node && streamRef.current && node.srcObject !== streamRef.current) {
      node.srcObject = streamRef.current
      node.play().catch(() => {})
    }
  }

  const handleScannerVideoRef = (node) => {
    scannerVideoRef.current = node
    if (node && streamRef.current && node.srcObject !== streamRef.current) {
      node.srcObject = streamRef.current
      node.play().catch(() => {})
    }
  }

  /** Grab the full video frame (muted preview is mirrored; store unmirrored). */
  const captureFrame = () => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    context.drawImage(video, 0, 0)
    setRawImage(canvas.toDataURL('image/jpeg', 0.9))
    stopCamera()
    setPhase('crop')
  }

  const handleUpload = (event) => {
    const file = event.target.files?.[0]
    event.target.value = '' // allow re-selecting the same file
    if (!file || !file.type.startsWith('image/')) {
      setStatusText('THAT FILE IS NOT AN IMAGE. TRY ANOTHER.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => { setRawImage(String(reader.result)); setPhase('crop') }
    reader.readAsDataURL(file)
  }

  const runProcessing = async (image) => {
    setPhase('processing')
    setBusy(true)
    window.clearInterval(stepTimerRef.current)
    let stepIndex = 0
    setStatusText(CAPTURE_STEPS[0])
    stepTimerRef.current = window.setInterval(() => {
      stepIndex = Math.min(stepIndex + 1, CAPTURE_STEPS.length - 1)
      setStatusText(CAPTURE_STEPS[stepIndex])
    }, 1100)

    let cutout
    try {
      cutout = await createObjectClipart(image)
    } catch (error) {
      console.error('CUTOUT FAILED, USING CROPPED FRAME:', error)
      setStatusText('CUTOUT FAILED / USING PLAIN FRAME')
      cutout = image
    }
    setCutoutImage(cutout)

    try {
      const vibe = await generateVibeFighter(image)
      if (!vibe) throw new Error('NO VIBE RETURNED')
      setFighter(buildFighterRecord({ vibe, image: cutout, keySuffix: `${player}-${Date.now()}` }))
      setPhase('naming')
      setStatusText('FIGHTER GENERATED. NAME IT IF YOU DARE.')
    } catch (error) {
      console.error('VIBE CHECK FAILED:', error)
      setStatusText('VIBE CHECK FAILED. GO BACK AND TRY AGAIN.')
      setPhase('crop')
      setBusy(false)
    } finally {
      window.clearInterval(stepTimerRef.current)
      setBusy(false)
    }
  }

  const confirmCrop = (croppedDataUrl) => {
    setRawImage(croppedDataUrl)
    runProcessing(croppedDataUrl)
  }

  const retake = () => {
    setRawImage(null)
    setCutoutImage(null)
    setFighter(null)
    setPhase('idle')
    setStatusText('ACTIVATE THE CAMERA OR UPLOAD A PHOTO OF AN OBJECT.')
  }

  /** Save the fighter (custom name included) and continue down the flow. */
  const confirmFighter = () => {
    const finalFighter = {
      ...fighter,
      color: isPlayerTwo ? (game.playerOne?.color === 'red' ? 'blue' : 'red') : (game.playerOne?.color || 'red'),
      customName: normalizeCustomName(customName),
    }
    updateGame(isPlayerTwo ? { playerTwo: finalFighter } : { playerOne: finalFighter })
    navigate(isPlayerTwo ? '/vs' : '/fighter')
  }

  const canConfirm = Boolean(fighter) && !busy

  return (
    <Shell back={isPlayerTwo ? '/mode' : '/'}>
      <section className="scanner-page">
        <div className="section-heading">
          <p className="kicker">{currentPlayer} / OBJECT SCANNER</p>
          <h2>WHAT ARE WE<br /><em>FIGHTING WITH?</em></h2>
          <p>Capture one frame, crop it tight, and we'll cut out the object and give it a fighter personality.</p>
        </div>

        <div className="scanner-layout">
          <div className="camera-window">
            <div className="corner tl" /><div className="corner tr" /><div className="corner bl" /><div className="corner br" />

            {phase === 'camera' && <video ref={handleVideoRef} autoPlay playsInline muted className="camera-video" />}
            {phase === 'camera' && <div className="camera-label"><span>● LIVE FEED</span><span>PIXEL HASH ENGINE</span></div>}

            {phase === 'crop' && rawImage && <CropEditor imageSrc={rawImage} onConfirm={confirmCrop} onCancel={retake} />}            {phase === 'processing' && cutoutImage && (
              <div className="clipart-stage processing-stage">
                <img className="clipart-preview" src={cutoutImage} alt="Processed object" />
                <span className="processing-beam" />
                <div className="processing-scanline" />
              </div>
            )}

            {(phase === 'naming') && fighter && (
              <div className="clipart-stage">
                <FighterCharacter fighter={fighter} size="card" celebrate />
              </div>
            )}

            {phase === 'idle' && (
              <div className="camera-placeholder">
                <span className="camera-glyph">◉</span>
                <strong>CAMERA READY</strong>
                <small>YOUR OBJECT WILL APPEAR HERE</small>
              </div>
            )}

            <canvas className="capture-canvas" />
          </div>

          <div className="scanner-side">
            <div className={`live-scanner-panel ${phase}`}>
              <div className="live-scanner-head"><span>OBJECT SCANNER // {currentPlayer.replace('PLAYER ', 'P')}</span><b><i /> {phase === 'camera' ? 'CAMERA ONLINE' : 'FRAME READY'}</b></div>
              <div className="live-scanner-view">
                {phase === 'camera' && <video ref={handleScannerVideoRef} autoPlay playsInline muted className="scanner-preview-video" />}
                {phase !== 'camera' && <div className="scanner-placeholder"><span className="scanner-reticle">+</span><strong>{phase === 'idle' ? 'CAMERA STANDBY' : phase === 'crop' ? 'CROP MODE ACTIVE' : 'SCANNER PROCESSING'}</strong><small>{phase === 'idle' ? 'ACTIVATE CAMERA TO BEGIN' : 'LEFT PANEL CONTROLS THE FRAME'}</small></div>}
                <span className="scanner-scan-line" />
                <span className="scanner-corner tl" /><span className="scanner-corner tr" /><span className="scanner-corner bl" /><span className="scanner-corner br" />
                <span className="scanner-frame-label">FRAME // {phase === 'camera' ? 'LIVE' : 'STANDBY'}</span>
              </div>
              <div className="scanner-instruction"><strong>GET YOUR OBJECT IN FRAME</strong><span>Point your camera at any everyday object.<br />We’ll turn it into your fighter.</span></div>
              <div className="scanner-readout"><span>CAMERA <b>{phase === 'camera' ? 'ONLINE' : 'READY'}</b></span><span>FRAME <b>{phase === 'camera' ? 'LIVE' : 'READY'}</b></span><span>PLAYER <b>{isPlayerTwo ? '02' : '01'}</b></span></div>
            </div>
            <div className="control-label">{statusText}</div>

            {phase === 'camera' && (
              <div className="scanner-actions">
                <button className="primary-button capture-button" onClick={captureFrame}>CAPTURE OBJECT</button>
                <button className="secondary-button" onClick={() => { stopCamera(); setPhase('idle') }}>CANCEL</button>
              </div>
            )}

            {phase === 'idle' && (
              <>
                <div className="scanner-actions">
                  <button className="primary-button" onClick={openCamera}>ACTIVATE CAMERA</button>
                  <button className="secondary-button" onClick={() => fileInputRef.current?.click()}>UPLOAD IMAGE</button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="visually-hidden-input" onChange={handleUpload} />
                </div>
                <p className="privacy-note">100% LOCAL PROCESSING</p>
                <div className="scanner-pipeline" aria-label="Local image processing steps"><span>1 RESIZE</span><i>→</i><span>2 CUTOUT</span><i>→</i><span>3 POSTERIZE</span><small>NOTHING IS UPLOADED FOR CROPPING</small></div>
              </>
            )}

            {phase === 'processing' && (
              <div className="processing-panel">
                <div className="loading-orbit" />
                <p className="processing-note">DO NOT MOVE THE OBJECT. THE ARENA IS WATCHING.</p>
              </div>
            )}

            {phase === 'naming' && fighter && (
              <div className="naming-panel">
                <label className="name-label" htmlFor="fighter-name-input">FIGHTER NAME</label>
                <input
                  id="fighter-name-input"
                  className="name-input"
                  value={customName}
                  maxLength={18}
                  placeholder={fighter.name}
                  onChange={(event) => setCustomName(event.target.value)}
                  onKeyDown={(event) => { if (event.key === 'Enter') confirmFighter() }}
                />
                <small className="name-counter">{customName.trim().length}/18 · LEAVE EMPTY TO KEEP “{fighter.name}”</small>
                <button className="primary-button confirm-fighter-button" disabled={!canConfirm} onClick={confirmFighter}>
                  {isPlayerTwo ? 'CONFIRM CHARACTER →' : 'GENERATE FIGHTER →'}
                </button>
                <div className="scanner-actions subtle">
                  <button className="text-button" onClick={retake}>RETAKE / REPLACE OBJECT</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>
    </Shell>
  )
}
