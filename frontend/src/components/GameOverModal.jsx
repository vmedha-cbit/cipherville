import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/authContext.jsx";
import { useTimer } from "../providers/timerContext.jsx";
import api from "../providers/api.js";

export default function GameOverModal() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { isExpired } = useTimer();

  // Don't show modal for admins
  const adminToken = localStorage.getItem("cipherville-admin-token");
  if (adminToken) return null;

  // Don't show if not logged in
  if (!session?.rollNumber) return null;

  // Auto-redirect when time expires
  useEffect(() => {
    if (isExpired) {
      // Call end-game API
      const endGame = async () => {
        try {
          await api.post("/participants/end-game", { reason: "timeout" });
        } catch (err) {
          console.error("Failed to end game:", err);
        }
      };
      endGame();

      // Redirect after 5 seconds so user can read the message
      const timeout = setTimeout(() => navigate("/"), 5000);
      return () => clearTimeout(timeout);
    }
  }, [isExpired, navigate]);

  if (!isExpired) return null;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-red-950 border-4 border-red-600 rounded-xl p-8 text-center shadow-2xl animate-pulse">
          <div className="mb-6 text-7xl">⏰</div>
          <h2 className="text-4xl font-bold text-red-400 mb-4">TIME'S UP!</h2>
          <p className="text-lg text-red-300 mb-2">
            You couldn't solve the case in time.
          </p>
          <p className="text-sm text-red-200/80 mb-8">
            Better luck next time, detective. The mystery remains unsolved...
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all transform hover:scale-105 w-full"
          >
            Return to Login
          </button>
        </div>
      </div>
    </div>
  );
}
