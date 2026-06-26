import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', username: '', password: '',
    email: '', phoneNumber: '', dateOfBirth: '', gender: '',
    guardianName: '', guardianPhone: '', address: '', departmentId: ''
  })
  const [departments, setDepartments] = useState([])
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/admin/departments').then(r => setDepartments(r.data.data || [])).catch(() => {})
  }, [])

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError(''); setSuccess('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    try {
      const payload = {
        fullName:     `${form.firstName} ${form.lastName}`.trim(),
        username:     form.username,
        password:     form.password,
        email:        form.email,
        phoneNumber:  form.phoneNumber,
        dateOfBirth:  form.dateOfBirth || null,
        gender:       form.gender,
        guardianName: form.guardianName,
        guardianPhone:form.guardianPhone,
        address:      form.address,
        departmentId: form.departmentId ? Number(form.departmentId) : null
      }
      await api.post('/auth/register', payload)
      setSuccess('Registration submitted! Your account is pending admin approval.')
      setForm({ firstName:'',lastName:'',username:'',password:'',email:'',phoneNumber:'',
                dateOfBirth:'',gender:'',guardianName:'',guardianPhone:'',address:'',departmentId:'' })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="login-page" style={{ alignItems: 'flex-start', paddingTop: 40 }}>
      <div className="register-card">
        <div className="brand" style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Student Registration</h1>
          <p style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
            Create your account — Admin will verify before you can login
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Enter first name" required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Enter last name" required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Username</label>
              <input name="username" value={form.username} onChange={handleChange} placeholder="Choose username" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" required />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="student@email.com" required />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="+91 9876543210" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date of Birth</label>
              <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Guardian Name</label>
              <input name="guardianName" value={form.guardianName} onChange={handleChange} placeholder="Parent/guardian name" />
            </div>
            <div className="form-group">
              <label>Guardian Phone</label>
              <input name="guardianPhone" value={form.guardianPhone} onChange={handleChange} placeholder="+91 9876543210" />
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea name="address" value={form.address} onChange={handleChange} placeholder="Full residential address" />
          </div>

          <div className="form-group">
            <label>Department</label>
            <select name="departmentId" value={form.departmentId} onChange={handleChange}>
              <option value="">Select department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          {error   && <div className="msg-error">{error}</div>}
          {success && <div className="msg-success">{success}</div>}

          <button type="submit" className="btn btn-primary btn-full mt-16" disabled={loading}>
            {loading ? 'Registering…' : 'Register'}
          </button>
        </form>

        <div className="text-center mt-16">
          <span style={{ fontSize: 14, color: '#666' }}>Already have an account? </span>
          <Link to="/login" className="link">Login</Link>
        </div>
      </div>
    </div>
  )
}
