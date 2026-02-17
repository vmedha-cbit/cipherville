import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { attachSession } from "../providers/api.js";
import { useAuth } from "../providers/authContext.jsx";
import { useTimer } from "../providers/timerContext.jsx";

export default function DbLogin() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { timeRemaining, gameStartedAt } = useTimer();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [hintClicked, setHintClicked] = useState(false);
  const [officerName, setOfficerName] = useState("");

  // Ensure session headers are attached
  useEffect(() => {
    if (session?.userId && session?.sessionToken) {
      attachSession(session.userId, session.sessionToken);
    }
  }, [session]);

  // Format time as HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Load officer name and show hint after 3 seconds
  useEffect(() => {
    const loadOfficer = async () => {
      try {
        const { data } = await api.post("/participants/assign-officer");
        setOfficerName(data.officer.name);
        setUsername(data.officer.name);
      } catch (err) {
        console.error("Failed to load officer", err);
      }
    };
    loadOfficer();

    // Show hint after 3 seconds with animation
    const hintTimer = setTimeout(() => {
      setShowHint(true);
    }, 3000);

    return () => clearTimeout(hintTimer);
  }, [session]);

  const handleHintClick = () => {
    setHintClicked(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Ensure session headers are attached
    if (session?.userId && session?.sessionToken) {
      attachSession(session.userId, session.sessionToken);
    }
    
    try {
      console.log("Database login form submitted");
      const result = await api.post("/participants/db-login", { username, password });
      console.log("DB login successful - updating progress...");
      // Update progress FIRST
      await api.post("/participants/progress/update", {
        currentPhase: 2,
        currentSubphase: 1,
        lastVisitedRoute: "/phase2"
      });
      console.log("Progress updated - now navigating to phase2");
      // THEN navigate
      navigate("/phase2");
    } catch (err) {
      console.error("DB login error:", err);
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="film-grain" />
      
      {/* Timer Display */}
      <div className="fixed top-6 right-6 z-50">
        <div className={`px-6 py-3 rounded-lg font-mono text-xl font-bold ${
          gameStartedAt ? 'bg-green-900/60 text-green-300' : 'bg-gray-900/60 text-gray-300'
        } border ${gameStartedAt ? 'border-green-500/50' : 'border-gray-500/50'}`}>
          {gameStartedAt ? formatTime(timeRemaining) : 'Loading timer...'}
        </div>
      </div>

      <div className="min-h-screen flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-lg evidence-card p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-1 bg-amber-600/20 border border-amber-500/50 rounded-full mb-3">
              <span className="text-amber-500 text-xs font-bold tracking-wider">RESTRICTED ACCESS</span>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent">
              Central Investigation Database
            </h2>
            <p className="text-haze text-sm mt-2">Authorized Personnel Only</p>
          </div>

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Username Field */}
          <div>
            <label className="block text-sm font-medium text-haze mb-2">Officer ID</label>
            <input
              className="w-full p-3 bg-ink/80 border border-white/10 rounded text-white font-mono"
              value={username}
              readOnly
              disabled
            />
          </div>

          {/* Password Field with Hint */}
          <div className="relative">
            <label className="block text-sm font-medium text-haze mb-2">Access Code</label>
            <div className="flex items-center gap-3">
              <input
                type="password"
                className="flex-1 p-3 bg-ink border border-white/10 rounded text-white"
                placeholder={hintClicked ? "DDMMYYYY" : "Enter access code"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              
              {/* Hint Button */}
              {showHint && (
                <button
                  type="button"
                  onClick={handleHintClick}
                  className={`px-4 py-3 bg-ink border-2 border-ember/50 rounded text-ember font-semibold hover:bg-ember/10 transition-all ${
                    showHint ? 'animate-pulse' : ''
                  }`}
                  title="Click for hint"
                >
                  💡 Hint
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-ember/10 border border-ember/30 rounded">
              <p className="text-ember text-sm">⚠️ {error}</p>
            </div>
          )}

          <button 
            type="submit"
            className="btn-investigate w-full py-3"
          >
            🔓 Access Database
          </button>
        </form>
      </div>
    </div>

      {/* Officer Info Button - Bottom Right */}
      <button
        type="button"
        onClick={async () => {
          try {
            console.log("Go to Officer Information clicked - updating progress...");
            // UPDATE PROGRESS FIRST
            await api.post("/participants/progress/update", {
              currentPhase: 1,
              currentSubphase: 1,
              lastVisitedRoute: "/phase1"
            });
            console.log("Progress updated - now navigating to /phase1");
            // THEN navigate
            navigate("/phase1");
          } catch (err) {
            console.error("Error:", err);
          }
        }}
        className="fixed bottom-8 right-8 px-6 py-3 bg-ink border-2 border-white/20 rounded-full text-haze font-semibold hover:bg-white/10 hover:border-amber-500/50 hover:text-white transition-all shadow-lg flex items-center gap-2"
      >
        <span>📋</span>
        <span>Go to Officer Information</span>
      </button>
    </div>
  );
}
