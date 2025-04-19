const Message = require("./models/Message");

const setupSocketIO = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected", socket.id);

    socket.on("joinChat", ({ user1, user2, productId }) => {
      const room = [user1, user2, productId].sort().join("_");
      socket.join(room);
      console.log(`User joined chat: ${room}`);
    });

    socket.on("sendMessage", async ({ sender, receiver, text, productId }) => {
      try {
        const room = [sender, receiver, productId].sort().join("_");
        const message = new Message({ room, sender, text, productId });
        await message.save();
        io.to(room).emit("receiveMessage", message);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("markAsRead", async ({ messageId }) => {
      try {
        await Message.findByIdAndUpdate(messageId, { read: true });
        console.log("Message marked as read", messageId);
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
  });
};

module.exports = { setupSocketIO };
