// Shared fighter helpers. Everything here is pure / deterministic so stats never
// change between renders and no extra AI call is needed.

/** The name a fighter should always be shown under (custom name wins). */
export function displayName(fighter) {
  if (!fighter) return 'UNKNOWN OBJECT'
  const custom = (fighter.customName || '').trim()
  return (custom || fighter.name || 'UNKNOWN OBJECT').slice(0, 24)
}

/** "water bottle" -> "WATER-BOTTLE". Used for fallback fighter names. */
function labelToName(label = '') {
  const words = label.trim().split(/\s+/).filter(Boolean).slice(0, 2)
  if (!words.length) return 'UNKNOWN THING'
  return words.map((word) => word.toUpperCase()).join('-')
}

/** Stable string hash (FNV-ish). Used to seed per-fighter stats. */
export function hashString(value) {
  const text = String(value || '')
  let hash = 5381
  for (let index = 0; index < text.length; index += 1) hash = ((hash << 5) + hash + text.charCodeAt(index)) >>> 0
  return hash >>> 0
}

/**
 * Deterministic joke stats derived from the fighter itself.
 * Repeated with the same fighter always returns the same numbers.
 */
export function deriveStats(fighter) {
  if (!fighter) return { uselessness: 97, drama: 84, threat: 71, confusion: 93, reason: 4 }
  const seed = hashString(`${fighter.key || ''}|${fighter.name || ''}|${fighter.title || ''}|${fighter.ability || ''}`)
  const roll = (step) => (seed >>> step) % 101
  // Joke flavor: uselessness/confusion skew high, threat middles, reason skews low.
  return {
    uselessness: 60 + (roll(2) % 40),
    drama: 35 + (roll(5) % 60),
    threat: 25 + (roll(8) % 65),
    confusion: 55 + (roll(11) % 45),
    reason: 1 + (roll(14) % 9),
  }
}

/** Builds the fighter record stored in game state after processing. */
export function buildFighterRecord({ vibe, image, keySuffix }) {
  const rawName = (vibe?.fighterName || vibe?.name || '').trim() || labelToName(vibe?.objectLabel)
  return {
    key: vibe?.key || `ai-${keySuffix}`,
    label: vibe?.objectLabel || 'Object',
    name: rawName.toUpperCase().slice(0, 24),
    title: vibe?.subtitle || vibe?.title || 'The Unreasonably Confident',
    ability: vibe?.specialMove || vibe?.ability || 'PURPOSE OVERDRIVE',
    abilityText: vibe?.quote || vibe?.abilityText || '“It has no business being this powerful.”',
    hp: vibe?.hp || 80,
    power: vibe?.power || 70,
    speed: vibe?.speed || 55,
    accent: vibe?.accent || '#ef7654',
    image: image || null,
    icon: vibe?.icon || '◆',
    customName: '',
  }
}

/**
 * Attack definitions. One source of truth for buttons, keyboard hints and
 * the shared performAttack() handler in Battle.
 */
export function buildMoves(fighter) {
  const identity = `${fighter?.key || ''} ${fighter?.label || ''} ${fighter?.name || ''}`.toLowerCase()
  const key = identity.includes('mug') || identity.includes('cup') ? 'mug'
    : identity.includes('shoe') || identity.includes('slipper') || identity.includes('chappal') ? 'shoe'
      : identity.includes('bottle') || identity.includes('flask') ? 'bottle'
        : identity.includes('calculator') || identity.includes('math') ? 'calculator'
          : identity.includes('keyboard') || identity.includes('key') ? 'keyboard'
            : identity.includes('stapler') || identity.includes('staple') ? 'stapler'
              : identity.includes('book') || identity.includes('novel') ? 'book' : ''
  const presets = {
    mug: ['SCALDING BONK', 'ESPRESSO BLAST', 'SIP THIS', 'MUG OFF!'],
    shoe: ['CHAPPAL SLAP', 'SOLE DASH', 'LACE OF FURY', 'GET OUT, SHOE!'],
    bottle: ['CAP CANNON', 'HYDRATION DASH', 'FLOOD WARNING', 'DRINK WATER!'],
    calculator: ['CALCULATION PUNCH', 'ERROR 404', 'MATH OVERLOAD', 'CALCULATE THIS!'],
    keyboard: ['KEY SMASH', 'CAPS LOCKDOWN', 'CTRL ALT CHAOS', 'TYPE THIS!'],
    stapler: ['STAPLE SHOT', 'PAPER CUT PROTOCOL', 'OFFICE AMBUSH', 'FILE THIS!'],
    book: ['HARDCOVER HIT', 'PLOT TWIST', 'KNOWLEDGE DROP', 'READ THE ROOM!'],
  }
  const names = presets[key] || [
    `${fighter?.label || 'OBJECT'} BONK`,
    `${fighter?.ability || 'SPECIAL MOVE'}`,
    'UNNECESSARY CHAOS',
    'GET OUT, OBJECT!',
  ]
  return [
    { id: 'impact', name: names[0].toUpperCase().slice(0, 20), icon: '1', force: 0.008, cooldown: 0.65, detail: 'Quick hit · small push', key: { one: '1', two: '5' }, pose: 'punch' },
    { id: 'special', name: names[1].toUpperCase().slice(0, 20), icon: '2', force: 0.014, cooldown: 2.6, detail: 'Charge it · heavy push', key: { one: '2', two: '6' }, pose: 'special' },
    { id: 'ultimate', name: names[2].toUpperCase().slice(0, 20), icon: '✦', force: 0.02, cooldown: 5, detail: 'Big launch · long cooldown', key: { one: '3', two: '7' }, pose: 'critical' },
    { id: 'shout', name: names[3].toUpperCase().slice(0, 20), icon: '🎤', force: 0.2, cooldown: 5, detail: 'Double power · hold to charge', key: { one: '4', two: '8' }, pose: 'shout' },
  ]
}

const IMPACT_LINES = [
  'BONK.',
  'EMOTIONAL DAMAGE.',
  'THAT WAS COMPLETELY UNNECESSARY.',
  'THE OBJECT HAS LOST ITS PURPOSE.',
  'ABSOLUTELY NO REASON FOR THAT.',
  'OBJECTIVE VIOLATION.',
  'THAT DID NOT NEED TO HAPPEN.',
  'THE ARENA REGRETS THIS.',
  'PHYSICS FILED A COMPLAINT.',
  'OSHA HAS BEEN NOTIFIED.',
]

const CRITICAL_LINES = [
  'CRITICAL BONK.',
  'CRITICAL EMOTIONAL DAMAGE.',
  'THE CROWD (NOBODY) GOES WILD.',
  'THAT LEFT A MARK. AND A MEMO.',
]

const MISS_LINES = [
  'SWING AND A MISS.',
  '0 DAMAGE. BUT IT LOOKED COOL.',
  'THE AIR IS UNHARMED.',
  'ATTACK LOST IN TRANSIT.',
]

const pick = (list) => list[Math.floor(Math.random() * list.length)]

export function impactLine(critical = false) {
  return critical ? pick(CRITICAL_LINES) : pick(IMPACT_LINES)
}

export function missLine() {
  return pick(MISS_LINES)
}

/** Trim + clamp a user-entered fighter name. Empty string means "keep AI name". */
export function normalizeCustomName(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 18)
}
