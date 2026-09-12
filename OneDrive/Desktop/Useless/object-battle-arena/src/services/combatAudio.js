let audioContext
let muted = false

function getContext() {
  if (typeof window === 'undefined') return null
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return null
  audioContext ||= new AudioContextClass()
  if (audioContext.state === 'suspended') audioContext.resume().catch(() => {})
  return audioContext
}

function tone({ frequency, duration, gain = 0.04, type = 'sine', slide = 0 }) {
  if (muted) return
  const context = getContext()
  if (!context) return
  try {
    const oscillator = context.createOscillator()
    const volume = context.createGain()
    const now = context.currentTime
    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, now)
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, frequency + slide), now + duration)
    volume.gain.setValueAtTime(0.0001, now)
    volume.gain.exponentialRampToValueAtTime(gain, now + 0.008)
    volume.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    oscillator.connect(volume).connect(context.destination)
    oscillator.start(now)
    oscillator.stop(now + duration + 0.02)
  } catch { /* Audio is an optional presentation layer. */ }
}

export function playCombatSound(kind = 'hit') {
  if (kind === 'intro') {
    tone({ frequency: 78, duration: 0.55, gain: 0.06, type: 'sawtooth', slide: -28 })
    window.setTimeout(() => tone({ frequency: 118, duration: 0.35, gain: 0.035, type: 'triangle', slide: -40 }), 170)
    return
  }
  if (kind === 'heavy' || kind === 'shout') {
    tone({ frequency: 72, duration: 0.32, gain: 0.09, type: 'sine', slide: -42 })
    tone({ frequency: 145, duration: 0.18, gain: 0.045, type: 'square', slide: -90 })
    return
  }
  if (kind === 'victory') {
    tone({ frequency: 392, duration: 0.14, gain: 0.05, type: 'square', slide: 30 })
    window.setTimeout(() => tone({ frequency: 523, duration: 0.18, gain: 0.055, type: 'square', slide: 40 }), 110)
    window.setTimeout(() => tone({ frequency: 784, duration: 0.28, gain: 0.06, type: 'triangle', slide: 20 }), 230)
    return
  }
  if (kind === 'defeat') {
    tone({ frequency: 210, duration: 0.12, gain: 0.045, type: 'sawtooth', slide: -90 })
    window.setTimeout(() => tone({ frequency: 92, duration: 0.28, gain: 0.055, type: 'triangle', slide: -45 }), 90)
    return
  }
  if (kind === 'whoosh') {
    tone({ frequency: 480, duration: 0.2, gain: 0.025, type: 'triangle', slide: -360 })
    return
  }
  if (kind === 'warning') {
    tone({ frequency: 240, duration: 0.12, gain: 0.025, type: 'triangle', slide: -35 })
    return
  }
  if (kind === 'round' || kind === 'fall') {
    tone({ frequency: kind === 'fall' ? 62 : 92, duration: 0.42, gain: 0.07, type: 'sine', slide: -34 })
    return
  }
  tone({ frequency: 180, duration: 0.11, gain: 0.05, type: 'triangle', slide: -92 })
  tone({ frequency: 620, duration: 0.09, gain: 0.022, type: 'square', slide: -290 })
}

export function setCombatAudioMuted(value) {
  muted = Boolean(value)
}

export function speakWarLine() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  try {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance('ARE... YOU... READY... FOR THE WAR?')
    utterance.rate = 0.72
    utterance.pitch = 0.55
    utterance.volume = 0.72
    window.speechSynthesis.speak(utterance)
  } catch { /* Speech is optional and must never block battle. */ }
}

export function stopCombatAudio() {
  if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel()
  if (audioContext?.close) audioContext.close().catch(() => {})
  audioContext = null
}
