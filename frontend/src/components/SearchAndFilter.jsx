import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchAndFilter = ({ onSearch }) => {
  const [searchParams, setSearchParams] = useState({
    query: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Update URL with search parameters
    const queryString = new URLSearchParams(searchParams).toString();
    navigate(`/search?${queryString}`);
    onSearch(searchParams);
  };

  const handleReset = () => {
    setSearchParams({
      query: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      sortBy: ''
    });
    navigate('/');
    onSearch({});
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Search products..."
                name="query"
                value={searchParams.query}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                name="category"
                value={searchParams.category}
                onChange={handleChange}
              >
                <option value="">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Books">Books</option>
                <option value="Clothing">Clothing</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Min Price"
                name="minPrice"
                value={searchParams.minPrice}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Max Price"
                name="maxPrice"
                value={searchParams.maxPrice}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                name="sortBy"
                value={searchParams.sortBy}
                onChange={handleChange}
              >
                <option value="">Sort By</option>
                <option value="price:asc">Price: Low to High</option>
                <option value="price:desc">Price: High to Low</option>
                <option value="createdAt:desc">Newest First</option>
                <option value="createdAt:asc">Oldest First</option>
              </select>
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-12">
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  Search
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleReset}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchAndFilter; 