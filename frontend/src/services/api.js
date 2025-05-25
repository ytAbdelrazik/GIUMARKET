import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL
  // headers: {
  //   "Content-Type": "application/json",
  // }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Product API calls
export const productApi = {
  // Get all available products
  getAvailableProducts: () => api.get("/products/available"),
  
  // Get products by category
  getProductsByCategory: (category) => api.get(`/products/category/${category}`),
  
  // Get products by seller
  getProductsBySeller: (sellerId) => api.get(`/products/seller/${sellerId}`),
  
  // Get single product
  getProductById: (id) => api.get(`/products/single/${id}`),
  
  // Search products with filters
  searchProducts: (params) => api.get("/products/search", { params }),
  
  // Create new product
  createProduct: (productData) => api.post("/products/create", productData),
  
  // Update product
  updateProduct: (id, productData) => api.put(`/products/update/${id}`, productData),
  
  // Delete product
  deleteProduct: (id) => api.delete(`/products/delete/${id}`),
};

// User API calls
export const userApi = {
  // Get user profile
  getUserProfile: (id) => api.get(`/users/${id}`),
  
  // Update user profile
  updateUserProfile: (id, userData) => api.put(`/users/${id}`, userData),
};

// Admin API calls
export const adminApi = {
  // Get all users (admin only)
  getAllUsers: () => api.get("/users"),
  
  // Search users (admin only)
  searchUsers: (query) => api.get("/users/search", { params: { query } }),
  
  // Ban user (admin only)
  banUser: (userId) => api.put(`/users/ban/${userId}`),
  
  // Unban user (admin only)
  unbanUser: (userId) => api.put(`/users/unban/${userId}`),
  
  // Get user reports (admin only)
  getUserReports: () => api.get("/reports"),
  
  // Get system statistics (admin only)
  getSystemStats: () => api.get("/admin/stats"),
};

// Reservation API calls
export const reservationApi = {
  // Create reservation request
  createReservation: (productId) => api.post(`/reservations/request/${productId}`),
  
  // Get seller's reservations
  getSellerReservations: () => api.get("/reservations/seller"),
  
  // Get buyer's reservations
  getBuyerReservations: () => api.get("/reservations/buyer"),
  
  // Accept reservation
  acceptReservation: (reservationId) => api.put(`/reservations/accept/${reservationId}`),
  
  // Reject reservation
  rejectReservation: (reservationId) => api.put(`/reservations/reject/${reservationId}`),
  
  // Cancel reservation
  cancelReservation: (reservationId) => api.put(`/reservations/cancel/${reservationId}`),

  // Mark product as sold
  markAsSold: (reservationId) => api.put(`/reservations/sold/${reservationId}`),
};

// Auth Services
export const authService = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { token, user } = response.data;
    
    // Store token and user data in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    const { token, user } = response.data;
    
    // Store token and user data in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Chat Services
export const chatService = {
  sendMessage: async (conversationId, text) => {
    const response = await api.post("/messages", { conversationId, text });
    return response.data;
  },
  getMessages: async (conversationId) => {
    const response = await api.get(`/messages/${conversationId}`);
    return response.data;
  },
};

// --- Named Exports for Components ---

// Export specific user functions needed by components
export const getUsers = async () => {
  const response = await api.get("/users"); // Endpoint for getting all users
  return response.data;
};

// Export report function
export const getReports = async () => {
  const response = await api.get("/reports"); // Use api and correct endpoint
  return response.data;
};

export default {
  auth: authService,
  product: productApi,
  user: userApi,
  admin: adminApi,
  reservation: reservationApi,
  chat: chatService,
  // Note: getReports, getUsers are now named exports above
};
