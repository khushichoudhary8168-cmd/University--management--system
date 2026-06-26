import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const ROLES = [
  { label: 'Student',           value: 'STUDENT',           path: '/student'   },
  { label: 'Teacher',           value: 'FACULTY',           path: '/faculty'   },
  { label: 'Admin',             value: 'ADMIN',             path: '/admin'     },
  { label: 'Admission Officer', value: 'ADMISSION_OFFICER', path: '/admission' },
]

export default function Header({ title, subtitle }) {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  function handleRoleClick(role) {
    if (role.value === user?.role) { setOpen(false); return }
    window.location.href = '/login'
  }

  return (
    <div className="header">
      <div className="header-left">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="role-wrap">
        <div className="role-card">
          <span className="role-label">Switch Role:</span>
          {ROLES.map(r => (
            <button
              key={r.value}
              className={`role-btn ${user?.role === r.value ? 'active' : ''}`}
              onClick={() => handleRoleClick(r)}
            >
              {r.label}
            </button>
          ))}
          <button className="role-btn logout" onClick={logout}>Logout</button>
        </div>
      </div>
    </div>
  )
}
