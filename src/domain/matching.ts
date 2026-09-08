import { HARD_REASON } from '../labels'
import type {
  Ghost,
  HardReason,
  Lighting,
  Need,
  Noise,
  Place,
  PlaceFit,
  Temp,
} from '../types'

export const TEMP_ORDER: Temp[] = ['icy', 'cold', 'cool', 'mild', 'warm']
export const LIGHT_ORDER: Lighting[] = ['dark', 'dim', 'moderate', 'bright']
export const NOISE_ORDER: Noise[] = ['silent', 'quiet', 'moderate', 'loud']

const SCORE = {
  temp: 25,
  light: 20,
  noise: 15,
  humidity: 10,
  space: 15,
  urgency: 15,
} as const

export const MAX_SCORE =
  SCORE.temp + SCORE.light + SCORE.noise + SCORE.humidity + SCORE.space + SCORE.urgency

function indexOf<T extends string>(order: readonly T[], value: T): number {
  const index = order.indexOf(value)
  return index === -1 ? 0 : index
}

function distanceRatio(a: number, b: number, span: number): number {
  if (span <= 0) return 0
  return Math.min(1, Math.abs(a - b) / span)
}

function hasNeed(ghost: Ghost, need: Need): boolean {
  return ghost.needs.includes(need)
}

function collectHardReasons(
  ghost: Ghost,
  place: Place,
  occupied: number,
  today: string,
): HardReason[] {
  const reasons: HardReason[] = []

  if (ghost.deadline < today) reasons.push('deadline_passed')
  if (occupied >= place.capacity) reasons.push('no_capacity')
  if (hasNeed(ghost, 'attic') && !place.hasAttic) reasons.push('needs_attic')
  if (hasNeed(ghost, 'no_mirrors') && place.hasMirrors) reasons.push('fears_mirrors')
  if (hasNeed(ghost, 'no_people') && place.hasPeople) reasons.push('no_people')
  if (hasNeed(ghost, 'damp') && place.humidity === 'dry') reasons.push('needs_damp')
  if (hasNeed(ghost, 'dark') && (place.lighting === 'moderate' || place.lighting === 'bright')) {
    reasons.push('needs_dark')
  }
  if (hasNeed(ghost, 'quiet') && (place.noise === 'moderate' || place.noise === 'loud')) {
    reasons.push('needs_quiet')
  }
  if (hasNeed(ghost, 'cold') && (place.temperature === 'mild' || place.temperature === 'warm')) {
    reasons.push('needs_cold')
  }

  return reasons
}

function preferredLightIndex(anxiety: number): number {
  if (anxiety >= 8) return 0
  if (anxiety >= 5) return 1
  return 2
}

function preferredNoiseIndex(anxiety: number): number {
  if (anxiety >= 8) return 0
  if (anxiety >= 5) return 1
  return 2
}

function daysUntil(deadline: string, today: string): number {
  const start = Date.parse(`${today}T00:00:00Z`)
  const end = Date.parse(`${deadline}T00:00:00Z`)
  return Math.round((end - start) / 86_400_000)
}

export function scorePlace(ghost: Ghost, place: Place, occupied: number, today: string): {
  score: number
  why: string[]
  softWarnings: string[]
} {
  const why: string[] = []
  const softWarnings: string[] = []

  const tempGap = distanceRatio(
    indexOf(TEMP_ORDER, ghost.preferredTemp),
    indexOf(TEMP_ORDER, place.temperature),
    TEMP_ORDER.length - 1,
  )
  const tempPoints = Math.round(SCORE.temp * (1 - tempGap))
  if (tempGap === 0) {
    why.push(`Температура совпадает с любимой.`)
  } else if (tempGap <= 0.25) {
    why.push(`Температура близка к любимой.`)
  } else {
    softWarnings.push(`Температура места далека от любимой.`)
  }

  const lightGap = distanceRatio(
    preferredLightIndex(ghost.anxiety),
    indexOf(LIGHT_ORDER, place.lighting),
    LIGHT_ORDER.length - 1,
  )
  const lightPoints = Math.round(SCORE.light * (1 - lightGap))
  if (ghost.anxiety >= 8 && (place.lighting === 'dark' || place.lighting === 'dim')) {
    why.push(`Тревожность ${ghost.anxiety}/10 — здесь достаточно темно.`)
  } else if (lightGap > 0.5) {
    softWarnings.push(`Освещение не подходит уровню тревожности.`)
  }

  const noiseGap = distanceRatio(
    preferredNoiseIndex(ghost.anxiety),
    indexOf(NOISE_ORDER, place.noise),
    NOISE_ORDER.length - 1,
  )
  const noisePoints = Math.round(SCORE.noise * (1 - noiseGap))
  if (ghost.anxiety >= 8 && (place.noise === 'silent' || place.noise === 'quiet')) {
    why.push(`Тихое место снижает риск срыва.`)
  } else if (noiseGap > 0.5) {
    softWarnings.push(`Уровень шума выше комфортного.`)
  }

  let humidityPoints = Math.round(SCORE.humidity * 0.6)
  if (hasNeed(ghost, 'damp') && place.humidity === 'damp') {
    humidityPoints = SCORE.humidity
    why.push(`Сырость есть — особое условие закрыто.`)
  } else if (place.humidity === 'damp' && ghost.preferredTemp !== 'warm') {
    humidityPoints = SCORE.humidity
    why.push(`Влажный воздух ближе к привычному холоду.`)
  } else if (place.humidity === 'dry' && !hasNeed(ghost, 'damp')) {
    humidityPoints = Math.round(SCORE.humidity * 0.4)
  }

  const free = Math.max(0, place.capacity - occupied)
  const spacePoints = place.capacity === 0 ? 0 : Math.round(SCORE.space * (free / place.capacity))
  if (free <= 1 && place.capacity > 1) {
    softWarnings.push(`Место почти заполнено: свободно ${free} из ${place.capacity}.`)
  } else if (free >= 2) {
    why.push(`Есть запас вместимости (${free} из ${place.capacity}).`)
  }

  const remaining = daysUntil(ghost.deadline, today)
  let urgencyPoints = 0
  if (remaining <= 2 && remaining >= 0) {
    urgencyPoints = SCORE.urgency
    why.push(`Дедлайн близко — выбран самый устойчивый вариант.`)
  } else if (remaining <= 5) {
    urgencyPoints = Math.round(SCORE.urgency * 0.5)
  }

  const score = tempPoints + lightPoints + noisePoints + humidityPoints + spacePoints + urgencyPoints
  return { score, why, softWarnings }
}

export function evaluatePlace(
  ghost: Ghost,
  place: Place,
  occupied: number,
  today: string,
): PlaceFit {
  const hardReasons = collectHardReasons(ghost, place, occupied, today)
  const scored = scorePlace(ghost, place, occupied, today)

  if (hardReasons.length > 0) {
    return {
      placeId: place.id,
      eligible: false,
      hardReasons,
      score: 0,
      softWarnings: [],
      why: hardReasons.map((reason) => HARD_REASON[reason]),
    }
  }

  const why = [...scored.why]
  if (why.length === 0) {
    why.push(`Жёсткие условия соблюдены, балл ${scored.score} из ${MAX_SCORE}.`)
  }

  return {
    placeId: place.id,
    eligible: true,
    hardReasons: [],
    score: scored.score,
    softWarnings: scored.softWarnings,
    why,
  }
}

export function compareGhostPriority(a: Ghost, b: Ghost): number {
  if (a.deadline !== b.deadline) return a.deadline.localeCompare(b.deadline)
  if (a.anxiety !== b.anxiety) return b.anxiety - a.anxiety
  return a.name.localeCompare(b.name, 'ru')
}

export function autoAssign(
  ghosts: Ghost[],
  places: Place[],
  today: string,
): Record<string, string | null> {
  const occupancy = new Map<string, number>(places.map((place) => [place.id, 0]))
  const result: Record<string, string | null> = {}
  const ordered = [...ghosts].sort(compareGhostPriority)

  for (const ghost of ordered) {
    let best: { place: Place; fit: PlaceFit } | null = null

    for (const place of places) {
      const occupied = occupancy.get(place.id) ?? 0
      const fit = evaluatePlace(ghost, place, occupied, today)
      if (!fit.eligible) continue
      if (!best || fit.score > best.fit.score) {
        best = { place, fit }
      }
    }

    if (!best) {
      result[ghost.id] = null
      continue
    }

    result[ghost.id] = best.place.id
    occupancy.set(best.place.id, (occupancy.get(best.place.id) ?? 0) + 1)
  }

  return result
}

export function occupancyFor(
  assignments: Record<string, string | null>,
  places: Place[],
  exceptGhostId?: string,
): Map<string, number> {
  const occupancy = new Map<string, number>(places.map((place) => [place.id, 0]))
  for (const [ghostId, placeId] of Object.entries(assignments)) {
    if (!placeId || ghostId === exceptGhostId) continue
    occupancy.set(placeId, (occupancy.get(placeId) ?? 0) + 1)
  }
  return occupancy
}

export function fitsForGhost(
  ghost: Ghost,
  places: Place[],
  assignments: Record<string, string | null>,
  today: string,
): PlaceFit[] {
  const occupancy = occupancyFor(assignments, places, ghost.id)
  return places
    .map((place) => evaluatePlace(ghost, place, occupancy.get(place.id) ?? 0, today))
    .sort((a, b) => b.score - a.score)
}

export function impossibleReasons(
  ghost: Ghost,
  places: Place[],
  assignments: Record<string, string | null>,
  today: string,
): string[] {
  if (ghost.deadline < today) return [HARD_REASON.deadline_passed]

  const fits = fitsForGhost(ghost, places, assignments, today)
  const eligible = fits.filter((fit) => fit.eligible)
  if (eligible.length > 0) return []

  const counts = new Map<HardReason, number>()
  for (const fit of fits) {
    for (const reason of fit.hardReasons) {
      if (reason === 'deadline_passed') continue
      counts.set(reason, (counts.get(reason) ?? 0) + 1)
    }
  }

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1])
  if (ranked.length === 0) return ['Подходящего места нет.']

  return ranked.slice(0, 3).map(([reason, count]) => {
    if (reason === 'no_capacity') {
      return `Свободных мест не осталось (${count} из ${places.length} мест переполнены).`
    }
    return HARD_REASON[reason]
  })
}
