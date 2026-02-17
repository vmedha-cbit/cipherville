import { useAuth } from "../providers/authContext.jsx";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Completion() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect after 5 seconds (backend has all state)
    const timeout = setTimeout(() => {
      logout();
      navigate("/");
    }, 5000);

    return () => clearTimeout(timeout);
  }, [logout, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen relative">
      <div className="film-grain" />
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-xl evidence-card p-8 text-center">
          <h2 className="text-3xl font-semibold bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 bg-clip-text text-transparent mb-4">
            Case Closed
          </h2>
          <p className="text-haze mt-3">Great work, Investigator {session?.rollNumber}.</p>
          <p className="text-haze mt-2 text-sm">You will be redirected to login in 5 seconds...</p>
          
          <button
            onClick={handleLogout}
            className="mt-6 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded transition"
          >
            Return to Login Now
          </button>
        </div>
      </div>
    </div>
  );
}
