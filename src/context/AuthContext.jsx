import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token    = localStorage.getItem('token')
    const username = localStorage.getItem('username')
    const role     = localStorage.getItem('role')
    const fullName = localStorage.getItem('fullName')
    if (token) setUser({ token, username, role, fullName })
  }, [])

  function login(token, username, role, fullName) {
    localStorage.setItem('token',    token)
    localStorage.setItem('username', username)
    localStorage.setItem('role',     role)
    localStorage.setItem('fullName', fullName)
    setUser({ token, username, role, fullName })
  }

  function logout() {
    localStorage.clear()
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
