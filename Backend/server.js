import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { YSocketIO } from "y-socket.io/dist/server";

const app = express();

app.use(express.static("public"));

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// app.get('/', (req, res) => {
//   res.status(200).json({ message: 'Welcome to Server' });
// });

app.get("/api", (req, res) => {
  res.status(200).json({ message: "Welcome to Server API" });
});

const ysocketio = new YSocketIO(io);
ysocketio.initialize();

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
