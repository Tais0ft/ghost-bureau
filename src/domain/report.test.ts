import { describe, expect, it } from 'vitest'
import { buildReport } from './report'
import type { Ghost, Place } from '../types'

const places: Place[] = [
  {
    id: 'castle',
    name: 'Замок',
    kind: 'замок',
    capacity: 1,
    lighting: 'dark',
    noise: 'silent',
    humidity: 'damp',
    temperature: 'cold',
    hasPeople: false,
    hasAttic: true,
    hasMirrors: false,
    notes: '',
  },
  {
    id: 'press',
    name: 'Подвал',
    kind: 'подвал',
    capacity: 2,
    lighting: 'dark',
    noise: 'quiet',
    humidity: 'damp',
    temperature: 'cold',
    hasPeople: false,
    hasAttic: false,
    hasMirrors: false,
    notes: '',
  },
]

const ghosts: Ghost[] = [
  {
    id: 'a',
    name: 'Агата',
    anxiety: 8,
    preferredTemp: 'cold',
    deadline: '2026-09-09',
    needs: ['attic'],
  },
  {
    id: 'b',
    name: 'Борис',
    anxiety: 9,
    preferredTemp: 'cold',
    deadline: '2026-09-10',
    needs: ['attic'],
  },
]

describe('buildReport', () => {
  it('считает расселённых и оставшихся без места', () => {
    const report = buildReport(
      ghosts,
      places,
      { a: 'castle', b: null },
      { a: 'auto', b: 'auto' },
      (ghost) => (ghost.id === 'b' ? ['Нужен чердак, свободных нет.'] : []),
    )
    expect(report.total).toBe(2)
    expect(report.settled).toBe(1)
    expect(report.unsettled).toBe(1)
    expect(report.problems[0]?.ghost.name).toBe('Борис')
  })

  it('помечает перегруженные места при ручном переполнении', () => {
    const report = buildReport(
      ghosts,
      places,
      { a: 'castle', b: 'castle' },
      { a: 'auto', b: 'manual' },
      () => [],
    )
    expect(report.overloaded[0]?.place.id).toBe('castle')
    expect(report.overloaded[0]?.occupied).toBe(2)
    expect(report.manualCount).toBe(1)
  })

  it('для пустой очереди даёт нули и пустые списки проблем', () => {
    const report = buildReport([], places, {}, {}, () => [])
    expect(report.total).toBe(0)
    expect(report.settled).toBe(0)
    expect(report.unsettled).toBe(0)
    expect(report.problems).toEqual([])
  })
})
