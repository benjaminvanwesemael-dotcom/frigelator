import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient'
import Header from './components/Header'
import Stats from './components/Stats'
import AddItem from './components/AddItem'
import ItemList from './components/ItemList'
import './styles/global.css'
import './App.css'

export default function App() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterLoc, setFilterLoc] = useState('all')
  const [filterCat, setFilterCat] = useState('all')
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const fetchItems = useCallback(async () => {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      showToast('Kon items niet laden.', 'error')
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const addItem = async (item) => {
    const { error } = await supabase.from('items').insert([item])
    if (error) { showToast('Kon item niet toevoegen.', 'error'); return false }
    showToast(`✅ "${item.name}" toegevoegd!`, 'success')
    fetchItems()
    return true
  }

  const deleteItem = async (id, name) => {
    const { error } = await supabase.from('items').delete().eq('id', id)
    if (error) { showToast('Kon item niet verwijderen.', 'error'); return }
    showToast(`🗑️ "${name}" verwijderd`, 'success')
    fetchItems()
  }

  const updatePercentage = async (id, percentage) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, percentage } : i))
    await supabase.from('items').update({ percentage }).eq('id', id)
  }

  const filtered = items.filter(i => {
    const locMatch = filterLoc === 'all' || (i.location || 'frigo').toLowerCase() === filterLoc
    const catMatch = filterCat === 'all' || (i.category || 'overige').toLowerCase() === filterCat
    return locMatch && catMatch
  })

  return (
    <div className="app">
      <Header />
      <Stats items={items} />

      <div className="filter-group">
        <div className="filter-label">Locatie</div>
        <div className="tabs">
          {['all', 'frigo', 'diepvries'].map(loc => (
            <button
              key={loc}
              className={`tab${filterLoc === loc ? ' active' : ''}`}
              onClick={() => setFilterLoc(loc)}
            >
              {loc === 'all' ? 'Alles' : loc === 'frigo' ? '🧊 Frigo' : '❄️ Diepvries'}
            </button>
          ))}
        </div>
        <div className="filter-label" style={{ marginTop: '4px' }}>Categorie</div>
        <div className="tabs">
          {[
            { key: 'all', label: 'Alles', color: null },
            { key: 'groenten', label: 'Groenten', color: '#69f0ae' },
            { key: 'fruit', label: 'Fruit', color: '#ffb74d' },
            { key: 'zuivel', label: 'Zuivel', color: '#4fc3f7' },
            { key: 'beleg', label: 'Beleg', color: '#ce93d8' },
            { key: 'vlees', label: 'Vlees', color: '#ff5370' },
            { key: 'dranken', label: 'Dranken', color: '#90caf9' },
            { key: 'overige', label: 'Overige', color: '#7a8a9a' },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              className={`tab${filterCat === key ? ' active' : ''}`}
              onClick={() => setFilterCat(key)}
            >
              {color && <span className="dot" style={{ background: color }} />}
              {label}
            </button>
          ))}
        </div>
      </div>

      <AddItem onAdd={addItem} showToast={showToast} />
      <ItemList
        items={filtered}
        loading={loading}
        onDelete={deleteItem}
        onUpdatePercentage={updatePercentage}
      />

      {toast && (
        <div className={`toast show ${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  )
}
