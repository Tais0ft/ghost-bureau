import type { Assignment, Ghost, Place } from '../types'
import { occupancyFor } from './matching'

export interface ProblemCase {
  ghost: Ghost
  reasons: string[]
}

export interface OverloadedPlace {
  place: Place
  occupied: number
}

export interface BureauReport {
  total: number
  settled: number
  unsettled: number
  manualCount: number
  problems: ProblemCase[]
  overloaded: OverloadedPlace[]
  emptiest: OverloadedPlace[]
}

export function buildReport(
  ghosts: Ghost[],
  places: Place[],
  assignments: Record<string, string | null>,
  sources: Record<string, Assignment['source']>,
  reasonsFor: (ghost: Ghost) => string[],
): BureauReport {
  const occupancy = occupancyFor(assignments, places)
  const settledGhosts = ghosts.filter((ghost) => assignments[ghost.id])
  const unsettledGhosts = ghosts.filter((ghost) => !assignments[ghost.id])

  const problems: ProblemCase[] = unsettledGhosts.map((ghost) => ({
    ghost,
    reasons: reasonsFor(ghost),
  }))

  problems.sort((a, b) => {
    if (b.reasons.length !== a.reasons.length) return b.reasons.length - a.reasons.length
    if (b.ghost.anxiety !== a.ghost.anxiety) return b.ghost.anxiety - a.ghost.anxiety
    return a.ghost.deadline.localeCompare(b.ghost.deadline)
  })

  const loaded = places
    .map((place) => ({
      place,
      occupied: occupancy.get(place.id) ?? 0,
    }))
    .sort((a, b) => {
      const aRatio = a.occupied / Math.max(1, a.place.capacity)
      const bRatio = b.occupied / Math.max(1, b.place.capacity)
      return bRatio - aRatio
    })

  const overloaded = loaded.filter((item) => item.occupied > item.place.capacity)
  const almostFull = loaded.filter(
    (item) => item.occupied === item.place.capacity && item.place.capacity > 0,
  )

  const emptiest = [...loaded]
    .filter((item) => item.occupied === 0)
    .sort((a, b) => b.place.capacity - a.place.capacity)

  return {
    total: ghosts.length,
    settled: settledGhosts.length,
    unsettled: unsettledGhosts.length,
    manualCount: ghosts.filter((ghost) => sources[ghost.id] === 'manual').length,
    problems,
    overloaded: overloaded.length > 0 ? overloaded : almostFull,
    emptiest,
  }
}
