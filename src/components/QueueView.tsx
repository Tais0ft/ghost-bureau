import { Chip, Formula, GhostMeta, NeedList } from './ui'
import { evaluatePlace, occupancyFor, impossibleReasons } from '../domain/matching'
import { NEED, TEMP } from '../labels'
import type { Ghost, Need, Place, Temp } from '../types'
import type { FormEvent, ReactNode } from 'react'

interface QueueViewProps {
  ghosts: Ghost[]
  places: Place[]
  assignments: Record<string, string | null>
  sources: Record<string, 'auto' | 'manual'>
  today: string
  formError: string | null
  onAssign: (ghostId: string, placeId: string | null) => void
  onAdd: (event: FormEvent<HTMLFormElement>) => void
  needOptions: Need[]
  tempOptions: Temp[]
  emptyAction: ReactNode
}

export function QueueView({
  ghosts,
  places,
  assignments,
  sources,
  today,
  formError,
  onAssign,
  onAdd,
  needOptions,
  tempOptions,
  emptyAction,
}: QueueViewProps) {
  const occupancy = occupancyFor(assignments, places)

  return (
    <div className="layout">
      <section className="stack">
        {ghosts.length === 0 ? (
          <div className="empty">
            <h2>Очередь пуста</h2>
            <p>
              Заявок на переселение нет. Места обитания ждут, но расселять некого. Загрузите демо-смену
              или добавьте заявку вручную.
            </p>
            {emptyAction}
          </div>
        ) : (
          ghosts.map((ghost) => {
            const placeId = assignments[ghost.id] ?? null
            const occupied = occupancy.get(placeId ?? '') ?? 0
            const chosen = places.find((place) => place.id === placeId) ?? null
            const fit = chosen
              ? evaluatePlace(
                  ghost,
                  chosen,
                  Math.max(0, occupied - (placeId ? 1 : 0)),
                  today,
                )
              : null
            const source = sources[ghost.id] ?? 'auto'
            const unsettledReasons = !placeId
              ? impossibleReasons(ghost, places, assignments, today)
              : []

            return (
              <article key={ghost.id} className="card ghost-card">
                <header className="card-head">
                  <div>
                    <p className="kicker">Заявка</p>
                    <h2>{ghost.name}</h2>
                  </div>
                  <div className="status-row">
                    {placeId ? (
                      <Chip tone="sage">Расселено</Chip>
                    ) : (
                      <Chip tone="rust">Без места</Chip>
                    )}
                    {source === 'manual' ? <Chip tone="brass">Вручную</Chip> : null}
                    {ghost.deadline < today ? <Chip tone="rust">Просрочено</Chip> : null}
                  </div>
                </header>

                <div className="anxiety" aria-hidden="true">
                  {Array.from({ length: 10 }, (_, index) => (
                    <span key={index} className={index < ghost.anxiety ? 'pip is-on' : 'pip'} />
                  ))}
                </div>
                <GhostMeta ghost={ghost} />
                <NeedList needs={ghost.needs} />

                <div className="decision">
                  <label>
                    <span>Место переселения</span>
                    <select
                      value={placeId ?? ''}
                      onChange={(event) => onAssign(ghost.id, event.target.value || null)}
                    >
                      <option value="">Без места</option>
                      {places.map((place) => (
                        <option key={place.id} value={place.id}>
                          {place.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  {fit && placeId ? (
                    <div className={fit.eligible ? 'explain ok' : 'explain warn'}>
                      {fit.eligible ? (
                        <>
                          <p>
                            <strong>
                              {source === 'manual' ? 'Ручной выбор.' : 'Автоподбор.'}
                            </strong>{' '}
                            Балл {fit.score} из 100.
                          </p>
                          <ul>
                            {fit.why.map((line) => (
                              <li key={line}>{line}</li>
                            ))}
                          </ul>
                          {fit.softWarnings.length > 0 ? (
                            <ul className="warn-list">
                              {fit.softWarnings.map((line) => (
                                <li key={line}>{line}</li>
                              ))}
                            </ul>
                          ) : null}
                        </>
                      ) : (
                        <>
                          <p>
                            <strong>Этот выбор конфликтует с условиями.</strong> Привидение всё равно
                            записано сюда вручную.
                          </p>
                          <ul className="warn-list">
                            {fit.why.map((line) => (
                              <li key={line}>{line}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="explain warn">
                      <p>
                        <strong>Переселить сейчас нельзя.</strong>
                      </p>
                      <ul className="warn-list">
                        {unsettledReasons.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </article>
            )
          })
        )}
      </section>

      <div className="side">
        <Formula />
        <form className="card form" onSubmit={onAdd} noValidate>
          <h2>Новая заявка</h2>
          <p className="muted">Если поля не заполнены, бюро скажет, что исправить.</p>
          <label>
            <span>Имя</span>
            <input name="name" type="text" autoComplete="off" />
          </label>
          <label>
            <span>Тревожность (1–10)</span>
            <input name="anxiety" type="number" min={1} max={10} defaultValue={5} />
          </label>
          <label>
            <span>Любимая температура</span>
            <select name="temp" defaultValue="cold">
              {tempOptions.map((temp) => (
                <option key={temp} value={temp}>
                  {TEMP[temp]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Дедлайн</span>
            <input name="deadline" type="date" defaultValue="2026-09-15" />
          </label>
          <fieldset>
            <legend>Особые условия</legend>
            {needOptions.map((need) => (
              <label key={need} className="check">
                <input type="checkbox" name={need} />
                <span>{NEED[need]}</span>
              </label>
            ))}
          </fieldset>
          {formError ? (
            <p className="field-error" role="alert">
              {formError}
            </p>
          ) : null}
          <button type="submit" className="primary">
            Добавить в очередь
          </button>
        </form>
      </div>
    </div>
  )
}
