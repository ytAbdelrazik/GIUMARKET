import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'

const ProductDetail = ({ user }) => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reserving, setReserving] = useState(false)
  const [reservationSuccess, setReservationSuccess] = useState(false)
  const [reservationError, setReservationError] = useState(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/products/single/${id}`)
        setProduct(response.data)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching product:', err)
        setError('Failed to load product details')
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const handleReservation = async () => {
    if (!user) {
      return setReservationError('Please login to make a reservation')
    }

    setReserving(true)
    setReservationError(null)
    
    try {
      const token = localStorage.getItem('token')
      await axios.post(`http://localhost:8080/api/reservations/request/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setReservationSuccess(true)
    } catch (err) {
      console.error('Reservation error:', err)
      setReservationError(err.response?.data?.message || 'Failed to make reservation. Please try again.')
    } finally {
      setReserving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading product...</span>
        </div>
        <p className="mt-2">Loading product details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    )
  }

  return (
    <div className="container mt-5">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to={`/products/category/${product.category}`}>{product.category}</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div className="row mt-4">
        <div className="col-md-5">
          {product.images && product.images.length > 0 ? (
            <img 
              src={product.images[0]} 
              className="img-fluid rounded shadow" 
              alt={product.name} 
            />
          ) : (
            <div 
              className="bg-light d-flex align-items-center justify-content-center border rounded"
              style={{height: "350px"}}
            >
              <span className="text-muted">No Image Available</span>
            </div>
          )}

          {product.images && product.images.length > 1 && (
            <div className="row mt-3">
              {product.images.slice(1).map((img, index) => (
                <div className="col-3" key={index}>
                  <img 
                    src={img} 
                    className="img-thumbnail" 
                    alt={`${product.name} - view ${index + 2}`} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="col-md-7">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h1 className="card-title">{product.name}</h1>
                <span className="badge bg-primary fs-6">{product.category}</span>
              </div>
              
              <h3 className="text-primary mb-3">${product.price.toFixed(2)}</h3>
              
              <div className="mb-3">
                <span className="badge bg-secondary me-2">{product.condition}</span>
                {product.availability ? (
                  <span className="badge bg-success">Available</span>
                ) : (
                  <span className="badge bg-danger">Not Available</span>
                )}
              </div>
              
              <hr />
              
              <h5>Description</h5>
              <p className="card-text">{product.description}</p>
              
              <hr />
              
              <div className="d-grid gap-2">
                {product.availability ? (
                  <>
                    {reservationSuccess ? (
                      <div className="alert alert-success">
                        Reservation request sent successfully! Check your messages for updates.
                      </div>
                    ) : (
                      <button 
                        className="btn btn-primary btn-lg" 
                        onClick={handleReservation}
                        disabled={reserving || !user}
                      >
                        {reserving ? 'Sending Request...' : 'Request Reservation'}
                      </button>
                    )}
                    
                    {reservationError && (
                      <div className="alert alert-danger">
                        {reservationError}
                      </div>
                    )}
                    
                    {!user && (
                      <div className="alert alert-warning">
                        Please <Link to="/login">login</Link> to request this item.
                      </div>
                    )}
                  </>
                ) : (
                  <button className="btn btn-secondary btn-lg" disabled>
                    Not Available
                  </button>
                )}
                
                {user && (
                  <Link to="/chat" className="btn btn-outline-secondary">
                    <i className="bi bi-chat-dots me-1"></i> Contact Seller
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
