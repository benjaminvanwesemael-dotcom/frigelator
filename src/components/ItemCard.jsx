import { useState } from 'react'
import { CATS } from '../utils/cats'
import { daysLeft } from '../utils/expiry'

function pctColor(p) { return p > 50 ? '#69f0ae' : p > 20 ? '#ffb74d' : '#ff5370' }
function pctClass(p) { return p > 50 ? 'pct-high' : p > 20 ? 'pct-mid' : 'pct-low' }

export default function ItemCard({ item, onDelete, onUpdatePercentage }) {
  const [pct, setPct] = useState(item.percentage ?? 100)
  const timerRef = { current: null }

  const loc = (item.location || 'frigo').toLowerCase()
  const isFrigo = loc === 'frigo'
  const catKey = (item.category || 'overige').toLowerCase()
  const cat = CATS[catKey] || CATS.overige
  const n = daysLeft(item.expiry_date)
  const status = n === null ? null : n < 0 ? 'expired' : n <= 2 ? 'soon' : 'ok'
  const itemCls = status === 'soon' ? 'expiry-soon' : status === 'expired' ? 'expiry-expired' : ''

  const expiryLabel = () => {
    if (n === null) return null
    if (n < 0) return `verlopen (${Math.abs(n)}d geleden)`
    if (n === 0) return 'vervalt vandaag!'
    if (n === 1) return 'vervalt morgen!'
    if (n <= 2) return `vervalt over ${n} dagen!`
    return `vervalt ${item.expiry_date}`
  }

  const handleSlider = (val) => {
    const v = parseInt(val)
    setPct(v)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onUpdatePercentage(item.id, v), 600)
  }

  return (
    <div className={`item ${itemCls}`}>
      <div className="item-main">
        <div className={`item-icon ${isFrigo ? 'icon-frigo' : 'icon-diepvries'}`}>
          {isFrigo ? '🧊' : '❄️'}
        </div>
        <div className="item-info">
          <div className="item-name">{item.name}</div>
          <div className="item-meta">
            {(item.quantity || item.unit) && (
              <span>{[item.quantity, item.unit].filter(Boolean).join(' ')}</span>
            )}
            <span
              className="cat-badge"
              style={{ color: cat.color, background: cat.bg, borderColor: cat.color + '44' }}
            >
              {cat.emoji} {cat.label}
            </span>
            {status && (
              <span className={`expiry-tag ${status}`}>
                {status === 'expired' ? '🚨' : status === 'soon' ? '⚠️' : '✓'} {expiryLabel()}
              </span>
            )}
          </div>
        </div>
        <span className={`loc-badge ${isFrigo ? 'badge-frigo' : 'badge-diepvries'}`}>
          {isFrigo ? 'Frigo' : 'Diepvries'}
        </span>
        <button className="btn-del" onClick={() => onDelete(item.id, item.name)} title="Verwijderen">✕</button>
      </div>

      <div className="item-slider-row">
        <span className="slider-label">Nog aanwezig</span>
        <div className="slider-track-wrap">
          <input
            type="range"
            className="pct-slider"
            min="0" max="100" step="5"
            value={pct}
            onChange={e => handleSlider(e.target.value)}
          />
          <div className="slider-bar-bg">
            <div
              className="slider-bar-fill"
              style={{ width: pct + '%', backgroundColor: pctColor(pct) }}
            />
          </div>
        </div>
        <span className={`slider-value ${pctClass(pct)}`}>{pct}%</span>
      </div>
    </div>
  )
}
