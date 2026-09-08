import type { Ghost, Place, Scenario, ScenarioId } from '../types'

export const TODAY = '2026-09-08'

const PLACES: Place[] = [
  {
    id: 'castle',
    name: 'Замок Туманов',
    kind: 'замок',
    capacity: 2,
    lighting: 'dark',
    noise: 'silent',
    humidity: 'damp',
    temperature: 'icy',
    hasPeople: false,
    hasAttic: true,
    hasMirrors: false,
    notes: 'Чердак цел, зеркал нет, люди не ходят.',
  },
  {
    id: 'lighthouse',
    name: 'Маяк на Косе',
    kind: 'маяк',
    capacity: 2,
    lighting: 'dim',
    noise: 'loud',
    humidity: 'normal',
    temperature: 'cold',
    hasPeople: false,
    hasAttic: false,
    hasMirrors: true,
    notes: 'Линза маяка работает как огромное зеркало. Прибой не стихает.',
  },
  {
    id: 'library',
    name: 'Городская библиотека',
    kind: 'библиотека',
    capacity: 4,
    lighting: 'moderate',
    noise: 'silent',
    humidity: 'dry',
    temperature: 'mild',
    hasPeople: true,
    hasAttic: true,
    hasMirrors: true,
    notes: 'Читальный зал, зеркала в гардеробе, днём бывают люди.',
  },
  {
    id: 'theater',
    name: 'Театр «Люцинда»',
    kind: 'театр',
    capacity: 2,
    lighting: 'dim',
    noise: 'quiet',
    humidity: 'normal',
    temperature: 'cool',
    hasPeople: false,
    hasAttic: false,
    hasMirrors: true,
    notes: 'Заброшен, но гримёрки полны зеркал.',
  },
  {
    id: 'press',
    name: 'Подвал старой типографии',
    kind: 'подвал',
    capacity: 2,
    lighting: 'dark',
    noise: 'quiet',
    humidity: 'damp',
    temperature: 'cold',
    hasPeople: false,
    hasAttic: false,
    hasMirrors: false,
    notes: 'Сырой подвал без чердака и без зеркал.',
  },
  {
    id: 'solarium',
    name: 'Солярий на набережной',
    kind: 'солярий',
    capacity: 1,
    lighting: 'bright',
    noise: 'loud',
    humidity: 'dry',
    temperature: 'warm',
    hasPeople: true,
    hasAttic: false,
    hasMirrors: true,
    notes: 'Светло, шумно, люди и зеркала. Почти никому не подходит.',
  },
]

function ghost(
  partial: Omit<Ghost, 'from'> & { from?: string },
): Ghost {
  return partial
}

const SHIFT_GHOSTS: Ghost[] = [
  ghost({
    id: 'agatha',
    name: 'Агата Пепельная',
    anxiety: 8,
    preferredTemp: 'cold',
    deadline: '2026-09-09',
    needs: ['attic', 'no_people', 'dark'],
    from: 'особняк на Северной',
  }),
  ghost({
    id: 'moth',
    name: 'Мотылёк из фикуса',
    anxiety: 3,
    preferredTemp: 'mild',
    deadline: '2026-09-18',
    needs: [],
    from: 'квартира ботаника',
  }),
  ghost({
    id: 'captain',
    name: 'Капитан Иней',
    anxiety: 6,
    preferredTemp: 'icy',
    deadline: '2026-09-10',
    needs: ['quiet', 'damp', 'no_mirrors', 'attic'],
    from: 'лоцманская будка',
  }),
  ghost({
    id: 'baroness',
    name: 'Баронесса Без Отражения',
    anxiety: 9,
    preferredTemp: 'cool',
    deadline: '2026-09-11',
    needs: ['no_mirrors', 'no_people', 'dark'],
    from: 'зеркальный зал',
  }),
  ghost({
    id: 'aunt',
    name: 'Тётя Сырость',
    anxiety: 5,
    preferredTemp: 'cold',
    deadline: '2026-09-12',
    needs: ['damp', 'attic'],
    from: 'прачечная',
  }),
  ghost({
    id: 'noon',
    name: 'Барон Полуденный',
    anxiety: 2,
    preferredTemp: 'warm',
    deadline: '2026-09-20',
    needs: [],
    from: 'оранжерея',
  }),
  ghost({
    id: 'late',
    name: 'Господин Опоздавший',
    anxiety: 4,
    preferredTemp: 'cool',
    deadline: '2026-09-07',
    needs: ['quiet'],
    from: 'часовая лавка',
  }),
  ghost({
    id: 'sailor',
    name: 'Туманный Лоцман',
    anxiety: 7,
    preferredTemp: 'cold',
    deadline: '2026-09-14',
    needs: ['no_people', 'cold'],
    from: 'пристань',
  }),
]

const IMPOSSIBLE_GHOSTS: Ghost[] = [
  ghost({
    id: 'incompatible',
    name: 'Чердачная Моль',
    anxiety: 8,
    preferredTemp: 'cold',
    deadline: '2026-09-13',
    needs: ['attic', 'no_mirrors', 'no_people', 'damp', 'dark'],
    from: 'заколоченный флигель',
  }),
]

const OVERFILL_GHOSTS: Ghost[] = [
  ghost({
    id: 'a1',
    name: 'Первая чердачная',
    anxiety: 8,
    preferredTemp: 'cold',
    deadline: '2026-09-09',
    needs: ['attic', 'damp', 'no_people', 'dark'],
  }),
  ghost({
    id: 'a2',
    name: 'Вторая чердачная',
    anxiety: 7,
    preferredTemp: 'icy',
    deadline: '2026-09-10',
    needs: ['attic', 'damp', 'no_people'],
  }),
  ghost({
    id: 'a3',
    name: 'Третья чердачная',
    anxiety: 6,
    preferredTemp: 'cold',
    deadline: '2026-09-11',
    needs: ['attic', 'damp', 'no_people', 'quiet'],
  }),
  ghost({
    id: 'a4',
    name: 'Четвёртая чердачная',
    anxiety: 9,
    preferredTemp: 'cold',
    deadline: '2026-09-12',
    needs: ['attic', 'damp', 'no_people', 'dark'],
  }),
]

function clonePlaces(patch?: Partial<Place> & { id: string }): Place[] {
  return PLACES.map((place) => {
    if (patch && place.id === patch.id) return { ...place, ...patch }
    return { ...place }
  })
}

export const SCENARIOS: Record<Exclude<ScenarioId, 'broken'>, Scenario> = {
  shift: {
    id: 'shift',
    title: 'Ночная смена',
    blurb: 'Обычная очередь: часть заявок встанет, одна просрочена, чердак замка на двоих — тёте сырости не хватит места.',
    ghosts: SHIFT_GHOSTS,
    places: clonePlaces(),
  },
  empty: {
    id: 'empty',
    title: 'Пустая очередь',
    blurb: 'Заявок нет. Места обитания на месте — расселять некого.',
    ghosts: [],
    places: clonePlaces(),
  },
  impossible: {
    id: 'impossible',
    title: 'Невозможное переселение',
    blurb: 'Чердак замка опечатан. Заявка требует чердак, сырость, тьму и отсутствие людей и зеркал.',
    ghosts: IMPOSSIBLE_GHOSTS,
    places: clonePlaces({ id: 'castle', hasAttic: false, notes: 'Чердак опечатан до осени.' }),
  },
  overfill: {
    id: 'overfill',
    title: 'Чердак на троих',
    blurb: 'Четыре привидения подходят только в замок на три места. Четвёртое останется без адреса.',
    ghosts: OVERFILL_GHOSTS,
    places: clonePlaces({ id: 'castle', capacity: 3 }),
  },
}

export const SCENARIO_ORDER: ScenarioId[] = [
  'shift',
  'empty',
  'impossible',
  'overfill',
  'broken',
]

export const BROKEN_ERROR =
  'Не удалось прочитать журнал смены: файл реестра повреждён. Выберите другой сценарий или перезагрузите страницу.'
