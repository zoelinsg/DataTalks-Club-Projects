const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { randomUUID } = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());

const sessions = new Map();

app.post("/api/sessions", (req, res) => {
  const id = randomUUID();
  sessions.set(id, { code: "" });
  res.json({ id });
});

app.get("/api/sessions/:id", (req, res) => {
  const { id } = req.params;
  if (!sessions.has(id)) {
    return res.status(404).json({ error: "Session not found" });
  }

  const data = sessions.get(id);
  res.json({ id, ...data });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Client connected", socket.id);

  socket.on("join-session", ({ sessionId }) => {
    if (!sessionId || !sessions.has(sessionId)) {
      return;
    }

    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined session ${sessionId}`);

    const { code } = sessions.get(sessionId);
    socket.emit("init-code", { code });
  });

  socket.on("code-change", ({ sessionId, code }) => {
    if (!sessionId || !sessions.has(sessionId)) {
      return;
    }

    sessions.set(sessionId, { code });
    socket.to(sessionId).emit("code-change", { code });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
