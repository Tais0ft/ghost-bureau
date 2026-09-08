import { formatDate } from '../labels'
import type { BureauReport } from '../domain/report'

export function ReportView({ report }: { report: BureauReport }) {
  return (
    <section className="report">
      <div className="report-hero">
        <article className="card stat">
          <p className="kicker">Расселено</p>
          <p className="num">{report.settled}</p>
          <p className="muted">из {report.total} заявок</p>
        </article>
        <article className="card stat">
          <p className="kicker">Без места</p>
          <p className="num">{report.unsettled}</p>
          <p className="muted">ждут другого адреса или смены правил</p>
        </article>
        <article className="card stat">
          <p className="kicker">Ручные правки</p>
          <p className="num">{report.manualCount}</p>
          <p className="muted">оператор изменил автоподбор</p>
        </article>
      </div>

      {report.total === 0 ? (
        <div className="empty">
          <h2>Отчёт пустой</h2>
          <p>Нет заявок — нечего сводить. Загрузите смену или добавьте привидение в очереди.</p>
        </div>
      ) : null}

      <div className="report-grid">
        <article className="card">
          <h2>Самые проблемные заявки</h2>
          {report.problems.length === 0 ? (
            <p className="muted">Всех удалось расселить.</p>
          ) : (
            <ul className="problem-list">
              {report.problems.map((item) => (
                <li key={item.ghost.id}>
                  <div>
                    <strong>{item.ghost.name}</strong>
                    <span> · дедлайн {formatDate(item.ghost.deadline)}</span>
                  </div>
                  <ul>
                    {item.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </article>
        <article className="card">
          <h2>Нагрузка на места</h2>
          {report.overloaded.length === 0 ? (
            <p className="muted">Перегруженных мест нет.</p>
          ) : (
            <ul className="problem-list">
              {report.overloaded.map((item) => (
                <li key={item.place.id}>
                  <strong>{item.place.name}</strong>
                  <span>
                    {' '}
                    · {item.occupied} из {item.place.capacity}
                    {item.occupied > item.place.capacity ? ' — перегруз' : ' — заполнено'}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {report.emptiest.length > 0 ? (
            <>
              <h3>Пустуют</h3>
              <ul className="residents">
                {report.emptiest.map((item) => (
                  <li key={item.place.id}>
                    {item.place.name} · {item.place.capacity} мест
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </article>
      </div>
    </section>
  )
}
