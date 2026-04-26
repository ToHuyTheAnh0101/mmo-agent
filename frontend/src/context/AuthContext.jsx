import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing tokens on mount
    const token = localStorage.getItem('access_token')
    const email = localStorage.getItem('user_email')
    const userId = localStorage.getItem('user_id')
    if (token && email && userId) {
      setUser({ id: parseInt(userId), email, token })
    }
    setLoading(false)
  }, [])

  const login = (data) => {
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    localStorage.setItem('user_email', data.email)
    localStorage.setItem('user_id', data.id.toString())
    setUser({ id: data.id, email: data.email, token: data.access_token })
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_id')
    setUser(null)
  }

  const getToken = () => localStorage.getItem('access_token')

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
