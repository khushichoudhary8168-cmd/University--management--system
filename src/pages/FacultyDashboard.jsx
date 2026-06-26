import { useState, useEffect } from 'react'
import Header from '../components/Header'
import { TabNav, StatCard, Spinner } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../api/axios'

const TABS = ['Overview', 'Courses', 'Attendance', 'Marks', 'Content']
const today = new Date().toISOString().split('T')[0]

export default function FacultyDashboard() {
  const { user } = useAuth()
  const toast    = useToast()
  const [tab, setTab]           = useState('Overview')
  const [profile, setProfile]   = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [courses, setCourses]   = useState([])
  const [pendingLeaves, setPendingLeaves] = useState([])
  const [loading, setLoading]   = useState(true)

  // Attendance tab state
  const [attCourse, setAttCourse] = useState('')
  const [attDate, setAttDate]     = useState(today)
  const [attStudents, setAttStudents] = useState([])
  const [attMap, setAttMap]       = useState({}) // studentId -> 'PRESENT'|'ABSENT'

  // Marks tab state
  const [markCourse, setMarkCourse]   = useState('')
  const [markExamType, setMarkExamType] = useState('MIDTERM')
  const [markStudents, setMarkStudents] = useState([])
  const [marksInput, setMarksInput]     = useState({}) // studentId -> value

  // Content tab state
  const [contentCourse, setContentCourse] = useState('')
  const [contentText, setContentText]     = useState('')

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [pRes, dRes, cRes, lRes] = await Promise.all([
        api.get('/faculty/profile'),
        api.get('/faculty/dashboard'),
        api.get('/faculty/courses'),
        api.get('/faculty/leaves/pending')
      ])
      setProfile(pRes.data.data)
      setDashboard(dRes.data.data)
      setCourses(cRes.data.data || [])
      setPendingLeaves(lRes.data.data || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  // ── Attendance ──
  async function loadAttendanceStudents(courseId) {
    if (!courseId) return
    try {
      const r = await api.get(`/faculty/courses/${courseId}/students`)
      setAttStudents(r.data.data || [])
      setAttMap({})
    } catch { setAttStudents([]) }
  }

  function markAtt(studentId, status) {
    setAttMap(m => ({ ...m, [studentId]: status }))
  }

  async function submitAttendance() {
    if (!attCourse) { toast('Select a course first', 'error'); return }
    const payload = attStudents.map(s => ({
      studentId: s.id, courseId: Number(attCourse),
      attendanceDate: attDate, status: attMap[s.id] || 'ABSENT'
    }))
    try {
      await api.post('/faculty/attendance', payload)
      toast('Attendance marked successfully!', 'success')
      setAttMap({})
    } catch (e) { toast(e.response?.data?.message || 'Failed to mark attendance', 'error') }
  }

  // ── Marks ──
  async function loadMarkStudents(courseId) {
    if (!courseId) return
    try {
      const r = await api.get(`/faculty/courses/${courseId}/students`)
      setMarkStudents(r.data.data || [])
      setMarksInput({})
    } catch { setMarkStudents([]) }
  }

  async function saveMarks() {
    if (!markCourse) { toast('Select a course first', 'error'); return }
    const entries = Object.entries(marksInput).filter(([, v]) => v !== '')
    if (!entries.length) { toast('Enter at least one mark', 'error'); return }
    try {
      await Promise.all(entries.map(([studentId, val]) =>
        api.post('/faculty/marks', {
          studentId: Number(studentId), courseId: Number(markCourse),
          examType: markExamType, marksObtained: Number(val),
          totalMarks: 100, academicYear: '2024-25', semester: 1
        })
      ))
      toast('Marks uploaded successfully!', 'success')
      setMarksInput({})
    } catch (e) { toast(e.response?.data?.message || 'Failed to save marks', 'error') }
  }

  // ── Leaves ──
  async function reviewLeave(leaveId, decision) {
    try {
      await api.put(`/faculty/leaves/${leaveId}/review?decision=${decision}&remarks=`)
      toast(`Leave ${decision.toLowerCase()} successfully!`, 'success')
      const r = await api.get('/faculty/leaves/pending')
      setPendingLeaves(r.data.data || [])
    } catch (e) { toast('Failed to review leave', 'error') }
  }

  if (loading) return <><Header title="Faculty Dashboard" subtitle={`Welcome back, ${user?.fullName}`} /><Spinner /></>

  return (
    <>
      <Header title="Faculty Dashboard" subtitle={`Welcome back, ${user?.fullName}`} />

      <div className="content">
        {/* Profile Card */}
        <div className="profile-card">
          <h2>{profile?.user?.fullName || user?.fullName}</h2>
          <p className="sub">Faculty ID: {profile?.employeeId}</p>
          <div className="profile-grid three">
            <div className="profile-item"><label>Department</label><span>{profile?.department?.name || '—'}</span></div>
            <div className="profile-item"><label>Role</label><span>{profile?.designation || 'Faculty'}</span></div>
            <div className="profile-item"><label>Email</label><span>{profile?.user?.email}</span></div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row three">
          <StatCard label="Assigned Courses"    value={dashboard?.totalCourses ?? courses.length} icon="📚" />
          <StatCard label="Total Students"      value={dashboard?.totalStudents ?? '—'}           icon="👥" />
          <StatCard label="Pending Evaluations" value={pendingLeaves.length}                      icon="📋" />
        </div>

        {/* Tab Panel */}
        <div className="tab-panel">
          <TabNav tabs={TABS} activeTab={tab} onTabChange={setTab} />
          <div className="tab-content">

            {/* ── OVERVIEW ── */}
            {tab === 'Overview' && (
              <>
                <h3 style={{ marginBottom: 16 }}>Today's Schedule</h3>
                {courses.length === 0
                  ? <p className="msg-empty">No courses assigned yet</p>
                  : courses.map((c, i) => (
                      <div key={c.id} className="schedule-card">
                        <div className="schedule-card-info">
                          <h4>{c.code} - {c.name}</h4>
                          <p>Section A • Room {200 + i * 100 + 1}</p>
                          <p style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                            {i === 0 ? '9:00 AM - 10:30 AM' : i === 1 ? '11:00 AM - 12:30 PM' : '2:00 PM - 3:30 PM'}
                          </p>
                        </div>
                        <span className={i === 0 ? 'badge-upcoming' : 'badge-sched'}>
                          {i === 0 ? 'Upcoming' : 'Scheduled'}
                        </span>
                      </div>
                    ))
                }
              </>
            )}

            {/* ── COURSES ── */}
            {tab === 'Courses' && (
              <>
                <div className="section-header"><h3>My Courses</h3></div>
                {courses.length === 0
                  ? <p className="msg-empty">No courses assigned</p>
                  : courses.map(c => (
                      <div key={c.id} className="course-card">
                        <div className="course-card-info">
                          <h4>{c.name}</h4>
                          <p>Course Code: {c.code} · Section A</p>
                          <p>Department: {c.department?.name || '—'}</p>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={() => { setTab('Attendance'); setAttCourse(String(c.id)); loadAttendanceStudents(c.id) }}>
                          Manage
                        </button>
                      </div>
                    ))
                }
              </>
            )}

            {/* ── ATTENDANCE ── */}
            {tab === 'Attendance' && (
              <>
                <div className="section-header"><h3>Mark Attendance</h3></div>

                <div className="filters-row">
                  <div className="filter-group">
                    <label>Select Course</label>
                    <select value={attCourse} onChange={e => { setAttCourse(e.target.value); loadAttendanceStudents(e.target.value) }}>
                      <option value="">-- Select Course --</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Date</label>
                    <input type="date" value={attDate} onChange={e => setAttDate(e.target.value)} />
                  </div>
                </div>

                {attCourse && attStudents.length === 0 && <p className="msg-empty">No students enrolled in this course</p>}

                {attStudents.length > 0 && (
                  <>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr><th>Student ID</th><th>Name</th><th>Current Attendance</th><th>Mark</th></tr>
                        </thead>
                        <tbody>
                          {attStudents.map(s => (
                            <tr key={s.id}>
                              <td>{s.enrollmentNumber || `STU${s.id}`}</td>
                              <td className="td-bold">{s.user?.fullName}</td>
                              <td>—</td>
                              <td>
                                <div className="mark-btns">
                                  <button
                                    className={`mark-btn ${attMap[s.id] === 'PRESENT' ? 'present-active' : 'present-inactive'}`}
                                    onClick={() => markAtt(s.id, 'PRESENT')}
                                  >Present</button>
                                  <button
                                    className={`mark-btn ${attMap[s.id] === 'ABSENT' ? 'absent-active' : 'absent-inactive'}`}
                                    onClick={() => markAtt(s.id, 'ABSENT')}
                                  >Absent</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <button className="btn btn-primary" onClick={submitAttendance}>Submit Attendance</button>
                    </div>
                  </>
                )}
              </>
            )}

            {/* ── MARKS ── */}
            {tab === 'Marks' && (
              <>
                <div className="section-header"><h3>Upload Marks</h3></div>

                <div className="filters-row">
                  <div className="filter-group">
                    <label>Select Course</label>
                    <select value={markCourse} onChange={e => { setMarkCourse(e.target.value); loadMarkStudents(e.target.value) }}>
                      <option value="">-- Select Course --</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Exam Type</label>
                    <select value={markExamType} onChange={e => setMarkExamType(e.target.value)}>
                      <option value="MIDTERM">Mid-Term</option>
                      <option value="FINAL">Final</option>
                      <option value="ASSIGNMENT">Assignment</option>
                      <option value="QUIZ">Quiz</option>
                    </select>
                  </div>
                </div>

                {markCourse && markStudents.length === 0 && <p className="msg-empty">No students in this course</p>}

                {markStudents.length > 0 && (
                  <>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr><th>Student ID</th><th>Name</th><th>Exam Type</th><th>Enter Marks (0-100)</th></tr>
                        </thead>
                        <tbody>
                          {markStudents.map(s => (
                            <tr key={s.id}>
                              <td>{s.enrollmentNumber || `STU${s.id}`}</td>
                              <td className="td-bold">{s.user?.fullName}</td>
                              <td>{markExamType}</td>
                              <td>
                                <input
                                  type="number" min="0" max="100" placeholder="0-100"
                                  style={{ width: 100, padding: '6px 10px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14 }}
                                  value={marksInput[s.id] || ''}
                                  onChange={e => setMarksInput(m => ({ ...m, [s.id]: e.target.value }))}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <button className="btn btn-primary" onClick={saveMarks}>Save Marks</button>
                    </div>
                  </>
                )}

                <hr className="divider" />

                {/* Pending Leaves */}
                <div className="section-header"><h3>Pending Leave Applications</h3></div>
                {pendingLeaves.length === 0
                  ? <p className="msg-empty">No pending leave applications</p>
                  : <div className="table-wrap">
                      <table>
                        <thead>
                          <tr><th>Student</th><th>Reason</th><th>From</th><th>To</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                          {pendingLeaves.map(l => (
                            <tr key={l.id}>
                              <td className="td-bold">{l.student?.user?.fullName}</td>
                              <td>{l.reason}</td>
                              <td>{l.fromDate}</td>
                              <td>{l.toDate}</td>
                              <td><span className="badge badge-pending">PENDING</span></td>
                              <td>
                                <div className="flex-gap">
                                  <button className="btn-green" onClick={() => reviewLeave(l.id, 'APPROVED')}>Approve</button>
                                  <button className="btn-red"   onClick={() => reviewLeave(l.id, 'REJECTED')}>Reject</button>
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

            {/* ── CONTENT ── */}
            {tab === 'Content' && (
              <>
                <div className="section-header"><h3>Course Content</h3></div>
                <div className="form-group">
                  <label>Select Course</label>
                  <select value={contentCourse} onChange={e => setContentCourse(e.target.value)} style={{ maxWidth: 300 }}>
                    <option value="">-- Select Course --</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Course Material Description</label>
                  <textarea value={contentText} onChange={e => setContentText(e.target.value)}
                    placeholder="Enter course material, lecture notes, or topic descriptions..."
                    style={{ minHeight: 120 }} />
                </div>
                <button className="btn btn-primary" onClick={() => { toast('Content saved!', 'success'); setContentText('') }}>
                  Save Content
                </button>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
