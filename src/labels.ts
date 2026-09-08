import type { HardReason, Humidity, Lighting, Need, Noise, Temp } from './types'

export const TEMP: Record<Temp, string> = {
  icy: 'ледяная',
  cold: 'холодная',
  cool: 'прохладная',
  mild: 'умеренная',
  warm: 'тёплая',
}

export const LIGHTING: Record<Lighting, string> = {
  dark: 'темно',
  dim: 'сумрак',
  moderate: 'умеренно',
  bright: 'ярко',
}

export const NOISE: Record<Noise, string> = {
  silent: 'тишина',
  quiet: 'тихо',
  moderate: 'оживлённо',
  loud: 'шумно',
}

export const HUMIDITY: Record<Humidity, string> = {
  dry: 'сухо',
  normal: 'обычно',
  damp: 'сыро',
}

export const NEED: Record<Need, string> = {
  attic: 'нужен чердак',
  no_mirrors: 'боится зеркал',
  no_people: 'нельзя рядом с людьми',
  damp: 'любит сырость',
  quiet: 'нужна тишина',
  dark: 'боится света',
  cold: 'любит холод',
}

export const HARD_REASON: Record<HardReason, string> = {
  deadline_passed: 'Дедлайн переселения уже прошёл.',
  no_capacity: 'В этом месте нет свободных мест.',
  needs_attic: 'Нужен чердак, а в этом месте его нет.',
  fears_mirrors: 'Боится зеркал, а здесь они есть.',
  no_people: 'Нельзя селить рядом с людьми, а здесь люди бывают.',
  needs_damp: 'Любит сырость, а здесь слишком сухо.',
  needs_dark: 'Боится света, а здесь слишком светло.',
  needs_quiet: 'Нужна тишина, а здесь слишком шумно.',
  needs_cold: 'Любит холод, а здесь слишком тепло.',
}

export function anxietyLabel(value: number): string {
  if (value >= 8) return 'высокая'
  if (value >= 5) return 'средняя'
  return 'спокойная'
}

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  if (!year || !month || !day) return iso
  return `${day}.${month}.${year}`
}
