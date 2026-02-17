import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/authContext.jsx";


export default function Login() {
  const navigate = useNavigate();
  const { login, session } = useAuth();
  const [rollNo, setRollNo] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.userId) {
      navigate("/officer");
    }
  }, [session, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // Login is backend-driven, no localStorage needed
      const result = await login(rollNo.trim(), displayName.trim());
      if (result.status === "new-session") {
        navigate("/officer");
      } else if (result.status === "resume-session") {
        navigate(result.lastVisitedRoute || "/officer");
      } else if (result.status === "completed") {
        setError("Game already completed. Re-entry not allowed.");
      } else {
        setError("Unknown login state");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 film-grain">
      <div className="w-full max-w-md evidence-card p-8 rounded-xl shadow-2xl glow-intense animate-fadeIn">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-500 via-orange-600 to-amber-500 bg-clip-text text-transparent mb-2">
            CIPHERVILLE
          </h1>
          <div className="h-1 w-20 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mb-4"></div>
          <p className="text-haze text-lg font-semibold tracking-wide">Crime Investigation Challenge</p>
          <p className="text-haze/70 text-sm mt-2">🔍 Solve the Mystery • 🕵️ Find the Evidence</p>
        </div>
        
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-amber-400 font-semibold tracking-wide">DETECTIVE ID</label>
            <input
              className="w-full mt-2 p-3 bg-black/60 border-2 border-white/20 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 outline-none transition-all text-white font-mono"
              placeholder="Enter your roll number"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-amber-400 font-semibold tracking-wide">NAME (OPTIONAL)</label>
            <input
              className="w-full mt-2 p-3 bg-black/60 border-2 border-white/20 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 outline-none transition-all text-white"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm font-semibold">⚠️ {error}</p>
            </div>
          )}
          <button className="w-full py-4 btn-investigate text-black font-bold text-lg rounded-lg shadow-lg tracking-wide">
            🚨 ENTER INVESTIGATION
          </button>
        </form>
      </div>
    </div>
  );
}
