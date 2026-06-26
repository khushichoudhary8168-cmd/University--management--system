import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const ROLE_PATHS = {
  STUDENT: '/student',
  FACULTY: '/faculty',
  ADMIN: '/admin',
  ADMISSION_OFFICER: '/admission'
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]     = useState({ username: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.username || !form.password) { setError('Please fill all fields.'); return }
    setLoading(true)
    try {
      const res  = await api.post('/auth/login', form)
      const data = res.data.data
      if (data.status === 'PENDING')   { setError('Account pending admin approval. Please wait.'); setLoading(false); return }
      if (data.status === 'REJECTED')  { setError('Your account has been rejected. Contact admin.'); setLoading(false); return }
      if (data.status === 'INACTIVE')  { setError('Your account is inactive. Contact admin.'); setLoading(false); return }
      login(data.token, data.username, data.role, data.fullName)
      navigate(ROLE_PATHS[data.role] || '/login')
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid username or password.'
      setError(msg)
    }
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand">
          <h1>🎓 UMS</h1>
          <p>University Management System</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input name="username" value={form.username} onChange={handleChange} placeholder="Enter username" autoFocus />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Enter password" />
          </div>

          {error && <div className="msg-error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-full mt-16" disabled={loading}>
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-16">
          <span style={{ fontSize: 14, color: '#666' }}>New student? </span>
          <Link to="/register" className="link">Register here</Link>
        </div>

        <div style={{ marginTop: 24, padding: 12, background: '#f5f5f5', borderRadius: 6, fontSize: 12, color: '#666' }}>
          <strong>Default Admin:</strong> admin / admin123
        </div>
      </div>
    </div>
  )
}
