import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../providers/api.js";

export default function CaseSubmit() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const { data } = await api.post("/participants/submit-case", {});
      
      if (!data.ok) {
        // Submission failed - show error and end game
        setError(data.message || "You couldn't solve the case");
        
        // Try to end game and go back
        try {
          await api.post("/participants/end-game", { reason: "failed" });
        } catch (err) {
          console.error("Failed to end game:", err);
        }
        
        // Redirect to login after showing error
        setTimeout(() => {
          navigate("/");
        }, 3000);
        return;
      }
      
      // Submission successful
      // Mark user as completed
      await api.post("/participants/progress/update", {
        currentPhase: 3,
        currentSubphase: 1,
        lastVisitedRoute: "/complete"
      });
      
      // End game with completed status
      try {
        await api.post("/participants/end-game", { reason: "completed" });
      } catch (err) {
        console.error("Failed to end game:", err);
      }
      
      navigate("/complete");
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Failed to submit case";
      setError(errorMsg);
      setIsSubmitting(false);
      
      // If submission failed, end game
      try {
        await api.post("/participants/end-game", { reason: "failed" });
      } catch (endErr) {
        console.error("Failed to end game:", endErr);
      }
      
      // Redirect to login after showing error
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="film-grain" />
      <div className="min-h-screen flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-lg evidence-card p-8 text-center">
          {error ? (
            <>
              <div className="mb-6 text-6xl">⚠️</div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent mb-4">
                Submission Failed
              </h2>
              <p className="text-lg text-red-300 mb-6 font-semibold">
                You couldn't solve the case
              </p>
              <p className="text-haze mb-6">
                {error}
              </p>
              <p className="text-sm text-haze">
                Redirecting to login in 3 seconds...
              </p>
            </>
          ) : (
            <>
              <div className="mb-6 text-6xl animate-bounce">✓</div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 bg-clip-text text-transparent mb-4">
                Investigation Complete
              </h2>
              <p className="text-lg text-haze mb-6">
                You've successfully completed Phase 2. Your investigation is now ready for final review.
              </p>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-investigate w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Proceed to Completion"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
