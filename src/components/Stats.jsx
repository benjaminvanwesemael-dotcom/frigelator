import { daysLeft } from '../utils/expiry'

export default function Stats({ items }) {
  const warnCount = items.filter(i => {
    const n = daysLeft(i.expiry_date)
    return n !== null && n <= 2
  }).length

  return (
    <>
      <div className="stats">
        <div className="stat-chip">Totaal <strong>{items.length}</strong></div>
        <div className="stat-chip">🧊 Frigo <strong>{items.filter(i => (i.location || '').toLowerCase() === 'frigo').length}</strong></div>
        <div className="stat-chip">❄️ Diepvries <strong>{items.filter(i => (i.location || '').toLowerCase() === 'diepvries').length}</strong></div>
        <div
          className="stat-chip"
          style={warnCount > 0 ? { borderColor: 'rgba(255,183,77,0.4)', color: 'var(--warn)' } : {}}
        >
          ⚠️ Bijna vervallen <strong>{warnCount}</strong>
        </div>
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
