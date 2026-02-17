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
    <div className="min-h-screen px-6 py-10 film-grain">
      <div className="max-w-3xl mx-auto evidence-card p-8 rounded-xl shadow-2xl glow-intense animate-fadeIn">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent mb-2">
            Investigation Lobby
          </h2>
          <div className="h-1 w-16 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mb-4"></div>
        </div>
        
        <div className="bg-black/40 p-4 rounded-lg border border-amber-500/30 mb-6">
          <p className="text-haze text-center">
            <span className="inline-block mr-2">🔍</span>
            {status}
          </p>
        </div>
        
        <form className="mt-6 flex flex-col gap-4" onSubmit={handleJoin}>
          <div>
            <label className="text-sm text-amber-400 font-semibold tracking-wide">ROOM CODE</label>
            <input
              className="w-full mt-2 p-4 bg-black/60 border-2 border-white/20 rounded-lg text-white font-mono text-xl tracking-wider focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
              placeholder="Enter 6-digit room code"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              maxLength={6}
              required
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm font-semibold">⚠️ {error}</p>
            </div>
          )}
          
          <button className="w-full py-4 btn-investigate text-black font-bold text-lg rounded-lg shadow-lg tracking-wide">
            🚪 JOIN INVESTIGATION ROOM
          </button>
        </form>
        
        <p className="text-center text-haze text-sm mt-6">
          Wait for the admin to start the game once you've joined
        </p>
      </div>
    </div>
  );
}
