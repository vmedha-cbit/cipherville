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
    <div className="min-h-screen relative overflow-hidden bg-background flex items-center justify-center p-6">
      <div className="absolute inset-0 z-0 opacity-10 fingerprint-bg"></div>
      <div className="absolute inset-0 z-0 grid-overlay opacity-20"></div>

      <div className="w-full max-w-lg bg-card border border-border md:border-t-4 md:border-t-primary p-10 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 animate-fadeIn backdrop-blur-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-4 shadow-[0_0_10px_rgba(255,59,59,0.2)]">
            <span className="text-primary text-xs font-bold tracking-[0.3em] uppercase animate-pulse">Restricted Access</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            CENTRAL <span className="text-primary">DATABASE</span>
          </h2>
          <div className="h-1 w-20 bg-primary mx-auto mt-4 mb-2 rounded-full"></div>
          <p className="text-muted-foreground text-sm font-mono tracking-wider">AUTHORIZED PERSONNEL ONLY</p>
        </div>

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Username Field */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Officer ID</label>
            <div className="relative">
               <input
                 className="w-full p-3 bg-muted/40 border border-border rounded text-foreground font-mono pl-10 cursor-not-allowed opacity-70"
                 value={username || "LOADING..."}
                 readOnly
                 disabled
               />
               <div className="absolute left-3 top-3 text-primary">👮</div>
            </div>
          </div>

          {/* Password Field with Hint */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Access Code</label>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                 <input
                   type="password"
                   className="w-full p-3 bg-muted/40 border border-input rounded text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all pl-10"
                   placeholder={hintClicked ? "DDMMYYYY" : "Enter access code"}
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   required
                 />
                 <div className="absolute left-3 top-3 text-primary">🔑</div>
              </div>
              
              {/* Hint Button */}
              {showHint && (
                <button
                  type="button"
                  onClick={handleHintClick}
                  className={`px-4 bg-secondary/10 border border-secondary/30 rounded text-secondary font-bold hover:bg-secondary/20 transition-all ${
                    showHint ? 'animate-[pulse_2s_infinite]' : ''
                  }`}
                  title="Click for hint"
                >
                  💡
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/50 rounded flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <p className="text-destructive text-sm font-bold">{error}</p>
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 tracking-widest uppercase flex items-center justify-center gap-2 group overflow-hidden relative"
          >
            <span className="relative z-10 flex items-center gap-2">
               <span>🔓</span> ACCESS DATABASE
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </form>
        
        <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-[10px] text-muted-foreground font-mono">
                SECURE CONNECTION • ENCRYPTION: AES-256
            </p>
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
        className="fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-3 bg-card border border-primary/30 rounded-full text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-[0_0_20px_rgba(0,0,0,0.3)] flex items-center gap-3 z-50 group backdrop-blur-sm"
      >
        <span className="text-xl group-hover:rotate-12 transition-transform">📋</span>
        <span className="font-bold tracking-wide text-sm">Go to Officer clues</span>
      </button>
    </div>
  );
}
