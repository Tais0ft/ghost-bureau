import { BROKEN_ERROR, SCENARIOS, SCENARIO_ORDER, TODAY } from './data/scenarios'
import { autoAssign, evaluatePlace, occupancyFor, impossibleReasons } from './domain/matching'
import { buildReport } from './domain/report'
import { PlacesView } from './components/PlacesView'
import { QueueView } from './components/QueueView'
import { ReportView } from './components/ReportView'
import { WorklogView } from './components/WorklogView'
import { formatDate } from './labels'
import type { Ghost, Need, Place, ScenarioId, TabId, Temp } from './types'
import { useMemo, useState, type FormEvent } from 'react'

const TABS: { id: TabId; label: string }[] = [
  { id: 'queue', label: 'Очередь' },
  { id: 'places', label: 'Места' },
  { id: 'report', label: 'Отчёт' },
  { id: 'worklog', label: 'Журнал AI' },
]

const SCENARIO_LABEL: Record<ScenarioId, string> = {
  shift: 'Ночная смена',
  empty: 'Пустая очередь',
  impossible: 'Невозможное',
  overfill: 'Переполнение',
  broken: 'Повреждённый журнал',
}

const NEED_OPTIONS: Need[] = [
  'attic',
  'no_mirrors',
  'no_people',
  'damp',
  'quiet',
  'dark',
  'cold',
]

const TEMP_OPTIONS: Temp[] = ['icy', 'cold', 'cool', 'mild', 'warm']

function loadScenario(id: ScenarioId): { ghosts: Ghost[]; places: Place[] } {
  if (id === 'broken') {
    throw new Error(BROKEN_ERROR)
  }
  const scenario = SCENARIOS[id]
  return {
    ghosts: scenario.ghosts.map((ghost) => ({ ...ghost, needs: [...ghost.needs] })),
    places: scenario.places.map((place) => ({ ...place })),
  }
}

export default function App() {
  const initial = loadScenario('shift')
  const [scenario, setScenario] = useState<ScenarioId>('shift')
  const [ghosts, setGhosts] = useState<Ghost[]>(initial.ghosts)
  const [places, setPlaces] = useState<Place[]>(initial.places)
  const [assignments, setAssignments] = useState<Record<string, string | null>>(() =>
    autoAssign(initial.ghosts, initial.places, TODAY),
  )
  const [sources, setSources] = useState<Record<string, 'auto' | 'manual'>>(() =>
    Object.fromEntries(initial.ghosts.map((ghost) => [ghost.id, 'auto'])),
  )
  const [tab, setTab] = useState<TabId>('queue')
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const report = useMemo(
    () =>
      buildReport(ghosts, places, assignments, sources, (ghost) =>
        impossibleReasons(ghost, places, assignments, TODAY),
      ),
    [assignments, ghosts, places, sources],
  )

  function applyScenario(id: ScenarioId) {
    try {
      const next = loadScenario(id)
      setScenario(id)
      setGhosts(next.ghosts)
      setPlaces(next.places)
      setAssignments(autoAssign(next.ghosts, next.places, TODAY))
      setSources(Object.fromEntries(next.ghosts.map((ghost) => [ghost.id, 'auto'])))
      setError(null)
      setFormError(null)
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Неизвестная ошибка загрузки.'
      setError(message)
      setScenario(id)
    }
  }

  function rematch() {
    setAssignments(autoAssign(ghosts, places, TODAY))
    setSources(Object.fromEntries(ghosts.map((ghost) => [ghost.id, 'auto'])))
  }

  function assignGhost(ghostId: string, placeId: string | null) {
    setAssignments((current) => ({ ...current, [ghostId]: placeId }))
    setSources((current) => ({ ...current, [ghostId]: 'manual' }))
  }

  function addGhost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') ?? '').trim()
    const anxiety = Number(data.get('anxiety'))
    const preferredTemp = String(data.get('temp')) as Temp
    const deadline = String(data.get('deadline') ?? '')
    const needs = NEED_OPTIONS.filter((need) => data.get(need) === 'on')

    if (!name) {
      setFormError('Укажите имя привидения.')
      return
    }
    if (!Number.isInteger(anxiety) || anxiety < 1 || anxiety > 10) {
      setFormError('Тревожность — целое число от 1 до 10.')
      return
    }
    if (!deadline) {
      setFormError('Укажите дедлайн переселения.')
      return
    }
    if (!TEMP_OPTIONS.includes(preferredTemp)) {
      setFormError('Выберите любимую температуру.')
      return
    }

    const ghost: Ghost = {
      id: `new-${crypto.randomUUID()}`,
      name,
      anxiety,
      preferredTemp,
      deadline,
      needs,
      from: 'новая заявка',
    }

    const occupancy = occupancyFor(assignments, places)
    let bestId: string | null = null
    let bestScore = -1
    for (const place of places) {
      const fit = evaluatePlace(ghost, place, occupancy.get(place.id) ?? 0, TODAY)
      if (fit.eligible && fit.score > bestScore) {
        bestScore = fit.score
        bestId = place.id
      }
    }

    setGhosts((current) => [...current, ghost])
    setAssignments((current) => ({ ...current, [ghost.id]: bestId }))
    setSources((current) => ({ ...current, [ghost.id]: 'auto' }))
    setFormError(null)
    form.reset()
  }

  return (
    <div className="shell">
      <a className="skip" href="#content">
        К очереди
      </a>
      <div className="atmosphere" aria-hidden="true" />
      <header className="masthead">
        <div className="brand">
          <Seal />
          <div>
            <p className="kicker">Ночной реестр · смена {formatDate(TODAY)}</p>
            <h1>Бюро переселения привидений</h1>
            <p className="lede">
              Подберите место каждому привидению, объясните решение и не прячьте отказы.
            </p>
          </div>
        </div>
        <dl className="pulse">
          <div>
            <dt>Расселено</dt>
            <dd>{report.settled}</dd>
          </div>
          <div>
            <dt>Без места</dt>
            <dd>{report.unsettled}</dd>
          </div>
          <div>
            <dt>Заявок</dt>
            <dd>{report.total}</dd>
          </div>
        </dl>
      </header>

      <div className="toolbar">
        <label className="scenario">
          <span>Сценарий проверки</span>
          <select
            value={scenario}
            onChange={(event) => applyScenario(event.target.value as ScenarioId)}
          >
            {SCENARIO_ORDER.map((id) => (
              <option key={id} value={id}>
                {SCENARIO_LABEL[id]}
              </option>
            ))}
          </select>
        </label>
        <p className="scenario-blurb">
          {scenario === 'broken'
            ? 'Этот сценарий специально ломает загрузку.'
            : SCENARIOS[scenario].blurb}
        </p>
        <button type="button" className="ghost-btn" onClick={rematch}>
          Пересчитать автоматически
        </button>
      </div>

      {error ? (
        <div className="banner error" role="alert">
          <strong>Загрузка не удалась.</strong> {error}
        </div>
      ) : null}

      <nav className="tabs" aria-label="Разделы бюро">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === tab ? 'tab is-active' : 'tab'}
            aria-current={item.id === tab ? 'page' : undefined}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <main id="content">
        {tab === 'queue' ? (
          <QueueView
            ghosts={ghosts}
            places={places}
            assignments={assignments}
            sources={sources}
            today={TODAY}
            formError={formError}
            onAssign={assignGhost}
            onAdd={addGhost}
            needOptions={NEED_OPTIONS}
            tempOptions={TEMP_OPTIONS}
            emptyAction={
              <button type="button" className="primary" onClick={() => applyScenario('shift')}>
                Загрузить ночную смену
              </button>
            }
          />
        ) : null}
        {tab === 'places' ? (
          <PlacesView places={places} assignments={assignments} ghosts={ghosts} />
        ) : null}
        {tab === 'report' ? <ReportView report={report} /> : null}
        {tab === 'worklog' ? <WorklogView /> : null}
      </main>
    </div>
  )
}

function Seal() {
  return (
    <svg className="seal" viewBox="0 0 72 72" role="img" aria-label="Печать бюро">
      <circle cx="36" cy="36" r="34" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="36" cy="36" r="26" fill="none" stroke="currentColor" strokeWidth="1" />
      <path
        d="M36 18c6 8 10 14 10 22 0 8-4.5 14-10 14s-10-6-10-14c0-8 4-14 10-22z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  )
}
