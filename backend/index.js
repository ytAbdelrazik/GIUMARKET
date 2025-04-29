const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const socketIo = require("socket.io");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const reportRoutes = require("./routes/ReportRoutes");
const adminRoutes = require("./routes/admin");

const reservationRoutes = require("./routes/reservation");

const userRoutes = require("./routes/users");
const chatRoutes = require("./routes/chat"); // We'll create this
const orderRoutes = require("./routes/order");

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

app.use("api/admin", adminRoutes);

app.use("/api/chat", chatRoutes);
app.use("/api/reports", reportRoutes);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
