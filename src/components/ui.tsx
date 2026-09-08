import { NEED, TEMP, anxietyLabel, formatDate } from '../labels'
import type { Ghost, Need } from '../types'
import type { ReactNode } from 'react'

export function Chip({
  children,
  tone = 'fog',
}: {
  children: ReactNode
  tone?: 'fog' | 'sage' | 'rust' | 'brass'
}) {
  return <span className={`chip tone-${tone}`}>{children}</span>
}

export function GhostMeta({ ghost }: { ghost: Ghost }) {
  return (
    <ul className="meta">
      <li>
        Тревожность {ghost.anxiety}/10 · {anxietyLabel(ghost.anxiety)}
      </li>
      <li>Любимая температура: {TEMP[ghost.preferredTemp]}</li>
      <li>Дедлайн: {formatDate(ghost.deadline)}</li>
      {ghost.from ? <li>Откуда: {ghost.from}</li> : null}
    </ul>
  )
}

export function NeedList({ needs }: { needs: Need[] }) {
  if (needs.length === 0) return <p className="muted">Особых условий нет.</p>
  return (
    <ul className="needs">
      {needs.map((need) => (
        <li key={need}>{NEED[need]}</li>
      ))}
    </ul>
  )
}

export function Formula() {
  return (
    <aside className="formula">
      <h2>Как бюро выбирает место</h2>
      <p>
        Сначала жёсткие отказы: просроченный дедлайн, нет мест, конфликт особого условия. Если отказ не
        сработал, считается балл из 100.
      </p>
      <ol>
        <li>Температура — до 25</li>
        <li>Свет под тревожность — до 20</li>
        <li>Шум под тревожность — до 15</li>
        <li>Влажность — до 10</li>
        <li>Свободная вместимость — до 15</li>
        <li>Близость дедлайна — до 15</li>
      </ol>
      <p>
        Автоподбор идёт по дедлайну, затем по тревожности. Ручной выбор может нарушить правила — бюро
        покажет, что именно не так.
      </p>
    </aside>
  )
}