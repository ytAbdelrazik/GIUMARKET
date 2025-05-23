import React from 'react';
import { Link } from 'react-router-dom';

const MyProducts = ({ products, loading }) => (
  <section className="container my-4">
    <h3>My Products</h3>
    {loading ? (
      <div>Loading...</div>
    ) : products.length === 0 ? (
       <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="card text-center shadow-sm p-4" style={{ maxWidth: 400 }}>
        <div className="mb-3">
            <i className="bi bi-box-seam" style={{ fontSize: '2.5rem', color: '#0d6efd' }}></i>
      </div>
      <h5 className="mb-2 text-muted">You haven’t listed any products yet.</h5>
      <p className="mb-0">
        Head to the <strong>Add Product</strong> section to share your items with other GIU students!
      </p>
    </div>
  </div>
    ) : (
      <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
        {products.map(product => (
          <div className="col" key={product._id}>
            <div className="card h-100 shadow-sm">
              {product.images && product.images.length > 0 ? (
                <img 
                      src={`http://localhost:8080/${product.images[0]}`} 
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
);

export default MyProducts;