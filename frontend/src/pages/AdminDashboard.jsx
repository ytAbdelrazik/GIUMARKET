import React, { useState, useEffect, useCallback } from "react";
import { adminApi, productApi } from "../services/api";

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
  const [stats, setStats] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading((prev) => ({ ...prev, users: true }));
    setError((prev) => ({ ...prev, users: null }));
    try {
      const response = await adminApi.getAllUsers();
      setUsers(response.data);
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
      const response = await productApi.getAvailableProducts();
      setProducts(response.data);
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
      const response = await adminApi.getUserReports();
      setReports(
        response.data.map((report) => ({
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

  const fetchStats = async () => {
    try {
      const response = await adminApi.getSystemStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchProducts();
    fetchReports();
    fetchStats();
  }, [fetchUsers, fetchProducts, fetchReports]);

  const handleBanUser = async (userId) => {
    if (window.confirm("Are you sure you want to ban this user?")) {
      try {
        await adminApi.banUser(userId);
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

  const handleUnbanUser = async (userId) => {
    if (window.confirm("Are you sure you want to unban this user?")) {
      try {
        await adminApi.unbanUser(userId);
        setUsers(
          users.map((user) =>
            user._id === userId ? { ...user, isBanned: false } : user
          )
        );
        setReports(
          reports.map((report) =>
            report.reportedUserIdValue === userId
              ? { ...report, reportedUserBanned: false }
              : report
          )
        );
        alert("User unbanned successfully.");
      } catch (err) {
        console.error("Error unbanning user:", err);
        alert(`Failed to unban user: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productApi.deleteProduct(productId);
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
                  {user.isBanned ? (
                    <button
                      onClick={() => handleUnbanUser(user._id)}
                      className="btn btn-success btn-sm"
                    >
                      Unban
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBanUser(user._id)}
                      className="btn btn-danger btn-sm"
                    >
                      Ban
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

      {stats && (
        <div className="row mt-4">
          <div className="col-md-3">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <h5 className="card-title">Total Users</h5>
                <p className="card-text display-6">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-success text-white">
              <div className="card-body">
                <h5 className="card-title">Active Products</h5>
                <p className="card-text display-6">{stats.activeProducts}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-info text-white">
              <div className="card-body">
                <h5 className="card-title">Total Sales</h5>
                <p className="card-text display-6">${stats.totalSales}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-warning text-white">
              <div className="card-body">
                <h5 className="card-title">Pending Reports</h5>
                <p className="card-text display-6">{stats.pendingReports}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
