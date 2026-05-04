import { daysLeft } from '../utils/expiry'

export default function Stats({ items }) {
  const warnCount = items.filter(i => {
    const n = daysLeft(i.expiry_date)
    return n !== null && n <= 2
  }).length

  const frigoCount = items.filter(i => (i.location || '').toLowerCase() === 'frigo').length
  const diepvriesCount = items.filter(i => (i.location || '').toLowerCase() === 'diepvries').length

  return (
    <>
      <div className="stats-bar">
        <span className="stats-bar-item">
          🧊 Frigo <strong>{frigoCount}</strong>
        </span>
        <span className="stats-bar-sep">·</span>
        <span className="stats-bar-item">
          ❄️ Diepvries <strong>{diepvriesCount}</strong>
        </span>
        {warnCount > 0 && (
          <>
            <span className="stats-bar-sep">·</span>
            <span className="stats-bar-item warn">
              ⚠️ <strong>{warnCount}</strong> bijna vervallen
            </span>
          </>
        )}
      </div>

      {warnCount > 0 && (
        <div className="expiry-banner show">
          <div className="expiry-banner-icon">⚠️</div>
          <div>
            <div className="expiry-banner-title">Let op — items vervallen binnenkort of zijn verlopen</div>
            {items
              .filter(i => { const n = daysLeft(i.expiry_date); return n !== null && n <= 2 })
              .map(i => {
                const n = daysLeft(i.expiry_date)
                const expired = n < 0
                return (
                  <div key={i.id} className={`expiry-banner-item${expired ? ' expired' : ''}`}>
                    <strong>{i.name}</strong> — {expired
                      ? `verlopen (${Math.abs(n)}d geleden)`
                      : n === 0 ? 'vervalt vandaag!'
                      : n === 1 ? 'vervalt morgen!'
                      : `vervalt over ${n} dagen!`}
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </>
  )
}
