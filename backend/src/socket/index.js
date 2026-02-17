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
  // Kept for backward compatibility, but not used in new system
  if (!ioInstance || !roomId) return;
  ioInstance.to(roomId).emit(event, payload);
};

export const getIO = () => ioInstance;
