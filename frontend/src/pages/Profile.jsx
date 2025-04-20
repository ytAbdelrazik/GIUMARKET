import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Profile = ({ user, setUser }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    email: '',
    password: ''
  })
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    setFormData({
      name: user.name || '',
      phone: user.phone || user.phoneNumber || ''
    })
    setLoading(false)
  }, [user, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const backendUrl = 'http://localhost:8080';
      
      console.log('User ID:', user.id);
      console.log('User object:', user);

      console.log('Sending update request with data:', {
        name: formData.name,
        phoneNumber: formData.phone
      });

      // Make a PUT request to update user profile
      const res = await fetch(`${backendUrl}/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          phoneNumber: formData.phone
        })
      });

      console.log('Response status:', res.status);
      console.log('Response headers:', Object.fromEntries(res.headers.entries()));

      let data;
      try {
        const text = await res.text();
        console.log('Response text:', text);
        data = text ? JSON.parse(text) : null;
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (!res.ok) {
        throw new Error(data?.message || `Failed to update profile. Status: ${res.status}`);
      }

      if (!data || !data.user) {
        throw new Error('Invalid response format from server');
      }

      // Update localStorage with the updated user data
      localStorage.setItem('user', JSON.stringify(data.user));

      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.message || 'Failed to update profile. Please try again.');
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setDeleteError('')
  
      if (deleteConfirmation.email !== user.email) {
        setDeleteError('Email does not match your account email')
        return
      }
  
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }
  
      const backendUrl = 'http://localhost:8080'
  
      // Step 1: Verify email + password before deletion
      const verifyRes = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: deleteConfirmation.email,
          password: deleteConfirmation.password
        })
      })
  
      if (!verifyRes.ok) {
        throw new Error('Invalid email or password')
      }
  
      // Step 2: Send delete request using stored token
      const deleteRes = await fetch(`${backendUrl}/api/users/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
  
      if (deleteRes.status === 401) {
        alert('Session expired. Please log in again.')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        navigate('/login')
        return
      }
  
      if (!deleteRes.ok) {
        const errorData = await deleteRes.json()
        throw new Error(errorData.message || 'Failed to delete account')
      }
  
      // Step 3: Account deleted successfully — clean up and redirect
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      navigate('/')
      alert('Account deleted successfully')
    } catch (error) {
      console.error('Error deleting account:', error)
      setDeleteError(error.message)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h2 className="mb-0">My Profile</h2>
            </div>
            <div className="card-body">
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      pattern="[0-9]{10}"
                      title="Please enter a valid 10-digit phone number"
                    />
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="mb-4">
                    <h4>Name</h4>
                    <p>{formData.name}</p>
                  </div>
                  <div className="mb-4">
                    <h4>Email</h4>
                    <p>{user.email}</p>
                  </div>
                  <div className="mb-4">
                    <h4>Phone</h4>
                    <p>{formData.phone || 'Not provided'}</p>
                  </div>
                  <div className="d-flex justify-content-end">
                    <button
                      className="btn btn-primary"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Delete Account Section */}
          <div className="card shadow mt-4 border-danger">
            <div className="card-header bg-danger text-white">
              <h4 className="mb-0">Delete Account</h4>
            </div>
            <div className="card-body">
              <p className="text-danger">
                Warning: This action cannot be undone. All your data will be permanently deleted.
              </p>
              <button 
                className="btn btn-danger"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Confirm Account Deletion</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteError('')
                    setDeleteConfirmation({ email: '', password: '' })
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-danger mb-3">
                  To confirm account deletion, please enter your email and password.
                </p>
                
                {deleteError && (
                  <div className="alert alert-danger">
                    {deleteError}
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="confirmEmail" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="confirmEmail"
                    value={deleteConfirmation.email}
                    onChange={(e) => setDeleteConfirmation(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    value={deleteConfirmation.password}
                    onChange={(e) => setDeleteConfirmation(prev => ({
                      ...prev,
                      password: e.target.value
                    }))}
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteError('')
                    setDeleteConfirmation({ email: '', password: '' })
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
