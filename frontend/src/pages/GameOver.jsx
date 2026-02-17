import { useEffect } from "react";
import { useAuth } from "../providers/authContext.jsx";
import { useNavigate } from "react-router-dom";
import api from "../providers/api.js";

export default function GameOver() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // End game session on timeout
    const endGame = async () => {
      try {
        await api.post("/participants/end-game", { reason: "timeout" });
      } catch (err) {
        console.error("Failed to end game:", err);
      }
    };
    endGame();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen relative">
      <div className="film-grain" />
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-xl evidence-card p-8 text-center border-2 border-red-500">
          <h2 className="text-4xl font-semibold bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent mb-4">
            ⏰ Time's Up!
          </h2>
          <p className="text-red-300 text-lg mt-4 mb-6">
            Your investigation time has expired, Investigator {session?.rollNumber}.
          </p>
          
          <div className="bg-red-900/20 border border-red-500/50 rounded p-4 mb-8">
            <p className="text-haze text-sm">
              Your progress has been saved. You can attempt again in the next investigation cycle.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition"
          >
            Return to Login
          </button>
        </div>
      </div>
    </div>
  );
}
