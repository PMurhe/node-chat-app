const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const path = require("path");
const PORT = process.env.PORT || 3000;

const staticContentPath = path.join(__dirname, "../public");
app.use(express.static(staticContentPath));

app.get("/", (req, res) => {
  res.render("index");
});

server.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}!`);
});

io.on("connection", (socket) => {
  console.log(`New WebSocket Connection!`);

  /*
  // Send to the connected client
  socket.emit("message", generateMessage('Welcome!'));

  //send to everyone apart from the connected client
  socket.broadcast.emit("message", generateMessage("A new user has joined!"));
  */

  socket.on("join", ({ username, room },callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if(error){
      return callback(error);
    }

    socket.join(user.room);
    socket.emit("message", generateMessage('Admin',`Welcome ${user.username}!`));
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage('Admin',`${user.username} has joined!`));
      io.to(user.room).emit('roomData',{
        room:user.room,
        users : getUsersInRoom(user.room)
      })
      callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    //send to all connected clients
    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback(null);
  });

  socket.on("sendLocation", (coordinates, callback) => {
    //send to all connected clients
    const user = getUser(socket.id);
    const url = `https://google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`;
    io.to(user.room).emit("locationMessage", generateLocationMessage(user.username, url));
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if(user){
      io.to(user.room).emit("message", generateMessage('Admin',`${user.username} has left!`));
      io.to(user.room).emit('roomData',{
        room:user.room,
        users : getUsersInRoom(user.room)
      })
    }
  });
});


