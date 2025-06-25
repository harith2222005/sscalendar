import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './contexts/AuthContext'
import { CalendarProvider } from './contexts/CalendarContext'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import NotificationPopup from './components/NotificationPopup'

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <CalendarProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route 
                  path="/dashboard/*" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
              
              {/* Global notification popup */}
              <ProtectedRoute>
                <NotificationPopup />
              </ProtectedRoute>
            </div>
          </Router>
        </CalendarProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}

export default App