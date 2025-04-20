import axios from "axios";

const API_URL = "http://localhost:8080/api";

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_URL,
});

// Add request interceptor to include token in all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Services
export const authService = {
  login: async (email, password) => {
    const response = await apiClient.post("/auth/login", { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  },
};

// Product Services
export const productService = {
  getAllProducts: async () => {
    const response = await apiClient.get("/products/all");
    return response.data;
  },

  getAvailableProducts: async () => {
    const response = await apiClient.get("/products/available");
    return response.data;
  },

  getProductById: async (id) => {
    const response = await apiClient.get(`/products/single/${id}`);
    return response.data;
  },

  getProductsByCategory: async (category) => {
    const response = await apiClient.get(`/products/category/${category}`);
    return response.data;
  },

  getProductsBySeller: async (sellerId) => {
    const response = await apiClient.get(`/products/seller/${sellerId}`);
    return response.data;
  },

  searchProducts: async (query) => {
    const response = await apiClient.get(`/products/search?q=${query}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await apiClient.post("/products/create", productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await apiClient.put(`/products/update/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/products/delete/${id}`);
    return response.data;
  },
};

// Reservation Services
export const reservationService = {
  createReservation: async (productId) => {
    const response = await apiClient.post(`/reservations/request/${productId}`);
    return response.data;
  },

  getSellerReservations: async () => {
    const response = await apiClient.get("/reservations/seller");
    return response.data;
  },

  getBuyerReservations: async () => {
    const response = await apiClient.get("/reservations/buyer");
    return response.data;
  },

  acceptReservation: async (reservationId) => {
    const response = await apiClient.put(`/reservations/accept/${reservationId}`);
    return response.data;
  },

  rejectReservation: async (reservationId) => {
    const response = await apiClient.put(`/reservations/reject/${reservationId}`);
    return response.data;
  },

  cancelReservation: async (reservationId) => {
    const response = await apiClient.put(`/reservations/cancel/${reservationId}`);
    return response.data;
  },
};

// User Services
export const userService = {
  getAllUsers: async () => {
    const response = await apiClient.get("/users");
    return response.data;
  },

  updateUserProfile: async (userId, userData) => {
    const response = await apiClient.put(`/users/${userId}`, userData);
    return response.data;
  },
};

// Chat Services
export const chatService = {
  // Get messages between two users for a specific product
  getMessages: async (user1Id, user2Id, productId) => {
    const response = await apiClient.get(`/chat/${user1Id}/${user2Id}/${productId}`);
    return response.data;
  },

  // Get all conversations for the current user
  getConversations: async () => {
    const response = await apiClient.get("/chat/conversations");
    return response.data;
  },

  // Send a message (HTTP fallback if socket fails)
  sendMessage: async (sender, receiver, text, productId) => {
    const response = await apiClient.post("/chat/send", {
      sender,
      receiver,
      text,
      productId,
    });
    return response.data;
  },

  // Get user details by ID
  getUserById: async (userId) => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  // Mark message as read
  markAsRead: async (messageId) => {
    const response = await apiClient.patch(`/chat/read/${messageId}`);
    return response.data;
  },
};

export default {
  auth: authService,
  products: productService,
  reservations: reservationService,
  users: userService,
  chat: chatService,
};
