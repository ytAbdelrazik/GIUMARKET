import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Chat from './pages/Chat'
import AdminDashboard from './pages/AdminDashboard'
import ProductDetail from './pages/ProductDetail'
import Profile from './pages/Profile'

// Components
import Navbar from './components/Navbar'
import MessageNotification from './components/MessageNotification'

// Services
import { authService } from './services/api'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize user state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (loading) return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
    if (!user) return <Navigate to="/login" />
    return children
  }

  // Admin route component
  const AdminRoute = ({ children }) => {
    if (loading) return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
    if (!user || !user.isAdmin) return <Navigate to="/" />
    return children
  }

  return (
    <Router>
      <div className="app">
        <Navbar user={user} setUser={setUser} />
        {user && user.id && <MessageNotification userId={user.id} />}
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/signup" element={<Signup setUser={setUser} />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/products/:id" element={<ProductDetail user={user} />} />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <Chat user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat/:receiverId" 
              element={
                <ProtectedRoute>
                  <Chat user={user} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                <Profile user={user} setUser={setUser} />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
