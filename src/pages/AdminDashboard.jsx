import { useState, useEffect } from 'react'
import Header from '../components/Header'
import { TabNav, StatCard, Spinner } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'

const TABS = ['Overview', 'Departments', 'Courses', 'Faculty', 'Reports']

export default function AdminDashboard() {
  const { user } = useAuth()
  const toast    = useToast()
  const [tab, setTab]           = useState('Overview')
  const [stats, setStats]       = useState(null)
  const [departments, setDepts] = useState([])
  const [courses, setCourses]   = useState([])
  const [faculty, setFaculty]   = useState([])
  const [pendingStudents, setPending] = useState([])
  const [allStudents, setAllStudents] = useState([])
  const [loading, setLoading]   = useState(true)

  // Dept form
  const [showDeptForm, setShowDeptForm] = useState(false)
  const [editDept, setEditDept]         = useState(null)
  const [deptForm, setDeptForm]         = useState({ name: '', code: '', description: '' })

  // Course form
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [courseForm, setCourseForm] = useState({ name: '', code: '', description: '', credits: '', semester: '', departmentId: '', facultyId: '' })

  // Faculty form
  const [showFacultyForm, setShowFacultyForm] = useState(false)
  const [facForm, setFacForm] = useState({ username:'', password:'', email:'', fullName:'', phoneNumber:'', employeeId:'', designation:'', qualification:'', specialization:'', departmentId:'' })

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [sRes, dRes, cRes, fRes, pRes, aRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/departments'),
        api.get('/courses'),
        api.get('/admin/faculty'),
        api.get('/admin/students/pending'),
        api.get('/admin/students')
      ])
      setStats(sRes.data.data)
      setDepts(dRes.data.data || [])
      setCourses(cRes.data.data || [])
      setFaculty(fRes.data.data || [])
      setPending(pRes.data.data || [])
      setAllStudents(aRes.data.data || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  // ── Departments ──
  async function saveDept(e) {
    e.preventDefault()
    try {
      if (editDept) {
        await api.put(`/admin/departments/${editDept.id}`, deptForm)
        toast('Department updated!', 'success')
      } else {
        await api.post('/admin/departments', deptForm)
        toast('Department created!', 'success')
      }
      setShowDeptForm(false); setEditDept(null)
      setDeptForm({ name: '', code: '', description: '' })
      const r = await api.get('/admin/departments'); setDepts(r.data.data || [])
    } catch (e) { toast(e.response?.data?.message || 'Failed', 'error') }
  }

  function startEditDept(d) {
    setEditDept(d); setDeptForm({ name: d.name, code: d.code, description: d.description || '' })
    setShowDeptForm(true)
  }

  // ── Courses ──
  async function saveCourse(e) {
    e.preventDefault()
    try {
      await api.post('/courses', {
        ...courseForm, credits: Number(courseForm.credits), semester: Number(courseForm.semester),
        departmentId: Number(courseForm.departmentId), facultyId: courseForm.facultyId ? Number(courseForm.facultyId) : null
      })
      toast('Course created!', 'success')
      setShowCourseForm(false)
      setCourseForm({ name:'',code:'',description:'',credits:'',semester:'',departmentId:'',facultyId:'' })
      const r = await api.get('/courses'); setCourses(r.data.data || [])
    } catch (e) { toast(e.response?.data?.message || 'Failed', 'error') }
  }

  // ── Faculty ──
  async function saveFaculty(e) {
    e.preventDefault()
    try {
      await api.post('/admin/faculty', { ...facForm, departmentId: Number(facForm.departmentId) })
      toast('Faculty created!', 'success')
      setShowFacultyForm(false)
      setFacForm({ username:'',password:'',email:'',fullName:'',phoneNumber:'',employeeId:'',designation:'',qualification:'',specialization:'',departmentId:'' })
      const r = await api.get('/admin/faculty'); setFaculty(r.data.data || [])
    } catch (e) { toast(e.response?.data?.message || 'Failed', 'error') }
  }

  // ── Students ──
  async function approveStudent(userId) {
    try {
      const r = await api.put(`/admin/students/${userId}/approve`)
      toast(r.data.message || 'Student approved!', 'success')
      const [pRes, aRes] = await Promise.all([api.get('/admin/students/pending'), api.get('/admin/students')])
      setPending(pRes.data.data || []); setAllStudents(aRes.data.data || [])
    } catch (e) { toast(e.response?.data?.message || 'Failed', 'error') }
  }

  async function rejectStudent(userId) {
    try {
      await api.put(`/admin/students/${userId}/reject`)
      toast('Student rejected', 'success')
      const [pRes, aRes] = await Promise.all([api.get('/admin/students/pending'), api.get('/admin/students')])
      setPending(pRes.data.data || []); setAllStudents(aRes.data.data || [])
    } catch (e) { toast(e.response?.data?.message || 'Failed', 'error') }
  }

  if (loading) return <><Header title="Admin Dashboard" subtitle="System Management & Administration" /><Spinner /></>

  return (
    <>
      <Header title="Admin Dashboard" subtitle="System Management & Administration" />

      <div className="content">
        {/* Stats */}
        <div className="stats-row four">
          <StatCard label="Total Students" value={stats?.totalStudents ?? allStudents.length} icon="👥" />
          <StatCard label="Total Faculty"  value={stats?.totalFaculty  ?? faculty.length}      icon="👨‍🏫" />
          <StatCard label="Departments"    value={stats?.totalDepartments ?? departments.length} icon="🏛️" />
          <StatCard label="Total Courses"  value={courses.length}                               icon="📚" />
        </div>

        <div className="tab-panel">
          <TabNav tabs={TABS} activeTab={tab} onTabChange={setTab} />
          <div className="tab-content">

            {/* ── OVERVIEW ── */}
            {tab === 'Overview' && (
              <>
                <h3 style={{ marginBottom: 16 }}>Recent Activities</h3>
                <div className="activity-card">
                  <div>
                    <h4>Pending Student Approvals</h4>
                    <p>{pendingStudents.length} student(s) awaiting verification</p>
                  </div>
                  <span className="badge-new">New</span>
                </div>
                <div className="activity-card">
                  <div>
                    <h4>Departments Available</h4>
                    <p>{departments.length} department(s) created in the system</p>
                  </div>
                  <span className="badge-info">Info</span>
                </div>
                <div className="activity-card">
                  <div>
                    <h4>Faculty Members</h4>
                    <p>{faculty.length} faculty member(s) registered</p>
                  </div>
                  <span className="badge-update">Update</span>
                </div>
              </>
            )}

            {/* ── DEPARTMENTS ── */}
            {tab === 'Departments' && (
              <>
                <div className="section-header">
                  <h3>Departments</h3>
                  <button className="btn btn-primary btn-sm" onClick={() => { setShowDeptForm(s => !s); setEditDept(null); setDeptForm({ name:'',code:'',description:'' }) }}>
                    {showDeptForm && !editDept ? 'Cancel' : 'Create Department'}
                  </button>
                </div>

                {showDeptForm && (
                  <div className="inline-panel" style={{ marginBottom: 20 }}>
                    <h4>{editDept ? 'Edit Department' : 'Create New Department'}</h4>
                    <form onSubmit={saveDept}>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Department Name</label>
                          <input value={deptForm.name} onChange={e => setDeptForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Computer Science" required />
                        </div>
                        <div className="form-group">
                          <label>Department Code</label>
                          <input value={deptForm.code} onChange={e => setDeptForm(f => ({ ...f, code: e.target.value }))} placeholder="e.g. CS" required disabled={!!editDept} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea value={deptForm.description} onChange={e => setDeptForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" />
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary btn-sm">{editDept ? 'Update' : 'Create'}</button>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => { setShowDeptForm(false); setEditDept(null) }}>Cancel</button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Department Name</th><th>Code</th><th>Description</th><th>Actions</th></tr></thead>
                    <tbody>
                      {departments.length === 0
                        ? <tr><td colSpan={4}><p className="msg-empty">No departments yet</p></td></tr>
                        : departments.map(d => (
                            <tr key={d.id}>
                              <td className="td-bold">{d.name}</td>
                              <td>{d.code}</td>
                              <td style={{ color: '#666' }}>{d.description || '—'}</td>
                              <td><button className="btn-text" onClick={() => startEditDept(d)}>Edit</button></td>
                            </tr>
                          ))
                      }
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ── COURSES ── */}
            {tab === 'Courses' && (
              <>
                <div className="section-header">
                  <h3>Courses</h3>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowCourseForm(s => !s)}>
                    {showCourseForm ? 'Cancel' : 'Create Course'}
                  </button>
                </div>

                {showCourseForm && (
                  <div className="inline-panel" style={{ marginBottom: 20 }}>
                    <h4>Create New Course</h4>
                    <form onSubmit={saveCourse}>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Course Name</label>
                          <input value={courseForm.name} onChange={e => setCourseForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Data Structures" required />
                        </div>
                        <div className="form-group">
                          <label>Course Code</label>
                          <input value={courseForm.code} onChange={e => setCourseForm(f => ({ ...f, code: e.target.value }))} placeholder="e.g. CS401" required />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Credits</label>
                          <input type="number" value={courseForm.credits} onChange={e => setCourseForm(f => ({ ...f, credits: e.target.value }))} placeholder="e.g. 4" min="1" max="6" required />
                        </div>
                        <div className="form-group">
                          <label>Semester</label>
                          <input type="number" value={courseForm.semester} onChange={e => setCourseForm(f => ({ ...f, semester: e.target.value }))} placeholder="e.g. 1" min="1" max="8" required />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Department</label>
                          <select value={courseForm.departmentId} onChange={e => setCourseForm(f => ({ ...f, departmentId: e.target.value }))} required>
                            <option value="">Select department</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Assign Faculty</label>
                          <select value={courseForm.facultyId} onChange={e => setCourseForm(f => ({ ...f, facultyId: e.target.value }))}>
                            <option value="">Select faculty (optional)</option>
                            {faculty.map(f => <option key={f.id} value={f.id}>{f.user?.fullName}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea value={courseForm.description} onChange={e => setCourseForm(f => ({ ...f, description: e.target.value }))} placeholder="Course description" />
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary btn-sm">Create</button>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowCourseForm(false)}>Cancel</button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Course Code</th><th>Course Name</th><th>Department</th><th>Credits</th><th>Faculty</th><th>Actions</th></tr></thead>
                    <tbody>
                      {courses.length === 0
                        ? <tr><td colSpan={6}><p className="msg-empty">No courses yet</p></td></tr>
                        : courses.map(c => (
                            <tr key={c.id}>
                              <td className="td-bold">{c.code}</td>
                              <td>{c.name}</td>
                              <td style={{ color: '#666' }}>{c.departmentName || '—'}</td>
                              <td>{c.credits}</td>
                              <td style={{ color: '#666' }}>{c.facultyName || 'Unassigned'}</td>
                              <td><button className="btn-text">Manage</button></td>
                            </tr>
                          ))
                      }
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ── FACULTY ── */}
            {tab === 'Faculty' && (
              <>
                <div className="section-header">
                  <h3>Faculty Members</h3>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowFacultyForm(s => !s)}>
                    {showFacultyForm ? 'Cancel' : 'Add Faculty'}
                  </button>
                </div>

                {showFacultyForm && (
                  <div className="inline-panel" style={{ marginBottom: 20 }}>
                    <h4>Create Faculty Account</h4>
                    <form onSubmit={saveFaculty}>
                      <div className="form-row">
                        <div className="form-group"><label>Full Name</label><input value={facForm.fullName} onChange={e => setFacForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Dr. Full Name" required /></div>
                        <div className="form-group"><label>Employee ID</label><input value={facForm.employeeId} onChange={e => setFacForm(f => ({ ...f, employeeId: e.target.value }))} placeholder="EMP001" required /></div>
                      </div>
                      <div className="form-row">
                        <div className="form-group"><label>Username</label><input value={facForm.username} onChange={e => setFacForm(f => ({ ...f, username: e.target.value }))} placeholder="Username" required /></div>
                        <div className="form-group"><label>Password</label><input type="password" value={facForm.password} onChange={e => setFacForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 chars" required /></div>
                      </div>
                      <div className="form-group"><label>Email</label><input type="email" value={facForm.email} onChange={e => setFacForm(f => ({ ...f, email: e.target.value }))} placeholder="faculty@university.com" required /></div>
                      <div className="form-row">
                        <div className="form-group"><label>Phone</label><input value={facForm.phoneNumber} onChange={e => setFacForm(f => ({ ...f, phoneNumber: e.target.value }))} placeholder="+91 9876543210" /></div>
                        <div className="form-group"><label>Designation</label><input value={facForm.designation} onChange={e => setFacForm(f => ({ ...f, designation: e.target.value }))} placeholder="Professor / HOD" /></div>
                      </div>
                      <div className="form-row">
                        <div className="form-group"><label>Qualification</label><input value={facForm.qualification} onChange={e => setFacForm(f => ({ ...f, qualification: e.target.value }))} placeholder="PhD / M.Tech" /></div>
                        <div className="form-group"><label>Specialization</label><input value={facForm.specialization} onChange={e => setFacForm(f => ({ ...f, specialization: e.target.value }))} placeholder="e.g. Data Structures" /></div>
                      </div>
                      <div className="form-group">
                        <label>Department</label>
                        <select value={facForm.departmentId} onChange={e => setFacForm(f => ({ ...f, departmentId: e.target.value }))} required>
                          <option value="">Select department</option>
                          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary btn-sm">Create Faculty</button>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowFacultyForm(false)}>Cancel</button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Name</th><th>Department</th><th>Role</th><th>Employee ID</th><th>Actions</th></tr></thead>
                    <tbody>
                      {faculty.length === 0
                        ? <tr><td colSpan={5}><p className="msg-empty">No faculty yet</p></td></tr>
                        : faculty.map(f => (
                            <tr key={f.id}>
                              <td className="td-bold">{f.user?.fullName}</td>
                              <td style={{ color: '#666' }}>{f.department?.name || '—'}</td>
                              <td>
                                {f.designation?.toLowerCase().includes('hod')
                                  ? <span className="badge-hod">HOD</span>
                                  : <span className="badge-prof">{f.designation || 'Professor'}</span>
                                }
                              </td>
                              <td style={{ color: '#666' }}>{f.employeeId}</td>
                              <td><button className="btn-text">Manage</button></td>
                            </tr>
                          ))
                      }
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ── REPORTS ── */}
            {tab === 'Reports' && (
              <>
                <div className="section-header"><h3>Pending Student Approvals</h3></div>
                {pendingStudents.length === 0
                  ? <p className="msg-empty">No pending approvals</p>
                  : <div className="table-wrap" style={{ marginBottom: 32 }}>
                      <table>
                        <thead><tr><th>Full Name</th><th>Email</th><th>Phone</th><th>Applied</th><th>Actions</th></tr></thead>
                        <tbody>
                          {pendingStudents.map(s => (
                            <tr key={s.id}>
                              <td className="td-bold">{s.fullName}</td>
                              <td>{s.email}</td>
                              <td>{s.phoneNumber || '—'}</td>
                              <td style={{ color: '#666', fontSize: 13 }}>{s.createdAt?.split('T')[0] || '—'}</td>
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

                <hr className="divider" />
                <div className="section-header"><h3>All Students</h3></div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Enrollment No</th></tr></thead>
                    <tbody>
                      {allStudents.length === 0
                        ? <tr><td colSpan={4}><p className="msg-empty">No students found</p></td></tr>
                        : allStudents.map(s => (
                            <tr key={s.id}>
                              <td className="td-bold">{s.fullName}</td>
                              <td>{s.email}</td>
                              <td>
                                <span className={`badge badge-${s.status === 'ACTIVE' ? 'active' : s.status === 'REJECTED' ? 'rejected' : 'pending'}`}>
                                  {s.status}
                                </span>
                              </td>
                              <td style={{ color: '#666' }}>—</td>
                            </tr>
                          ))
                      }
                    </tbody>
                  </table>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
