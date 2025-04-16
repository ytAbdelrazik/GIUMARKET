import { useState, useEffect } from 'react'
import axios from 'axios'

const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [activeTab, setActiveTab] = useState('users')
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      try {
        // Fetch users and products data
        const usersResponse = await axios.get('http://localhost:8080/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        const productsResponse = await axios.get('http://localhost:8080/api/products/all', {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        setUsers(usersResponse.data)
        setProducts(productsResponse.data)
      } catch (err) {
        console.error('Error fetching admin data:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  const handleDeleteProduct = async (productId) => {
    const token = localStorage.getItem('token')
    
    try {
      await axios.delete(`http://localhost:8080/api/products/delete/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Update products list
      setProducts(products.filter(product => product._id !== productId))
    } catch (err) {
      console.error('Error deleting product:', err)
    }
  }
  
  if (loading) return (
    <div className="container mt-5 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading dashboard data...</span>
      </div>
      <p className="mt-2">Loading dashboard data...</p>
    </div>
  )
  
  return (
    <div className="container mt-4">
      <h1 className="mb-4">Admin Dashboard</h1>
      
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
        </li>
      </ul>
      
      <div className="tab-content">
        {activeTab === 'users' && (
          <div>
            <h2 className="mb-3">Users</h2>
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phoneNumber}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'products' && (
          <div>
            <h2 className="mb-3">Products</h2>
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Availability</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product._id}>
                      <td>{product.name}</td>
                      <td>${product.price}</td>
                      <td>{product.category}</td>
                      <td>
                        {product.availability ? (
                          <span className="badge bg-success">Available</span>
                        ) : (
                          <span className="badge bg-secondary">Not Available</span>
                        )}
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
