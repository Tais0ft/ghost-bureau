import { occupancyFor } from '../domain/matching'
import { HUMIDITY, LIGHTING, NOISE, TEMP } from '../labels'
import type { Ghost, Place } from '../types'

interface PlacesViewProps {
  places: Place[]
  ghosts: Ghost[]
  assignments: Record<string, string | null>
}

export function PlacesView({ places, ghosts, assignments }: PlacesViewProps) {
  const occupancy = occupancyFor(assignments, places)

  return (
    <section className="place-grid">
      {places.map((place) => {
        const occupied = occupancy.get(place.id) ?? 0
        const residents = ghosts.filter((ghost) => assignments[ghost.id] === place.id)
        const overloaded = occupied > place.capacity
        const full = occupied >= place.capacity

        return (
          <article key={place.id} className="card place-card">
            <header className="card-head">
              <div>
                <p className="kicker">{place.kind}</p>
                <h2>{place.name}</h2>
              </div>
              <span className={overloaded ? 'chip tone-rust' : full ? 'chip tone-brass' : 'chip tone-fog'}>
                {occupied}/{place.capacity}
                {overloaded ? ' перегруз' : full ? ' полно' : ''}
              </span>
            </header>
            <div className="capacity" aria-hidden="true">
              {Array.from({ length: Math.max(place.capacity, occupied) }, (_, index) => (
                <span
                  key={index}
                  className={
                    index >= place.capacity ? 'slot overflow' : index < occupied ? 'slot filled' : 'slot'
                  }
                />
              ))}
            </div>
            <dl className="facts">
              <div>
                <dt>Свет</dt>
                <dd>{LIGHTING[place.lighting]}</dd>
              </div>
              <div>
                <dt>Шум</dt>
                <dd>{NOISE[place.noise]}</dd>
              </div>
              <div>
                <dt>Влажность</dt>
                <dd>{HUMIDITY[place.humidity]}</dd>
              </div>
              <div>
                <dt>Температура</dt>
                <dd>{TEMP[place.temperature]}</dd>
              </div>
              <div>
                <dt>Люди</dt>
                <dd>{place.hasPeople ? 'бывают' : 'нет'}</dd>
              </div>
              <div>
                <dt>Чердак</dt>
                <dd>{place.hasAttic ? 'есть' : 'нет'}</dd>
              </div>
              <div>
                <dt>Зеркала</dt>
                <dd>{place.hasMirrors ? 'есть' : 'нет'}</dd>
              </div>
            </dl>
            <p className="muted">{place.notes}</p>
            <h3>Сейчас живут</h3>
            {residents.length === 0 ? (
              <p className="muted">Пока пусто.</p>
            ) : (
              <ul className="residents">
                {residents.map((ghost) => (
                  <li key={ghost.id}>{ghost.name}</li>
                ))}
              </ul>
            )}
          </article>
        )
      })}
    </section>
  )
}
