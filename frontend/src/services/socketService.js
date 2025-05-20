import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.callbacks = {};
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Initialize socket connection
  connect(userId) {
    if (!userId) {
      console.error("UserId is required for socket connection");
      return null;
    }

    if (!this.socket) {
      console.log("Initializing socket connection for user:", userId);
      this.socket = io("http://localhost:8080", {
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 10000,
        auth: { userId }, // Add authentication data to initial connection
      });

      this.socket.on("connect", () => {
        console.log("Connected to WebSocket server");
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // Authenticate the user with detailed logging
        console.log("Emitting authenticate event with userId:", userId);
        this.socket.emit("authenticate", { id: userId });

        this.socket.on("authenticate_success", () => {
          console.log("Authentication successful for user:", userId);
        });

        this.socket.on("authenticate_error", (error) => {
          console.error("Authentication error:", error);
        });

        // Notify any listeners that we're connected
        if (this.callbacks.onConnect) {
          this.callbacks.onConnect();
        }
      });

      this.socket.on("disconnect", (reason) => {
        console.log(`Disconnected from WebSocket server: ${reason}`);
        this.isConnected = false;

        if (this.callbacks.onDisconnect) {
          this.callbacks.onDisconnect(reason);
        }
      });

      this.socket.on("connect_error", (error) => {
        console.log("Connection error:", error);
        this.reconnectAttempts++;

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.log("Max reconnection attempts reached");
          if (this.callbacks.onConnectionFailed) {
            this.callbacks.onConnectionFailed(error);
          }
        }
      });

      // Set up receiveMessage listener
      this.socket.on("receiveMessage", (message) => {
        console.log("Message received:", message);
        if (this.callbacks.onMessageReceived) {
          this.callbacks.onMessageReceived(message);
        }
      });
    }
    return this.socket;
  }

  // Check if connected
  isConnected() {
    return this.socket?.connected || false;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join a chat room
  joinChat(user1, user2) {
    if (this.socket && this.isConnected) {
      console.log(`Joining chat room for users ${user1} and ${user2}`);
      this.socket.emit("joinChat", { user1, user2 });
    } else {
      console.error("Socket not connected");
    }
  }

  // Send a message
  sendMessage(sender, receiver, text) {
    if (this.socket && this.isConnected) {
      console.log(`Sending message from ${sender} to ${receiver}`);
      this.socket.emit("sendMessage", {
        sender,
        receiver,
        text,
      });
      return true;
    } else {
      console.error("Socket not connected");
      return false;
    }
  }

  // Mark a message as read
  markAsRead(messageId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("markAsRead", { messageId });
    }
  }

  // Register callbacks
  onConnect(callback) {
    this.callbacks.onConnect = callback;
  }

  onDisconnect(callback) {
    this.callbacks.onDisconnect = callback;
  }

  onConnectionFailed(callback) {
    this.callbacks.onConnectionFailed = callback;
  }

  onMessageReceived(callback) {
    this.callbacks.onMessageReceived = callback;
  }

  // Create a new message via socket
  createMessage(conversationId, text, productId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("createMessage", { conversationId, text, productId });
    }
  }

  // Listen for new messages
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on("newMessage", callback);
    }
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;
