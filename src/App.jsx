import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage       from './pages/LoginPage'
import RegisterPage    from './pages/RegisterPage'
import StudentDashboard  from './pages/StudentDashboard'
import FacultyDashboard  from './pages/FacultyDashboard'
import AdminDashboard    from './pages/AdminDashboard'
import AdmissionDashboard from './pages/AdmissionDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/"         element={<Navigate to="/login" replace />} />
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/student" element={
              <ProtectedRoute allowedRole="STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            } />

            <Route path="/faculty" element={
              <ProtectedRoute allowedRole="FACULTY">
                <FacultyDashboard />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute allowedRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/admission" element={
              <ProtectedRoute allowedRole="ADMISSION_OFFICER">
                <AdmissionDashboard />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
