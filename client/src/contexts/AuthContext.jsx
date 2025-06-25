import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  // Auto-logout on tab close
  useEffect(() => {
    const handleBeforeUnload = async (event) => {
      if (user && token) {
        // Send logout request to server
        try {
          await axios.post('/api/auth/logout')
        } catch (error) {
          console.error('Logout on tab close failed:', error)
        }
        
        // Clear local storage
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [user, token])

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me')
      setUser(response.data.user)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (googleToken) => {
    try {
      const response = await axios.post('/api/auth/google', {
        token: googleToken
      })
      
      const { token: jwtToken, user: userData } = response.data
      
      localStorage.setItem('token', jwtToken)
      setToken(jwtToken)
      setUser(userData)
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`
      
      return { success: true }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, error: error.response?.data?.message || 'Login failed' }
    }
  }

  const logout = async () => {
    try {
      // Send logout request to server
      await axios.post('/api/auth/logout')
    } catch (error) {
      console.error('Server logout failed:', error)
    }
    
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
  }

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}