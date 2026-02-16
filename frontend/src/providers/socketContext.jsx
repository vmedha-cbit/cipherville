import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./authContext.jsx";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { session } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const instance = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:4000", {
      autoConnect: true
    });
    setSocket(instance);
    return () => instance.close();
  }, []);

  useEffect(() => {
    if (socket && session?.userId && session?.roomId) {
      socket.emit("join-room", { roomId: session.roomId, userId: session.userId });
    }
  }, [socket, session]);

  const value = useMemo(() => ({ socket }), [socket]);
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
