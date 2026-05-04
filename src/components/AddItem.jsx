import { useState, useRef, useEffect } from 'react'
import { CATS } from '../utils/cats'

export default function AddItem({ onAdd, showToast }) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [location, setLocation] = useState('frigo')
  const [category, setCategory] = useState('overige')
  const [aiBox, setAiBox] = useState(null) // null | 'thinking' | { cat, loc }
  const timerRef = useRef(null)
  const ctrlRef = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setAiBox(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleNameChange = (val) => {
    setName(val)
    clearTimeout(timerRef.current)
    if (ctrlRef.current) { ctrlRef.current.abort(); ctrlRef.current = null }
    if (val.trim().length < 2) { setAiBox(null); return }
    timerRef.current = setTimeout(() => {
      setAiBox('thinking')
      askAI(val.trim())
    }, 500)
  }

  const askAI = async (productName) => {
    ctrlRef.current = new AbortController()
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ctrlRef.current.signal,
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 100,
          system: `Je bent een assistent voor een koelkast-app. De gebruiker typt een productnaam.
Geef een suggestie voor categorie en opslaglocatie.
Categorie: kies uit: groenten, fruit, zuivel, beleg, vlees, dranken, overige
Locatie: kies uit: frigo, diepvries
Antwoord ALLEEN met een JSON-object zonder uitleg of markdown:
{"categorie":"zuivel","locatie":"frigo"}`,
          messages: [{ role: 'user', content: `Product: ${productName}` }]
        })
      })
      const data = await res.json()
      const text = (data.content || []).map(b => b.text || '').join('').trim()
      const parsed = JSON.parse(text)
      if (parsed.categorie && CATS[parsed.categorie]) setCategory(parsed.categorie)
      if (parsed.locatie) setLocation(parsed.locatie)
      setAiBox({ cat: parsed.categorie, loc: parsed.locatie })
    } catch (e) {
      if (e.name !== 'AbortError') setAiBox(null)
    }
  }

  const handleSubmit = async () => {
    if (!name.trim()) { showToast('Vul een naam in!', 'error'); return }
    const ok = await onAdd({
      name: name.trim(),
      quantity: quantity || null,
      unit: unit || null,
      location,
      category,
      expiry_date: expiryDate || null,
      percentage: 100
    })
    if (ok) {
      setName(''); setQuantity(''); setUnit(''); setExpiryDate('')
      setCategory('overige'); setLocation('frigo'); setAiBox(null)
    }
  }

  const cat = CATS[category] || CATS.overige

  return (
    <div className="add-section">
      <h2>+ Item toevoegen</h2>
      <div className="form-row">
        <div className="field" ref={wrapRef}>
          <label>Naam</label>
          <input
            type="text"
            placeholder="bv. Melk"
            value={name}
            onChange={e => handleNameChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoComplete="off"
          />
          {aiBox && (
            <div className="ai-suggestion show">
              <div className="ai-suggestion-title">✨ AI-suggestie</div>
              {aiBox === 'thinking' ? (
                <div className="ai-thinking">
                  <div className="spinner" />
                  Even nadenken…
                </div>
              ) : (
                <div className="ai-chips">
                  <span className="ai-chip is-cat" onClick={() => setCategory(aiBox.cat)}>
                    {CATS[aiBox.cat]?.emoji} {CATS[aiBox.cat]?.label}
                  </span>
                  <span className="ai-chip" onClick={() => setLocation(aiBox.loc)}>
                    {aiBox.loc === 'diepvries' ? '❄️ Diepvries' : '🧊 Frigo'}
                  </span>
                  <span className="ai-hint">← al ingesteld voor jou</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="field">
          <label>Hoeveelheid</label>
          <input type="number" placeholder="2" min="0" value={quantity} onChange={e => setQuantity(e.target.value)} />
        </div>

        <div className="field">
          <label>Eenheid</label>
          <input type="text" placeholder="liter" value={unit} onChange={e => setUnit(e.target.value)} />
        </div>

        <div className="field">
          <label>Vervaldatum</label>
          <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
        </div>

        <div className="field">
          <label>Locatie</label>
          <select value={location} onChange={e => setLocation(e.target.value)}>
            <option value="frigo">🧊 Frigo</option>
            <option value="diepvries">❄️ Diepvries</option>
          </select>
        </div>

        <div className="field">
          <label>Categorie</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="overige">📦 Overige</option>
            <option value="groenten">🥦 Groenten</option>
            <option value="fruit">🍎 Fruit</option>
            <option value="zuivel">🥛 Zuivel</option>
            <option value="beleg">🧀 Beleg</option>
            <option value="vlees">🥩 Vlees</option>
            <option value="dranken">🥤 Dranken</option>
          </select>
        </div>

        <button className="btn-add" onClick={handleSubmit}>Toevoegen</button>
      </div>
    </div>
  )
}
