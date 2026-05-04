import ItemCard from './ItemCard'

export default function ItemList({ items, loading, onDelete, onUpdatePercentage }) {
  if (loading) {
    return <div className="loading"><span className="dot-anim">Laden</span></div>
  }

  if (!items.length) {
    return (
      <div className="empty">
        <div className="icon">🔍</div>
        <p>Geen items voor deze filter.<br />Voeg iets toe of pas de filter aan.</p>
      </div>
    )
  }

  return (
    <div className="items-list">
      {items.map(item => (
        <ItemCard
          key={item.id}
          item={item}
          onDelete={onDelete}
          onUpdatePercentage={onUpdatePercentage}
        />
      ))}
    </div>
  )
}
