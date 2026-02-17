import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../providers/api.js";

export default function YearReveal() {
  const navigate = useNavigate();
  const location = useLocation();
  const [revealed, setRevealed] = useState(false);
  
  // Get year from route challenge state or use default
  const year = location.state?.year || "1995";

  const handleRevealKey = async () => {
    setRevealed(true);
    // Save year revelation to backend
    try {
      await api.post("/participants/progress/update", {
        phase1YearRevealed: true,
        year: year
      });
    } catch (err) {
      console.error("Failed to save year revelation", err);
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="film-grain" />
      <div className="min-h-screen px-6 py-10 flex items-center justify-center">
        <div className="max-w-2xl w-full evidence-card p-10 text-center space-y-8">
          <div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-emerald-300 via-green-300 to-emerald-400 bg-clip-text text-transparent mb-2">
              🔓 Secure Key Revealed
            </h2>
            <p className="text-haze mt-2">Access granted to the officer's secure information</p>
          </div>
          
          <div className="bg-emerald-950/50 border-4 border-emerald-500 rounded-lg p-10">
            <p className="text-haze text-sm mb-4 font-semibold">Officer's Birth Year (YYYY):</p>
            {revealed ? (
              <div className="space-y-4">
                <p className="text-6xl font-bold text-emerald-400 font-mono tracking-[0.5em]">
                  {year}
                </p>
                <div className="w-full h-1 bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 rounded-full"></div>
              </div>
            ) : (
              <button
                onClick={handleRevealKey}
                className="px-12 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-xl rounded-lg hover:from-emerald-700 hover:to-green-700 transition transform hover:scale-105 shadow-lg"
              >
                🔑 Unlock Entry
              </button>
            )}
          </div>

          {revealed && (
            <div className="space-y-6">
              <div className="bg-amber-900/40 border-2 border-amber-500/70 p-6 rounded-lg">
                <p className="text-amber-100 text-sm mb-3">Complete Officer's Date of Birth:</p>
                <p className="font-mono font-bold text-2xl text-amber-300 tracking-wider">
                  DD MM {year}
                </p>
                <p className="text-haze text-xs mt-4">Use this date to complete the Database Login</p>
              </div>
              
              <button
                onClick={() => navigate("/db-login")}
                className="w-full py-4 btn-investigate bg-emerald-600 hover:bg-emerald-700 font-semibold text-lg transition transform hover:scale-105"
              >
                ← Return to Database Login
              </button>
            </div>
          )}

          <p className="text-haze/50 text-xs border-t border-white/10 pt-6">
            Case ID: CIPHERVILLE_CASE_ANALYZED | Route Challenge Complete
          </p>
        </div>
      </div>
    </div>
  );
}
