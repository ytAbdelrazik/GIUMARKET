import React, { useState } from 'react';
import { productApi } from '../services/api';

const AddProductForm = ({ categories, onSuccess }) => {
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: '',
    condition: 'New',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // IMAGE STATE
  const [images, setImages] = useState([]); 

  // HANDLE FILE INPUT (FOR IMAGES)
const handleFileChange = (e) => {
  const selectedFiles = Array.from(e.target.files);
  setImages(prev => {
    const total = prev.length + selectedFiles.length;
    if (total > 5) {
      // Only allow up to 5 images
      return [...prev, ...selectedFiles].slice(0, 5);
    }
    return [...prev, ...selectedFiles];
  });
};

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Use FormData for file upload
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      // Append images
      images.forEach((img) => {
        formData.append('productImage', img);
      });

      await productApi.createProduct(formData); // Make sure this uses multipart/form-data
      setLoading(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Failed to add product');
      setLoading(false);
    }
  };

const handleRemoveImage = (idx) => {
  setImages(images => images.filter((_, i) => i !== idx));
};


return (
  <div
    className="card"
    style={{
      maxWidth: 540,
      margin: "40px auto",
      boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
      borderRadius: 18,
      border: "none",
      background: "#fff",
    }}
  >
    <div className="card-body" style={{ padding: 32 }}>
      <h3 className="card-title mb-4 text-primary fw-bold" style={{ fontWeight: 700, fontSize: 28 }}>
        Add New Product
      </h3>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-3">
          <input
            type="text"
            name="name"
            className="form-control form-control-lg"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            required
            style={{ fontSize: 18, padding: "12px 16px", borderRadius: 10 }}
          />
        </div>
        <div className="mb-3">
          <input
            type="number"
            name="price"
            className="form-control form-control-lg"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            required
            style={{ fontSize: 18, padding: "12px 16px", borderRadius: 10 }}
          />
        </div>
        <div className="mb-3">
          <select
            name="category"
            className="form-select form-select-lg"
            value={form.category}
            onChange={handleChange}
            required
            style={{ fontSize: 18, padding: "12px 16px", borderRadius: 10 }}
          >
            <option value="">Select a category</option>
            <option value="Study Materials">Study Materials</option>
            <option value="Project Supplies">Project Supplies</option>
            <option value="Accessories">Accessories</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label" style={{ fontWeight: 500 }}>Condition</label>
          <select
            className="form-select"
            name="condition"
            value={form.condition}
            onChange={handleChange}
            required
            style={{ fontSize: 18, padding: "12px 16px", borderRadius: 10 }}
          >
            <option value="">Select condition</option>
            <option value="New">New</option>
            <option value="Used">Used</option>
          </select>
        </div>
        <div className="mb-3">
          <textarea
            name="description"
            className="form-control"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
            style={{ fontSize: 16, padding: "12px 16px", borderRadius: 10, minHeight: 80 }}
          />
        </div>
        {/* Image Upload with Preview */}
        <div className="mb-3">
          <label className="form-label" style={{ fontWeight: 500 }}>Product Images</label>
          <input
            type="file"
            name="productImage"
            className="form-control"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            disabled={images.length >= 5}
            style={{ fontSize: 16, padding: "8px 12px", borderRadius: 10 }}
          />
          <small className="text-muted">
            {images.length >= 5
              ? "Maximum 5 images allowed."
              : "You can select up to 5 images."}
          </small>
          <div className="mt-3 d-flex flex-wrap gap-3">
            {images.length > 0 &&
              images.map((img, idx) => (
                <div
                  key={idx}
                  className="position-relative"
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 12,
                    border: "1.5px solid #e0e0e0",
                    overflow: "hidden",
                    marginRight: 12,
                    marginBottom: 12,
                    background: "#fafbfc",
                  }}
                >
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`preview-${idx}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 12,
                    }}
                  />
                  <button
                    type="button"
                    aria-label="Remove"
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      background: "#fff",
                      color: "#dc3545",
                      border: "none",
                      borderRadius: "50%",
                      width: 24,
                      height: 24,
                      fontWeight: "bold",
                      fontSize: 18,
                      cursor: "pointer",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      lineHeight: 1,
                    }}
                    onClick={() => handleRemoveImage(idx)}
                  >
                    ×
                  </button>
                </div>
              ))}
          </div>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button
          type="submit"
          className="btn btn-success btn-lg w-100"
          disabled={loading}
          style={{
            fontWeight: 600,
            fontSize: 20,
            padding: "12px 0",
            borderRadius: 10,
            marginTop: 10,
          }}
        >
          {loading ? 'Adding...' : 'Add Product'}
        </button>
      </form>
    </div>
  </div>
);
};

export default AddProductForm;