import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const Home = () => {
  const [products, setProducts] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('');

  const isLoggedIn = localStorage.getItem('user') ? true : false

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/products/available')
        
        // Set all products
        setProducts(response.data)
        
        // Get unique categories
        const uniqueCategories = ['All', ...new Set(response.data.map(product => product.category))]
        setCategories(uniqueCategories)
        
        // Select a few products as featured (newest or random)
        const featured = response.data
          .sort(() => 0.5 - Math.random()) // Simple random selection
          .slice(0, 3)
        setFeaturedProducts(featured)
        
        setLoading(false)
      } catch (err) {
        setError('Failed to load products')
        setLoading(false)
        console.error('Error fetching products:', err)
      }
    }

    fetchProducts()
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/products/search`, {
        params: {
          q: searchTerm,
          category: activeCategory !== 'All' ? activeCategory : undefined,
          minPrice,
          maxPrice,
          sortBy
        }
      });
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error searching products:', err);
      setLoading(false);
    }
  };

  const handleCategoryFilter = async (category) => {
    setLoading(true)
    setActiveCategory(category)
    
    try {
      let response
      if (category === 'All') {
        response = await axios.get('http://localhost:8080/api/products/available')
      } else {
        response = await axios.get(`http://localhost:8080/api/products/category/${category}`)
      }
      setProducts(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Error filtering products:', err)
      setLoading(false)
    }
  }

  if (loading && products.length === 0) return (
    <div className="container mt-5 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading products...</span>
      </div>
      <p className="mt-2">Loading products...</p>
    </div>
  )
  
  if (error && products.length === 0) return (
    <div className="container mt-5">
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    </div>
  )

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section text-center">
        <div className="container">
          <h1 className="display-4 fw-bold mb-4">GIU Marketplace</h1>
          <p className="lead mb-4">Buy and sell items within the GIU community. Find textbooks, electronics, and more!</p>
          
          <form onSubmit={handleSearch} className="d-flex justify-content-center mb-4">
            <div className="input-group" style={{ maxWidth: '600px' }}>
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="What are you looking for?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <input
                type="number"
                className="form-control"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <input
                type="number"
                className="form-control"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="">Sort By</option>
                <option value="price:asc">Price: Low to High</option>
                <option value="price:desc">Price: High to Low</option>
                <option value="date:desc">Newest First</option>
              </select>
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-search me-1"></i> Search
              </button>
            </div>
          </form>
          
          <div className="mt-4">
            {localStorage.getItem('token') ? (
              <p className="text-light">Welcome back!</p>
            ) : (
              <>
                <Link to="/signup" className="btn btn-outline-light btn-lg me-2">Sign Up</Link>
                <Link to="/login" className="btn btn-light btn-lg">Login</Link>
              </>
            )}
          </div>
        </div>
      </section>
      
      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="container my-5">
          <h2 className="text-center mb-4">Featured Items</h2>
          <div className="row">
            {featuredProducts.map(product => (
              <div className="col-md-4 mb-4" key={product._id}>
                <div className="card h-100 shadow-sm">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      className="card-img-top card-image-top" 
                      alt={product.name} 
                    />
                  ) : (
                    <div 
                      className="card-img-top card-image-top bg-secondary d-flex align-items-center justify-content-center text-white"
                    >
                      <span>No Image Available</span>
                    </div>
                  )}
                  
                  <span className="badge bg-primary category-badge">{product.category}</span>
                  
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text mb-4">{product.description.substring(0, 100)}...</p>
                    <div className="d-flex justify-content-between mt-auto">
                      <span className="h5 text-primary">${product.price.toFixed(2)}</span>
                      <span className="badge bg-secondary align-self-center">{product.condition}</span>
                    </div>
                  </div>
                  
                  <div className="card-footer bg-white border-top-0">
                    <Link to={`/products/${product._id}`} className="btn btn-outline-primary w-100">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-3">
            <Link to="/" className="btn btn-outline-secondary">View All Products</Link>
          </div>
        </section>
      )}
      
      {/* Category Filter & Products */}
      <section className="container my-5 pb-5">
        <h2 className="mb-4">Browse Products</h2>
        
        <div className="mb-4">
          <div className="d-flex flex-wrap">
            {categories.map(category => (
              <button 
                key={category}
                className={`btn ${activeCategory === category ? 'btn-primary' : 'btn-outline-primary'} me-2 mb-2`}
                onClick={() => handleCategoryFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading products...</span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center my-5">
            <p className="lead text-muted">No products found</p>
            <button 
              className="btn btn-outline-primary mt-2"
              onClick={() => handleCategoryFilter('All')}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
            {products.map(product => (
              <div className="col" key={product._id}>
                <div className="card h-100 shadow-sm">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      className="card-img-top card-image-top" 
                      alt={product.name} 
                    />
                  ) : (
                    <div 
                      className="card-img-top card-image-top bg-light d-flex align-items-center justify-content-center text-muted"
                    >
                      <span>No Image Available</span>
                    </div>
                  )}
                  
                  <span className="badge bg-primary category-badge">{product.category}</span>
                  
                  <div className="card-body">
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text text-muted small">{product.description.substring(0, 80)}...</p>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <span className="h5 mb-0">${product.price.toFixed(2)}</span>
                      <span className="badge bg-secondary">{product.condition}</span>
                    </div>
                  </div>
                  
                  <div className="card-footer bg-white border-top-0 pt-0">
                    <div className="d-grid gap-2">
                      <Link to={`/products/${product._id}`} className="btn btn-outline-primary">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* How It Works Section */}
      <section className="bg-light py-5">
        <div className="container">
          <h2 className="text-center mb-5">How It Works</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="text-center">
                <div className="bg-primary rounded-circle d-inline-flex justify-content-center align-items-center mb-3" style={{width: "80px", height: "80px"}}>
                  <i className="bi bi-search text-white fs-1"></i>
                </div>
                <h4>Browse</h4>
                <p>Search for items by category or keyword</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center">
                <div className="bg-primary rounded-circle d-inline-flex justify-content-center align-items-center mb-3" style={{width: "80px", height: "80px"}}>
                  <i className="bi bi-chat text-white fs-1"></i>
                </div>
                <h4>Connect</h4>
                <p>Message sellers directly through the platform</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center">
                <div className="bg-primary rounded-circle d-inline-flex justify-content-center align-items-center mb-3" style={{width: "80px", height: "80px"}}>
                  <i className="bi bi-bag-check text-white fs-1"></i>
                </div>
                <h4>Trade</h4>
                <p>Meet on campus for safe exchanges</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
