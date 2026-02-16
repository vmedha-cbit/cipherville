import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function YearReveal() {
  const navigate = useNavigate();
  const location = useLocation();
  const [revealed, setRevealed] = useState(false);
  
  // Get year from route challenge state or use default
  const year = location.state?.year || "1995";

  const handleRevealKey = () => {
    setRevealed(true);
    // Signal to Phase1 page that year has been revealed
    localStorage.setItem("phase1YearRevealed", "true");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-black flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🔓 Secure Key Revealed</h2>
        
        <div className="bg-emerald-50 border-2 border-emerald-400 p-6 rounded-lg mb-6">
          <p className="text-gray-600 text-sm mb-2">Officer's Birth Year (YYYY):</p>
          {revealed ? (
            <p className="text-4xl font-bold text-emerald-600 font-mono tracking-widest">
              {year}
            </p>
          ) : (
            <button
              onClick={handleRevealKey}
              className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition transform hover:scale-105"
            >
              🔑 Get Key
            </button>
          )}
        </div>

        {revealed && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-300 p-4 rounded">
              <p className="text-gray-700 text-sm">
                You have collected all parts of the date: <br/>
                <span className="font-mono font-bold text-lg">DD MM {year}</span>
              </p>
            </div>
            
            <button
              onClick={() => navigate("/db-login")}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              ← Return to Database Login
            </button>
          </div>
        )}

        <p className="text-gray-500 text-xs mt-6">
          Case ID: CIPHERVILLE_CASE_SOLVED
        </p>
      </div>
    </div>
  );
}
