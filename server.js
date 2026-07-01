// Create the Express app and HTTP server.
const express = require("express");
const app = express();
const server = require("http").Server(app);

// Use EJS files to create web pages.
app.set("view engine", "ejs");

// Make files inside the public folder available to the browser.
app.use(express.static("public"));

// Create unique room IDs.
const { v4: uuidv4 } = require("uuid");

// Set up Socket.IO and the PeerJS server.
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
app.use("/peerjs", peerServer);

// Create a new room and redirect the user to it.
app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

// Open the room page using the room ID from the URL.
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

// Handle users joining and leaving a room.
io.on("connection", (socket) => {
  // Receive the user's display name so other clients can show it under their video.
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    setTimeout(() => {
      socket.broadcast.to(roomId).emit("user-connected", userId, userName);
    }, 1000);

    socket.on("disconnect", () => {
      console.log("user disconnect")
      socket.to(roomId).emit("user-disconnected", userId)
    });
  });
});

// Start the server on port 3030.
server.listen(3030);
