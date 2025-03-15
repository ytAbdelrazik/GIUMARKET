const io = require("socket.io-client");

const socket = io("http://localhost:8080");

socket.on("connect", () => {
  console.log("Connected to WebSocket");

  socket.emit("joinChat", { user1: "67d5cc35b8a286d5caa3ca6e", user2: "67d5cc40b8a286d5caa3ca71", productId: "65f4567890abcdef12345678" });

  socket.emit("sendMessage", {
    sender: "67d5cc35b8a286d5caa3ca6e",
    receiver: "67d5cc40b8a286d5caa3ca71",
    text: "Hello from test!",
    productId: "65f4567890abcdef12345678",
  });

  socket.on("receiveMessage", (msg) => {
    console.log("Received Message:", msg);
  });
});

socket.on("disconnect", () => {
  console.log("Disconnected from WebSocket");
});
