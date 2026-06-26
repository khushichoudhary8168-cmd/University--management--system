import { useState, useEffect } from 'react'
import Header from '../components/Header'
import { TabNav, StatCard, Spinner } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'

const TABS = ['Applications', 'Register', 'Approved']

export default function AdmissionDashboard() {
  const { user } = useAuth()
  const toast    = useToast()
  const [tab, setTab]           = useState('Applications')
  const [allStudents, setAll]   = useState([])
  const [departments, setDepts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [modalEnroll, setModalEnroll] = useState(null) // student object

  const [form, setForm] = useState({
    firstName:'', lastName:'', email:'', phoneNumber:'',
    dateOfBirth:'', gender:'', departmentId:'',
    username:'', password:'', guardianName:'', guardianPhone:'', address:''
  })
  const [regError, setRegError]     = useState('')
  const [regSuccess, setRegSuccess] = useState('')
  const [regLoading, setRegLoading] = useState(false)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [sRes, dRes] = await Promise.all([
        api.get('/admin/students'),
        api.get('/admin/departments')
      ])
      setAll(sRes.data.data || [])
      setDepts(dRes.data.data || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const pending  = allStudents.filter(s => s.status === 'PENDING')
  const approved = allStudents.filter(s => s.status === 'ACTIVE')
  const rejected = allStudents.filter(s => s.status === 'REJECTED')

  const filteredPending = pending.filter(s =>
    s.fullName?.toLowerCase().includes(search.toLowerCase())
  )

  async function approveStudent(userId) {
    try {
      const r = await api.put(`/admin/students/${userId}/approve`)
      toast(r.data.message || 'Student approved!', 'success')
      await fetchAll()
    } catch (e) { toast(e.response?.data?.message || 'Failed', 'error') }
  }

  async function rejectStudent(userId) {
    try {
      await api.put(`/admin/students/${userId}/reject`)
      toast('Student rejected', 'success')
      await fetchAll()
    } catch (e) { toast(e.response?.data?.message || 'Failed', 'error') }
  }

  function handleForm(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setRegError(''); setRegSuccess('')
  }

  async function handleRegister(e) {
    e.preventDefault()
    setRegLoading(true); setRegError(''); setRegSuccess('')
    try {
      await api.post('/auth/register', {
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
      })
      setRegSuccess('Student registered successfully. Pending admin approval.')
      setForm({ firstName:'',lastName:'',email:'',phoneNumber:'',dateOfBirth:'',gender:'',departmentId:'',username:'',password:'',guardianName:'',guardianPhone:'',address:'' })
      await fetchAll()
    } catch (e) { setRegError(e.response?.data?.message || 'Registration failed.') }
    setRegLoading(false)
  }

  if (loading) return <><Header title="Admission Officer Dashboard" subtitle="Manage student applications and admissions" /><Spinner /></>

  return (
    <>
      <Header title="Admission Officer Dashboard" subtitle="Manage student applications and admissions" />

      {/* Modal for enrollment number */}
      {modalEnroll && (
        <div className="modal-overlay" onClick={() => setModalEnroll(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Student ID</h3>
            <p><strong>Name:</strong> {modalEnroll.fullName}</p>
            <p style={{ marginTop: 8 }}><strong>Enrollment No:</strong> {modalEnroll.enrollmentNumber || 'Will be generated after approval'}</p>
            <div style={{ marginTop: 20 }}>
              <button className="btn btn-primary btn-sm" onClick={() => setModalEnroll(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="content">
        {/* Stats */}
        <div className="stats-row four">
          <StatCard label="Total Applications" value={allStudents.length} />
          <StatCard label="Pending Review"     value={pending.length} />
          <StatCard label="Approved"           value={approved.length} color="green" />
          <StatCard label="Rejected"           value={rejected.length} color="red" />
        </div>

        <div className="tab-panel">
          <TabNav tabs={TABS} activeTab={tab} onTabChange={setTab} />
          <div className="tab-content">

            {/* ── APPLICATIONS ── */}
            {tab === 'Applications' && (
              <>
                <div className="section-header">
                  <h3>Pending Applications</h3>
                  <input
                    className="search-input"
                    placeholder="Search applications..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>

                {filteredPending.length === 0
                  ? <p className="msg-empty">No pending applications</p>
                  : <div className="table-wrap">
                      <table>
                        <thead>
                          <tr><th>App ID</th><th>Name</th><th>Program</th><th>Date</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                          {filteredPending.map((s, i) => (
                            <tr key={s.id}>
                              <td className="td-bold">APP{String(i + 1).padStart(3, '0')}</td>
                              <td>{s.fullName}</td>
                              <td style={{ color: '#666' }}>N/A</td>
                              <td style={{ color: '#666', fontSize: 13 }}>{s.createdAt?.split('T')[0] || '—'}</td>
                              <td><span className="badge badge-pending">pending</span></td>
                              <td>
                                <div className="flex-gap">
                                  <button className="btn-green" onClick={() => approveStudent(s.id)}>Approve</button>
                                  <button className="btn-red"   onClick={() => rejectStudent(s.id)}>Reject</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                }
              </>
            )}

            {/* ── REGISTER ── */}
            {tab === 'Register' && (
              <>
                <div className="section-header"><h3>Register New Student</h3></div>
                <form onSubmit={handleRegister}>
                  <div className="form-row">
                    <div className="form-group"><label>First Name</label><input name="firstName" value={form.firstName} onChange={handleForm} placeholder="Enter first name" required /></div>
                    <div className="form-group"><label>Last Name</label><input name="lastName" value={form.lastName} onChange={handleForm} placeholder="Enter last name" required /></div>
                  </div>
                  <div className="form-group"><label>Email</label><input name="email" type="email" value={form.email} onChange={handleForm} placeholder="student@email.com" required /></div>
                  <div className="form-group"><label>Phone Number</label><input name="phoneNumber" value={form.phoneNumber} onChange={handleForm} placeholder="+1 (555) 000-0000" /></div>
                  <div className="form-row">
                    <div className="form-group"><label>Date of Birth</label><input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleForm} /></div>
                    <div className="form-group">
                      <label>Gender</label>
                      <select name="gender" value={form.gender} onChange={handleForm}>
                        <option value="">Select gender</option>
                        <option>Male</option><option>Female</option><option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <select name="departmentId" value={form.departmentId} onChange={handleForm}>
                      <option value="">Select department</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label>Username</label><input name="username" value={form.username} onChange={handleForm} placeholder="Choose username" required /></div>
                    <div className="form-group"><label>Password</label><input name="password" type="password" value={form.password} onChange={handleForm} placeholder="Min 6 characters" required /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label>Guardian Name</label><input name="guardianName" value={form.guardianName} onChange={handleForm} placeholder="Parent/guardian name" /></div>
                    <div className="form-group"><label>Guardian Phone</label><input name="guardianPhone" value={form.guardianPhone} onChange={handleForm} placeholder="+91 9876543210" /></div>
                  </div>
                  <div className="form-group"><label>Address</label><textarea name="address" value={form.address} onChange={handleForm} placeholder="Full residential address" /></div>

                  {regError   && <div className="msg-error">{regError}</div>}
                  {regSuccess && <div className="msg-success">{regSuccess}</div>}

                  <button type="submit" className="btn btn-primary btn-full mt-16" disabled={regLoading}>
                    {regLoading ? 'Registering…' : 'Register Student'}
                  </button>
                </form>
              </>
            )}

            {/* ── APPROVED ── */}
            {tab === 'Approved' && (
              <>
                <div className="section-header"><h3>Approved Applications</h3></div>
                {approved.length === 0
                  ? <p className="msg-empty">No approved applications yet</p>
                  : <div className="table-wrap">
                      <table>
                        <thead>
                          <tr><th>App ID</th><th>Name</th><th>Program</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                          {approved.map((s, i) => (
                            <tr key={s.id}>
                              <td className="td-bold">APP{String(i + 1).padStart(3, '0')}</td>
                              <td>{s.fullName}</td>
                              <td style={{ color: '#666' }}>N/A</td>
                              <td>
                                <button className="btn btn-primary btn-sm" onClick={() => setModalEnroll(s)}>
                                  Generate ID
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                }
              </>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
