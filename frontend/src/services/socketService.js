import { io } from "socket.io-client";
import { chatService } from "./api";

class SocketService {
  constructor() {
    this.socket = null;
    this.callbacks = {};
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Initialize socket connection
  connect() {
    if (!this.socket) {
      this.socket = io("http://localhost:8080", {
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 10000,
      });

      this.socket.on("connect", () => {
        console.log("Connected to WebSocket server");
        this.isConnected = true;
        this.reconnectAttempts = 0;

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
  joinChat(user1, user2, productId) {
    if (this.socket) {
      console.log(`Joining chat room for users ${user1}, ${user2} and product ${productId}`);
      this.socket.emit("joinChat", { user1, user2, productId });
    } else {
      console.error("Socket not connected, attempting to connect");
      this.connect();
      setTimeout(() => this.joinChat(user1, user2, productId), 500);
    }
  }

  // Send a message
  sendMessage(sender, receiver, text, productId) {
    if (this.socket && this.isConnected) {
      console.log(`Sending message from ${sender} to ${receiver} about product ${productId}`);
      this.socket.emit("sendMessage", {
        sender,
        receiver,
        text,
        productId,
      });
      return true;
    } else {
      console.log("Socket not connected, using HTTP fallback");
      // Use HTTP fallback to ensure persistence
      chatService
        .sendMessage(sender, receiver, text, productId)
        .then((message) => {
          if (this.callbacks.onMessageReceived) {
            this.callbacks.onMessageReceived(message);
          }
        })
        .catch((error) => {
          console.error("Failed to send message via HTTP fallback:", error);
        });
      return false;
    }
  }

  // Mark a message as read
  markAsRead(messageId) {
    if (this.socket && messageId) {
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
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;
