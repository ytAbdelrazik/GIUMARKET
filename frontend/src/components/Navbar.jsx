import { Link, useNavigate } from 'react-router-dom'

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate()
  
  const handleLogout = () => {
    // Clear storage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // Update state
    setUser(null)
    
    // Redirect to home
    navigate('/')
  }
  
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">GIU Market</Link>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link to="/" className="nav-link">Home</Link>
            </li>
            
            {user ? (
              <>
                <li className="nav-item">
                  <Link to="/profile" className="nav-link">My Profile</Link>
                </li>
                <li className="nav-item">
                  <Link to="/chat" className="nav-link">Messages</Link>
                </li>
                {user.isAdmin && (
                  <li className="nav-item">
                    <Link to="/admin" className="nav-link">Admin</Link>
                  </li>
                )}
                <li className="nav-item">
                  <button 
                    className="btn btn-outline-light ms-2" 
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/login" className="nav-link">Login</Link>
                </li>
                <li className="nav-item">
                  <Link to="/signup" className="nav-link">Sign Up</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
