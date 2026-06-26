export function TabNav({ tabs, activeTab, onTabChange }) {
  return (
    <div className="tab-nav">
      {tabs.map(tab => (
        <button
          key={tab}
          className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

export function StatCard({ label, value, color, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <label>{label}</label>
        <div className={`num ${color || ''}`}>{value ?? '—'}</div>
      </div>
      {icon && <div className="stat-icon">{icon}</div>}
    </div>
  )
}

export function Spinner() {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
    </div>
  )
}
