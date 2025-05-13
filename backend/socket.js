const Message = require("./models/message");
const Conversation = require("./models/conversation");
const User = require("./models/user");

function setupSocketIO(io) {
  // Store user socket mappings
  const userSockets = new Map();

  io.on("connection", (socket) => {
    console.log("A user connected");
    
    // Get authentication data from handshake
    const userId = socket.handshake.auth.userId;
    if (userId) {
      socket.user = { id: userId };
      userSockets.set(userId, socket.id);
      console.log(`User ${userId} connected with socket ${socket.id}`);
    }

    socket.on("authenticate", async (userData) => {
      try {
        if (!userData || !userData.id) {
          throw new Error("Invalid authentication data");
        }

        // Verify user exists in database
        const user = await User.findById(userData.id);
        if (!user) {
          throw new Error("User not found");
        }

        socket.user = { id: userData.id };
        userSockets.set(userData.id, socket.id);
        console.log(`User authenticated: ${userData.id}`);
        socket.emit("authenticate_success");
      } catch (error) {
        console.error("Authentication error:", error.message);
        socket.emit("authenticate_error", error.message);
      }
    });

    socket.on("joinChat", async ({ user1, user2 }) => {
      try {
        if (!socket.user) {
          throw new Error("Not authenticated");
        }

        // Create a unique room name for these two users
        const roomName = [user1, user2].sort().join('-');
        
        // Leave all other rooms first
        socket.rooms.forEach(room => {
          if (room !== socket.id) {
            socket.leave(room);
          }
        });

        // Join the new room
        socket.join(roomName);
        console.log(`User ${socket.user.id} joined room ${roomName}`);
      } catch (error) {
        console.error("Error joining chat:", error);
        socket.emit("error", error.message);
      }
    });

    socket.on("sendMessage", async ({ sender, receiver, text }) => {
      try {
        if (!socket.user || socket.user.id !== sender) {
          throw new Error("Not authenticated or sender mismatch");
        }

        // Create and save the message
        const message = new Message({
          sender,
          receiver,
          text,
          timestamp: new Date()
        });
        await message.save();

        // Find or create conversation
        let conversation = await Conversation.findOne({
          participants: { $all: [sender, receiver] }
        });

        if (!conversation) {
          conversation = new Conversation({
            participants: [sender, receiver],
            lastMessage: message._id
          });
          await conversation.save();
        } else {
          conversation.lastMessage = message._id;
          await conversation.save();
        }

        // Get the room name
        const roomName = [sender, receiver].sort().join('-');
        
        // Emit to the room
        io.to(roomName).emit("receiveMessage", {
          _id: message._id,
          sender,
          receiver,
          text,
          timestamp: message.timestamp
        });

        // If receiver is online, also emit directly to their socket
        const receiverSocketId = userSockets.get(receiver);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receiveMessage", {
            _id: message._id,
            sender,
            receiver,
            text,
            timestamp: message.timestamp
          });
        }
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", error.message);
      }
    });

    socket.on("disconnect", () => {
      if (socket.user) {
        userSockets.delete(socket.user.id);
        console.log(`User ${socket.user.id} disconnected`);
      }
    });
  });
}

module.exports = { setupSocketIO }; 