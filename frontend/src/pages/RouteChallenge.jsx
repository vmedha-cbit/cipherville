import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function RouteChallenge() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isCorrectRoute = searchParams.get("isCorrect") === "true";
  const routeId = searchParams.get("routeId");
  const jumbledWord = searchParams.get("jumbled");
  const correctAnswer = searchParams.get("answer");
  const year = searchParams.get("year");

  const [userAnswer, setUserAnswer] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    
    // Verify if the answer matches the correct unscrambled word
    const normalizedUserAnswer = userAnswer.toLowerCase().trim();
    const normalizedCorrectAnswer = (correctAnswer || "").toLowerCase().trim();
    
    // The answer should match the correct unscrambled word (e.g., "STATION")
    const answerIsCorrect = normalizedUserAnswer === normalizedCorrectAnswer;

    if (answerIsCorrect && isCorrectRoute) {
      // Correct answer on correct route - show year reveal
      setTimeout(() => {
        navigate("/year-reveal", { state: { year } });
      }, 1500);
    } else {
      // Wrong answer OR correct answer but wrong route - dead end
      setTimeout(() => {
        navigate("/route-fail", { state: { routeId, reason: answerIsCorrect ? "wrong-route" : "wrong-answer" } });
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <form onSubmit={handleAnswerSubmit}>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Route {routeId}: Challenge</h2>
          <p className="text-gray-600 mb-6">Enter the unscrambled SQL word you discovered earlier</p>
          
          {/* Input for Answer - No jumbled word shown */}
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Enter your answer:
          </label>
          <input
            type="text"
            className="w-full p-4 border-2 border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900"
            placeholder="Type the unscrambled word..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            required
            disabled={submitted}
            autoFocus
          />

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="text-sm">⚠️ {error}</p>
            </div>
          )}

          {/* Success Message */}
          {submitted && !error && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p className="text-sm font-semibold">✓ Verifying... Please wait</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitted}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {submitted ? "Checking..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
