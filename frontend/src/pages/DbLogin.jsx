import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../providers/api.js";

export default function DbLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [hintClicked, setHintClicked] = useState(false);
  const [officerName, setOfficerName] = useState("");

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
  }, []);

  const handleHintClick = () => {
    setHintClicked(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/participants/db-login", { username, password });
      navigate("/phase2");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10 relative">
      <div className="w-full max-w-lg bg-steel/70 p-10 rounded-xl border-2 border-ember/30 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-1 bg-ember/20 border border-ember/50 rounded-full mb-3">
            <span className="text-ember text-xs font-bold tracking-wider">RESTRICTED ACCESS</span>
          </div>
          <h2 className="text-3xl font-bold text-white">Central Investigation Database</h2>
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
            className="w-full py-3 bg-ember text-black font-bold rounded-lg hover:bg-ember/90 transition-all transform hover:scale-105"
          >
            🔓 Access Database
          </button>
        </form>
      </div>

      {/* Officer Info Button - Bottom Right */}
      <button
        onClick={() => navigate("/phase1")}
        className="fixed bottom-8 right-8 px-6 py-3 bg-ink border-2 border-white/20 rounded-full text-haze font-semibold hover:bg-white/10 hover:border-ember/50 hover:text-white transition-all shadow-lg flex items-center gap-2"
        type="button"
      >
        <span>📋</span>
        <span>Go to Officer Information</span>
      </button>
    </div>
  );
}
