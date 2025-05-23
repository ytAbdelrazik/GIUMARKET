const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const socketIo = require("socket.io");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const adminRoutes = require("./routes/admin");
const reportRoutes = require("./routes/ReportRoutes");
const reservationRoutes = require("./routes/reservation");
const userRoutes = require("./routes/users");
const orderRoutes = require("./routes/order");
const messageRoutes = require("./routes/message");
const conversationRoutes = require("./routes/conversation");
const path = require("path");

const cors = require("cors");
const { setupSocketIO } = require("./socket"); // We'll create this

dotenv.config();
const app = express();

// Create HTTP server and Socket.io instance
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(express.json());
app.use(cors());

console.log("MongoDB URI:", process.env.MONGODB_URI); // Log the MongoDB URI for debugging

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Set up Socket.io
setupSocketIO(io);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

app.use("/api/users", userRoutes);

app.use("/api/reservations", reservationRoutes);
app.use("/api/orders", orderRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/reports", reportRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/conversations", conversationRoutes);

// STATIC IMAGE
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

console.log("MONGODB_URI:", process.env.MONGODB_URI);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
