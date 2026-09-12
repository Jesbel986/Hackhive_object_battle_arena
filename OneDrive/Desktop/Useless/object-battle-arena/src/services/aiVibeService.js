const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash'
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`

const VIBE_PROMPT = `Look at this image. If it's an object, exaggerate its purpose. If it's a person's face, roast their expression or vibe. Generate a ridiculous fighting game character. Return ONLY a valid JSON object with exactly these keys: fighterName (string), subtitle (string), specialMove (string), quote (string), hp (number 1-100), power (number 1-100), speed (number 1-100). Keep text short, punchy, and suitable for a playful arcade game. Do not include markdown, code fences, or extra keys.`

export async function generateVibeFighter(imageDataUrl) {
  if (!imageDataUrl) return null
  if (!API_KEY) return createLocalVibe(imageDataUrl)
  const [header, encodedImage] = imageDataUrl.split(',')
  const mimeType = header.match(/data:(.*);base64/)?.[1] || 'image/jpeg'
  let response
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: VIBE_PROMPT }, { inline_data: { mime_type: mimeType, data: encodedImage } }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.9 },
      }),
    })
  } catch { return createLocalVibe(imageDataUrl) }
  if (!response.ok) return createLocalVibe(imageDataUrl)
  const payload = await response.json()
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) return createLocalVibe(imageDataUrl)
  try { return normalizeVibe(JSON.parse(text)) } catch { return createLocalVibe(imageDataUrl) }
}

function createLocalVibe(imageDataUrl) {
  const hash = [...imageDataUrl.slice(-24000)].reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 7)
  const names = ['THE UNEXPECTED', 'VIBE TITAN', 'CHAOS OBJECT', 'THE ABSURD ONE', 'RANDOM PRIME', 'MYSTERY MATTER']
  const subtitles = ['The Unreasonably Confident', 'The Room Has Opinions', 'The Ordinary Menace', 'The Unlicensed Champion']
  const moves = ['PURPOSE OVERDRIVE', 'UNAUTHORIZED TRANSFORMATION', 'VIBESPLosion', 'TACTICAL NONSENSE']
  const quotes = ['“It has no business being this powerful.”', '“The scan saw potential. Nobody else did.”', '“This is technically a fighting style.”']
  const score = (offset) => 55 + ((hash >>> offset) % 46)
  return { fighterName: `${names[hash % names.length]} ${String((hash % 99) + 1).padStart(2, '0')}`, subtitle: subtitles[(hash >>> 3) % subtitles.length], specialMove: moves[(hash >>> 6) % moves.length], quote: quotes[(hash >>> 9) % quotes.length], hp: score(12), power: score(17), speed: score(22), source: 'local' }
}

function normalizeVibe(value) {
  if (!value || typeof value !== 'object') throw new Error('Invalid vibe character')
  const required = ['fighterName', 'subtitle', 'specialMove', 'quote']
  if (required.some((key) => typeof value[key] !== 'string' || !value[key].trim())) throw new Error('Incomplete vibe character')
  const stats = ['hp', 'power', 'speed']
  if (stats.some((key) => !Number.isFinite(value[key]))) throw new Error('Incomplete vibe stats')
  return { ...Object.fromEntries(required.map((key) => [key, value[key].trim()])), ...Object.fromEntries(stats.map((key) => [key, Math.max(1, Math.min(100, Math.round(value[key])))])) }
}
