export type Temp = 'icy' | 'cold' | 'cool' | 'mild' | 'warm'
export type Lighting = 'dark' | 'dim' | 'moderate' | 'bright'
export type Noise = 'silent' | 'quiet' | 'moderate' | 'loud'
export type Humidity = 'dry' | 'normal' | 'damp'

export type Need =
  | 'attic'
  | 'no_mirrors'
  | 'no_people'
  | 'damp'
  | 'quiet'
  | 'dark'
  | 'cold'

export type HardReason =
  | 'deadline_passed'
  | 'no_capacity'
  | 'needs_attic'
  | 'fears_mirrors'
  | 'no_people'
  | 'needs_damp'
  | 'needs_dark'
  | 'needs_quiet'
  | 'needs_cold'

export interface Ghost {
  id: string
  name: string
  anxiety: number
  preferredTemp: Temp
  deadline: string
  needs: Need[]
  from?: string
}

export interface Place {
  id: string
  name: string
  kind: string
  capacity: number
  lighting: Lighting
  noise: Noise
  humidity: Humidity
  temperature: Temp
  hasPeople: boolean
  hasAttic: boolean
  hasMirrors: boolean
  notes: string
}

export interface PlaceFit {
  placeId: string
  eligible: boolean
  hardReasons: HardReason[]
  score: number
  softWarnings: string[]
  why: string[]
}

export type AssignmentSource = 'auto' | 'manual'

export interface Assignment {
  ghostId: string
  placeId: string | null
  source: AssignmentSource
}

export type ScenarioId = 'shift' | 'empty' | 'impossible' | 'overfill' | 'broken'

export interface Scenario {
  id: Exclude<ScenarioId, 'broken'>
  title: string
  blurb: string
  ghosts: Ghost[]
  places: Place[]
}

export type TabId = 'queue' | 'places' | 'report' | 'worklog'
