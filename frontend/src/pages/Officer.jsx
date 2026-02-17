import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../providers/api.js";
import { useTimer } from "../providers/timerContext.jsx";

export default function Officer() {
  const navigate = useNavigate();
  const { timeRemaining, gameStartedAt } = useTimer();
  const [officer, setOfficer] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  // Format time as HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Load officer data on mount
  useEffect(() => {
    const loadOfficer = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.post("/participants/assign-officer");
        setOfficer(data.officer);
        setError("");

        // Update progress after loading officer
        await api.post("/participants/progress/update", {
          currentPhase: 1,
          currentSubphase: 1,
          lastVisitedRoute: "/officer"
        });
      } catch (err) {
        console.error("Failed to load officer:", err);
        setError(err.response?.data?.error || "Failed to load officer");
        setOfficer(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadOfficer();
  }, []);

  // Handle navigation to Database Login
  const handleBeginInvestigation = async () => {
    if (isNavigating) return; // Prevent double-click
    
    try {
      setIsNavigating(true);
      console.log("Updating progress for db-login...");
      
      // Update backend progress FIRST
      await api.post("/participants/progress/update", {
        currentPhase: 1,
        currentSubphase: 0,
        lastVisitedRoute: "/db-login"
      });
      
      console.log("Progress updated - navigating to db-login");
      // Then navigate
      navigate("/db-login", { replace: true });
    } catch (err) {
      console.error("Navigation error:", err);
      setError("Failed to proceed. Please try again.");
      setIsNavigating(false);
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

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-6 py-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Loading State */}
          {isLoading && !officer && (
            <div className="evidence-card p-10">
              <p className="text-haze">Loading case information...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="evidence-card p-10 border-2 border-ember/50 bg-ember/10">
              <p className="text-ember mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-ember/50 hover:bg-ember text-white rounded transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* Officer Welcome Card */}
          {officer && !isLoading && (
            <div className="space-y-8">
              <div className="evidence-card p-10">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent mb-6">
                  Welcome to Cipherville!
                </h1>
                <p className="text-lg text-haze mb-4 italic">The case is awaiting your presence...</p>
                
                {/* Officer Story */}
                <div className="bg-ink/50 p-8 rounded-lg border border-amber-500/30 my-8">
                  <h2 className="text-2xl font-semibold text-white mb-4">This is what happened:</h2>
                  <p className="text-haze leading-relaxed text-lg">
                    <strong>{officer.name}</strong> is a dedicated investigation officer who was working on this case, 
                    and since the last 10 days the officer is missing. Now we want you to solve this case.
                  </p>
                  <p className="text-amber-500 font-semibold mt-4 text-xl">
                    Go ahead and become victorious!
                  </p>
                </div>

                {/* Begin Investigation Button */}
                <button
                  type="button"
                  onClick={handleBeginInvestigation}
                  disabled={isNavigating}
                  className={`btn-investigate px-8 py-4 transition-all ${
                    isNavigating ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                  }`}
                  aria-label="Begin Investigation"
                >
                  {isNavigating ? "Loading..." : "Begin Investigation"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
