import { Server } from "socket.io";
import { env } from "../config/env.js";
import { logEvent } from "../services/logService.js";

const socketState = new Map();
let ioInstance = null;

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: env.CLIENT_ORIGIN, credentials: true }
  });

  ioInstance = io;

  io.on("connection", (socket) => {
    socket.on("join-room", async ({ roomId, userId }) => {
      if (!roomId || !userId) return;
      socket.join(roomId);
      socketState.set(socket.id, { roomId, userId });
      socket.to(roomId).emit("user-joined", { userId });
      await logEvent("socket-join", { roomId, userId });
    });

    socket.on("phase-update", ({ roomId, phase }) => {
      if (!roomId) return;
      socket.to(roomId).emit("phase-update", { phase });
    });

    socket.on("progress-sync", ({ roomId, payload }) => {
      if (!roomId) return;
      socket.to(roomId).emit("progress-sync", payload);
    });

    socket.on("admin-monitor", ({ roomId }) => {
      if (!roomId) return;
      socket.join(`admin-${roomId}`);
    });

    socket.on("game-start", ({ roomId }) => {
      if (!roomId) return;
      io.to(roomId).emit("game-start", { roomId });
    });

    socket.on("game-end", ({ roomId }) => {
      if (!roomId) return;
      io.to(roomId).emit("game-end", { roomId });
    });

    socket.on("disconnect", async () => {
      const meta = socketState.get(socket.id);
      if (meta) {
        socketState.delete(socket.id);
        await logEvent("socket-disconnect", meta);
      }
    });
  });

  return io;
};

export const emitRoom = (roomId, event, payload) => {
  if (!ioInstance || !roomId) return;
  ioInstance.to(roomId).emit(event, payload);
};
