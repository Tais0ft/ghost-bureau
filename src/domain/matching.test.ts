import { describe, expect, it } from 'vitest'
import {
  autoAssign,
  evaluatePlace,
  fitsForGhost,
  impossibleReasons,
} from './matching'
import { SCENARIOS, TODAY } from '../data/scenarios'
import type { Ghost, Place } from '../types'

const today = '2026-09-08'

const castle: Place = {
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
}

const library: Place = {
  id: 'library',
  name: 'Библиотека',
  kind: 'библиотека',
  capacity: 2,
  lighting: 'moderate',
  noise: 'silent',
  humidity: 'dry',
  temperature: 'mild',
  hasPeople: true,
  hasAttic: true,
  hasMirrors: true,
  notes: '',
}

function makeGhost(overrides: Partial<Ghost> = {}): Ghost {
  return {
    id: 'g1',
    name: 'Тестовое',
    anxiety: 8,
    preferredTemp: 'cold',
    deadline: '2026-09-10',
    needs: ['attic', 'no_people', 'dark'],
    ...overrides,
  }
}

describe('evaluatePlace', () => {
  it('принимает тёмный пустой замок для тревожного чердачного привидения', () => {
    const fit = evaluatePlace(makeGhost(), castle, 0, today)
    expect(fit.eligible).toBe(true)
    expect(fit.score).toBeGreaterThan(50)
    expect(fit.why.join(' ')).toMatch(/темно|чердак|тревожность/i)
  })

  it('отклоняет библиотеку: люди, зеркала и слишком светло', () => {
    const fit = evaluatePlace(makeGhost({ needs: ['attic', 'no_people', 'no_mirrors', 'dark'] }), library, 0, today)
    expect(fit.eligible).toBe(false)
    expect(fit.hardReasons).toEqual(expect.arrayContaining(['no_people', 'fears_mirrors', 'needs_dark']))
  })

  it('отклоняет просроченный дедлайн даже если место идеально', () => {
    const fit = evaluatePlace(makeGhost({ deadline: '2026-09-07' }), castle, 0, today)
    expect(fit.eligible).toBe(false)
    expect(fit.hardReasons).toContain('deadline_passed')
  })

  it('отклоняет переполненное место', () => {
    const fit = evaluatePlace(makeGhost(), castle, 1, today)
    expect(fit.eligible).toBe(false)
    expect(fit.hardReasons).toContain('no_capacity')
  })
})

describe('autoAssign', () => {
  it('отдаёт единственное место более срочной заявке', () => {
    const urgent = makeGhost({ id: 'urgent', deadline: '2026-09-09', name: 'Срочная' })
    const later = makeGhost({ id: 'later', deadline: '2026-09-20', name: 'Позже', anxiety: 10 })
    const result = autoAssign([later, urgent], [castle], today)
    expect(result.urgent).toBe('castle')
    expect(result.later).toBeNull()
  })

  it('оставляет просроченную заявку без места', () => {
    const late = makeGhost({ id: 'late', deadline: '2026-09-01' })
    const result = autoAssign([late], [castle, library], today)
    expect(result.late).toBeNull()
  })
})

describe('impossibleReasons', () => {
  it('объясняет, почему переселить нельзя', () => {
    const ghost = makeGhost({
      needs: ['attic', 'no_people', 'no_mirrors', 'dark'],
    })
    const sealedCastle = { ...castle, hasAttic: false }
    const reasons = impossibleReasons(ghost, [sealedCastle, library], {}, today)
    expect(reasons.length).toBeGreaterThan(0)
    expect(reasons.join(' ')).toMatch(/чердак|людьми|зеркал|светло/i)
  })
})

describe('demo scenarios', () => {
  it('ночная смена оставляет просрочку и тётю сырость без места', () => {
    const { ghosts, places } = SCENARIOS.shift
    const result = autoAssign(ghosts, places, TODAY)
    expect(result.late).toBeNull()
    expect(result.aunt).toBeNull()
    expect(result.agatha).toBe('castle')
    expect(result.captain).toBe('castle')
    expect(Object.values(result).filter(Boolean).length).toBeGreaterThan(4)
  })

  it('опечатанный чердак делает чердачную моль невозможной', () => {
    const { ghosts, places } = SCENARIOS.impossible
    const result = autoAssign(ghosts, places, TODAY)
    expect(result.incompatible).toBeNull()
  })

  it('четыре чердачных не влезают в замок на троих', () => {
    const { ghosts, places } = SCENARIOS.overfill
    const result = autoAssign(ghosts, places, TODAY)
    const inCastle = Object.values(result).filter((id) => id === 'castle')
    expect(inCastle).toHaveLength(3)
    expect(result.a4).toBeNull()
  })
})
describe('fitsForGhost', () => {
  it('для ручного выбора показывает конфликт с условиями', () => {
    const ghost = makeGhost({ needs: ['no_people', 'dark'] })
    const fits = fitsForGhost(ghost, [library], {}, today)
    expect(fits[0]?.eligible).toBe(false)
    expect(fits[0]?.hardReasons).toEqual(expect.arrayContaining(['no_people', 'needs_dark']))
  })
})
