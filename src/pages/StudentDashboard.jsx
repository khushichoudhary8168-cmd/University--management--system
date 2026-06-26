import { useState, useEffect } from 'react'
import Header from '../components/Header'
import { TabNav, StatCard, Spinner } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'

const TABS = ['Overview', 'Courses', 'Attendance', 'Marks']

export default function StudentDashboard() {
  const { user }  = useAuth()
  const toast     = useToast()
  const [tab, setTab]         = useState('Overview')
  const [profile, setProfile] = useState(null)
  const [courses, setCourses] = useState([])
  const [allCourses, setAllCourses]   = useState([])
  const [marks, setMarks]             = useState([])
  const [leaves, setLeaves]           = useState([])
  const [attendance, setAttendance]   = useState({}) // courseId -> data
  const [loading, setLoading]         = useState(true)
  const [showEnroll, setShowEnroll]   = useState(false)
  const [showLeaveForm, setShowLeaveForm] = useState(false)
  const [leaveForm, setLeaveForm]     = useState({ reason: '', fromDate: '', toDate: '' })

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [pRes, cRes, mRes, lRes] = await Promise.all([
        api.get('/student/profile'),
        api.get('/student/courses'),
        api.get('/student/marks'),
        api.get('/student/leaves')
      ])
      setProfile(pRes.data.data)
      setCourses(cRes.data.data || [])
      setMarks(mRes.data.data || [])
      setLeaves(lRes.data.data || [])

      // fetch attendance per course
      const enrolled = cRes.data.data || []
      const attMap = {}
      await Promise.all(enrolled.map(async c => {
        try {
          const r = await api.get(`/student/attendance/${c.id}`)
          attMap[c.id] = r.data.data
        } catch { attMap[c.id] = null }
      }))
      setAttendance(attMap)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function fetchAllCourses() {
    const r = await api.get('/courses')
    setAllCourses(r.data.data || [])
  }

  async function enroll(courseId) {
    try {
      await api.post(`/student/courses/${courseId}/enroll`)
      toast('Enrolled successfully!', 'success')
      setShowEnroll(false)
      fetchAll()
    } catch (e) {
      toast(e.response?.data?.message || 'Enrollment failed', 'error')
    }
  }

  async function applyLeave(e) {
    e.preventDefault()
    try {
      await api.post('/student/leaves', leaveForm)
      toast('Leave application submitted!', 'success')
      setLeaveForm({ reason: '', fromDate: '', toDate: '' })
      setShowLeaveForm(false)
      const r = await api.get('/student/leaves')
      setLeaves(r.data.data || [])
    } catch (e) {
      toast(e.response?.data?.message || 'Failed to apply leave', 'error')
    }
  }

  async function downloadMarksheet() {
    try {
      const r = await api.get('/student/marksheet')
      const data = r.data.data
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'text/plain' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = 'marksheet.txt'; a.click()
      URL.revokeObjectURL(url)
      toast('Marksheet downloaded!', 'success')
    } catch { toast('Failed to download marksheet', 'error') }
  }

  // ── helpers ──
  const enrolledIds = new Set(courses.map(c => c.id))
  const availableCourses = allCourses.filter(c => !enrolledIds.has(c.id))

  const avgAttendance = (() => {
    const vals = Object.values(attendance).filter(a => a && a.percentage != null)
    if (!vals.length) return 'N/A'
    return (vals.reduce((s, a) => s + a.percentage, 0) / vals.length).toFixed(1) + '%'
  })()

  // group marks by courseId
  const marksByCourse = marks.reduce((acc, m) => {
    const key = m.course?.id
    if (!acc[key]) acc[key] = { courseName: m.course?.name, midterm: null, final: null, grade: null }
    if (m.examType === 'MIDTERM') { acc[key].midterm = m.marksObtained; acc[key].grade = m.grade }
    if (m.examType === 'FINAL')   { acc[key].final   = m.marksObtained; acc[key].grade = m.grade }
    return acc
  }, {})

  if (loading) return <><Header title="Student Dashboard" subtitle={`Welcome back, ${user?.fullName}`} /><Spinner /></>

  return (
    <>
      <Header title="Student Dashboard" subtitle={`Welcome back, ${user?.fullName}`} />

      <div className="content">
        {/* Profile Card */}
        <div className="profile-card">
          <h2>{profile?.user?.fullName || user?.fullName}</h2>
          <p className="sub">Student ID: {profile?.enrollmentNumber || 'Pending'}</p>
          <div className="profile-grid">
            <div className="profile-item"><label>Department</label><span>{profile?.department?.name || 'Not assigned'}</span></div>
            <div className="profile-item"><label>Semester</label><span>{profile?.currentSemester || 1}th Semester</span></div>
            <div className="profile-item"><label>CGPA</label><span>N/A</span></div>
            <div className="profile-item"><label>Email</label><span>{profile?.user?.email}</span></div>
          </div>
        </div>

        {/* Tab Panel */}
        <div className="tab-panel">
          <TabNav tabs={TABS} activeTab={tab} onTabChange={setTab} />

          <div className="tab-content">

            {/* ── OVERVIEW ── */}
            {tab === 'Overview' && (
              <div className="stats-row three">
                <StatCard label="Total Courses"      value={courses.length} icon="📚" />
                <StatCard label="Average Attendance" value={avgAttendance}  icon="📅" />
                <StatCard label="Current CGPA"       value="N/A"            icon="🎯" />
              </div>
            )}

            {/* ── COURSES ── */}
            {tab === 'Courses' && (
              <>
                <div className="section-header">
                  <h3>Registered Courses</h3>
                  <button className="btn btn-primary btn-sm" onClick={() => { setShowEnroll(s => !s); if (!showEnroll) fetchAllCourses() }}>
                    {showEnroll ? 'Close' : 'Register New Course'}
                  </button>
                </div>

                {showEnroll && (
                  <div className="inline-panel" style={{ marginBottom: 20 }}>
                    <h4>Available Courses</h4>
                    {availableCourses.length === 0
                      ? <p className="msg-empty">No courses available to enroll</p>
                      : <div className="enroll-list">
                          {availableCourses.map(c => (
                            <div key={c.id} className="enroll-item">
                              <div className="enroll-item-info">
                                <p>{c.name}</p>
                                <span>{c.code} · {c.credits} Credits · Sem {c.semester}</span>
                              </div>
                              <button className="btn btn-primary btn-sm" onClick={() => enroll(c.id)}>Enroll</button>
                            </div>
                          ))}
                        </div>
                    }
                  </div>
                )}

                {courses.length === 0
                  ? <p className="msg-empty">Not enrolled in any courses yet</p>
                  : courses.map(c => (
                      <div key={c.id} className="course-card">
                        <div className="course-card-info">
                          <h4>{c.name}</h4>
                          <p>Course Code: {c.code}</p>
                          <p>Instructor: {c.assignedFaculty?.user?.fullName || 'TBA'}</p>
                        </div>
                        <span className="badge-credit">{c.credits} Credits</span>
                      </div>
                    ))
                }
              </>
            )}

            {/* ── ATTENDANCE ── */}
            {tab === 'Attendance' && (
              <>
                <div className="section-header"><h3>Attendance Records</h3></div>
                {courses.length === 0
                  ? <p className="msg-empty">No enrolled courses</p>
                  : <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Course</th><th>Present</th><th>Total</th><th>Percentage</th><th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {courses.map(c => {
                            const att = attendance[c.id]
                            const pct = att?.percentage ?? null
                            const statusBadge = pct == null ? 'badge-info'
                              : pct >= 75 ? 'badge-good'
                              : pct >= 60 ? 'badge-average' : 'badge-low'
                            const statusText = pct == null ? 'N/A' : pct >= 75 ? 'Good' : pct >= 60 ? 'Average' : 'Low'
                            return (
                              <tr key={c.id}>
                                <td className="td-bold">{c.name}</td>
                                <td>{att?.present ?? '—'}</td>
                                <td>{att?.totalClasses ?? '—'}</td>
                                <td>{pct != null ? pct + '%' : '—'}</td>
                                <td><span className={`badge ${statusBadge}`}>{statusText}</span></td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                }
              </>
            )}

            {/* ── MARKS ── */}
            {tab === 'Marks' && (
              <>
                <div className="section-header">
                  <h3>Examination Results</h3>
                  <button className="btn btn-primary btn-sm" onClick={downloadMarksheet}>Download Marksheet</button>
                </div>

                {Object.keys(marksByCourse).length === 0
                  ? <p className="msg-empty">No marks uploaded yet</p>
                  : <div className="table-wrap">
                      <table>
                        <thead>
                          <tr><th>Course</th><th>Mid-Term</th><th>Final</th><th>Total</th><th>Grade</th></tr>
                        </thead>
                        <tbody>
                          {Object.values(marksByCourse).map((m, i) => {
                            const total = ((m.midterm ?? 0) + (m.final ?? 0)) / (m.midterm && m.final ? 2 : 1)
                            return (
                              <tr key={i}>
                                <td className="td-bold">{m.courseName}</td>
                                <td>{m.midterm ?? '—'}</td>
                                <td>{m.final ?? '—'}</td>
                                <td><strong>{m.midterm || m.final ? total.toFixed(1) : '—'}</strong></td>
                                <td>{m.grade ? <span className="badge-grade">{m.grade}</span> : '—'}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                }

                <hr className="divider" />

                {/* Leave Applications */}
                <div className="section-header">
                  <h3>My Leave Applications</h3>
                  <button className="btn btn-outline btn-sm" onClick={() => setShowLeaveForm(s => !s)}>
                    {showLeaveForm ? 'Cancel' : 'Apply for Leave'}
                  </button>
                </div>

                {showLeaveForm && (
                  <div className="inline-panel" style={{ marginBottom: 20 }}>
                    <form onSubmit={applyLeave}>
                      <div className="form-group">
                        <label>Reason</label>
                        <textarea value={leaveForm.reason} onChange={e => setLeaveForm(f => ({ ...f, reason: e.target.value }))} placeholder="Reason for leave" required />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>From Date</label>
                          <input type="date" value={leaveForm.fromDate} onChange={e => setLeaveForm(f => ({ ...f, fromDate: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                          <label>To Date</label>
                          <input type="date" value={leaveForm.toDate} onChange={e => setLeaveForm(f => ({ ...f, toDate: e.target.value }))} required />
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary btn-sm">Submit Application</button>
                    </form>
                  </div>
                )}

                {leaves.length === 0
                  ? <p className="msg-empty">No leave applications yet</p>
                  : <div className="table-wrap">
                      <table>
                        <thead>
                          <tr><th>Reason</th><th>From</th><th>To</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                          {leaves.map(l => (
                            <tr key={l.id}>
                              <td>{l.reason}</td>
                              <td>{l.fromDate}</td>
                              <td>{l.toDate}</td>
                              <td>
                                <span className={`badge badge-${l.status === 'APPROVED' ? 'active' : l.status === 'REJECTED' ? 'rejected' : 'pending'}`}>
                                  {l.status}
                                </span>
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
