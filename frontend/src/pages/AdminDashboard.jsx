import React, { useState, useEffect, useCallback } from "react";
import {
  getUsers,
  banUser,
  getReports,
  productService,
} from "../services/api";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users"); // 'users', 'products', 'reports'
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState({
    users: false,
    products: false,
    reports: false,
  });
  const [error, setError] = useState({
    users: null,
    products: null,
    reports: null,
  });

  const fetchUsers = useCallback(async () => {
    setLoading((prev) => ({ ...prev, users: true }));
    setError((prev) => ({ ...prev, users: null }));
    try {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError((prev) => ({ ...prev, users: "Failed to fetch users." }));
    } finally {
      setLoading((prev) => ({ ...prev, users: false }));
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading((prev) => ({ ...prev, products: true }));
    setError((prev) => ({ ...prev, products: null }));
    try {
      const fetchedProducts = await productService.getAllProducts();
      setProducts(fetchedProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError((prev) => ({ ...prev, products: "Failed to fetch products." }));
    } finally {
      setLoading((prev) => ({ ...prev, products: false }));
    }
  }, []);

  const fetchReports = useCallback(async () => {
    setLoading((prev) => ({ ...prev, reports: true }));
    setError((prev) => ({ ...prev, reports: null }));
    try {
      const fetchedReports = await getReports();
      setReports(
        fetchedReports.map((report) => ({
          ...report,
          reporterName: report.reporterId?.name || "N/A",
          reportedUserName: report.reportedUserId?.name || "N/A",
          reportedUserEmail: report.reportedUserId?.email || "N/A",
          reportedUserIdValue: report.reportedUserId?._id,
        }))
      );
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError((prev) => ({ ...prev, reports: "Failed to fetch reports." }));
    } finally {
      setLoading((prev) => ({ ...prev, reports: false }));
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchProducts();
    fetchReports();
  }, [fetchUsers, fetchProducts, fetchReports]);

  const handleBanUser = async (userId) => {
    if (window.confirm("Are you sure you want to ban this user?")) {
      try {
        await banUser(userId);
        setUsers(
          users.map((user) =>
            user._id === userId ? { ...user, isBanned: true } : user
          )
        );
        setReports(
          reports.map((report) =>
            report.reportedUserIdValue === userId
              ? { ...report, reportedUserBanned: true }
              : report
          )
        );
        alert("User banned successfully.");
      } catch (err) {
        console.error("Error banning user:", err);
        alert(`Failed to ban user: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productService.deleteProduct(productId);
        setProducts(products.filter((product) => product._id !== productId));
        alert("Product deleted successfully.");
      } catch (err) {
        console.error("Error deleting product:", err);
        alert(
          `Failed to delete product: ${err.response?.data?.message || err.message}`
        );
      }
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderUsersTab = () => (
    <div>
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="form-control"
        />
      </div>
      {loading.users && <p>Loading users...</p>}
      {error.users && <p className="text-danger">{error.users}</p>}
      {!loading.users && !error.users && (
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.type}</td>
                <td>
                  {user.isBanned ? (
                    <span className="badge bg-danger">Banned</span>
                  ) : (
                    <span className="badge bg-success">Active</span>
                  )}
                </td>
                <td>
                  {!user.isBanned && (
                    <button
                      onClick={() => handleBanUser(user._id)}
                      className="btn btn-danger btn-sm"
                      disabled={user.type === "admin"}
                    >
                      Ban User
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderProductsTab = () => (
    <div>
      {loading.products && <p>Loading products...</p>}
      {error.products && <p className="text-danger">{error.products}</p>}
      {!loading.products && !error.products && (
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Condition</th>
              <th>Availability</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>{product.quantity}</td>
                <td>{product.condition}</td>
                <td>
                  {product.availability ? (
                    <span className="badge bg-success">Available</span>
                  ) : (
                    <span className="badge bg-secondary">Sold Out</span>
                  )}
                </td>
                <td>
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="btn btn-warning btn-sm"
                  >
                    Delete Product
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderReportsTab = () => (
    <div>
      {loading.reports && <p>Loading reports...</p>}
      {error.reports && <p className="text-danger">{error.reports}</p>}
      {!loading.reports && !error.reports && (
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Reporter</th>
              <th>Reported User</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report._id}>
                <td>{report.reporterName}</td>
                <td> {/* Corrected: Added TD for reported user info */}
                  {report.reportedUserName} ({report.reportedUserEmail})
                </td>
                <td>{report.reason}</td>
                <td>
                  <span className="badge bg-info text-dark">{report.status}</span>
                </td>
                <td>
                  {report.reportedUserIdValue && !report.reportedUserBanned && (
                    <button
                      onClick={() => handleBanUser(report.reportedUserIdValue)}
                      className="btn btn-danger btn-sm"
                    >
                      Ban Reported User
                    </button>
                  )}
                  {report.reportedUserBanned && (
                    <span className="text-muted">User Banned</span>
                  )}
                  {!report.reportedUserIdValue && (
                    <span className="text-muted">User Not Found</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="container mt-4">
      <h2>Admin Dashboard</h2>
      <ul className="nav nav-tabs mb-3"> {/* Corrected: Moved LIs inside UL */}
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            Products
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            Reports
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {activeTab === "users" && renderUsersTab()}
        {activeTab === "products" && renderProductsTab()}
        {activeTab === "reports" && renderReportsTab()}
      </div>
    </div>
  );
}

export default AdminDashboard;
