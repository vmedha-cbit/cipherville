import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../providers/api.js";
import { useAuth } from "../providers/authContext.jsx";
import { useSocket } from "../providers/socketContext.jsx";

export default function Lobby() {
  const navigate = useNavigate();
  const { session, updateSession } = useAuth();
  const { socket } = useSocket();
  const [roomId, setRoomId] = useState(session?.roomId || "");
  const [status, setStatus] = useState("Waiting for room assignment");
  const [error, setError] = useState("");

  const handleJoin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/rooms/join", { roomId: roomId.trim().toUpperCase() });
      const nextRoom = roomId.trim().toUpperCase();
      updateSession({ roomId: nextRoom });
      setStatus("Waiting for host to start");
      socket?.emit("join-room", { roomId: nextRoom, userId: session.userId });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to join room");
    }
  };

  useEffect(() => {
    if (!socket) return;
    const handler = () => navigate("/officer");
    socket.on("game-start", handler);
    return () => socket.off("game-start", handler);
  }, [socket, navigate]);

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-3xl mx-auto bg-steel/70 p-8 rounded-xl border border-white/10">
        <h2 className="text-2xl font-semibold">Lobby</h2>
        <p className="text-haze mt-2">{status}</p>
        <form className="mt-6 flex flex-col md:flex-row gap-3" onSubmit={handleJoin}>
          <input
            className="flex-1 p-3 bg-ink border border-white/10 rounded"
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            required
          />
          <button className="px-6 py-3 bg-ember text-black font-semibold rounded">Join Room</button>
        </form>
        {error && <p className="text-ember text-sm mt-3">{error}</p>}
      </div>
    </div>
  );
}
