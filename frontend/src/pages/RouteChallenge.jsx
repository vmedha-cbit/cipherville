import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function RouteChallenge() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isCorrectRoute = searchParams.get("isCorrect") === "true";
  const routeId = searchParams.get("routeId");
  const correctAnswer = searchParams.get("answer");
  const year = searchParams.get("year");
  const jumbledWord = searchParams.get("jumbled");

  const [userAnswer, setUserAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    
    // Verify if the answer matches the correct unscrambled word
    const normalizedUserAnswer = userAnswer.toLowerCase().trim();
    const normalizedCorrectAnswer = (correctAnswer || "").toLowerCase().trim();
    
    // The answer should match the correct unscrambled word
    const isAnswerCorrect = normalizedUserAnswer === normalizedCorrectAnswer;

    if (!isAnswerCorrect) {
      setError("Incorrect answer. Try again.");
      setSubmitted(false);
      return;
    }

    // Correct answer - navigate immediately
    if (isCorrectRoute) {
      navigate("/year-reveal", { state: { year } });
    } else {
      navigate("/route-fail", { state: { routeId, reason: "wrong-route" } });
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="film-grain" />
      <div className="min-h-screen px-6 py-10 flex items-center justify-center">
        <div className="max-w-2xl w-full evidence-card p-8">
          <form onSubmit={handleAnswerSubmit} className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent mb-4">
                Route {routeId}: Secure Access
              </h2>
              <p className="text-haze mb-4">To access this route's information, unscramble the word:</p>
              
              <div className="inline-block bg-black/50 border border-amber-500/30 px-6 py-3 rounded mb-4">
                <span className="text-2xl font-mono tracking-[0.5em] text-amber-400 font-bold uppercase">
                    {jumbledWord}
                </span>
              </div>
            </div>

            {/* Answer Input */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-amber-400 text-center">
                Unscrambled Word:
              </label>
              <input
                type="text"
                className="w-full p-4 bg-ink/70 border-2 border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-ember focus:border-ember text-white placeholder-haze text-center text-2xl font-mono tracking-wider uppercase"
                placeholder="TYPE HERE..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value.toUpperCase())}
                required
                disabled={submitted}
                autoFocus
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/30 border border-red-500/50 text-red-300 p-4 rounded-lg text-center">
                <p className="text-sm font-semibold">❌ {error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitted}
              className="w-full py-3 btn-investigate bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition font-semibold text-lg"
            >
              {submitted ? "Verifying..." : "Submit Answer"}
            </button>
          </form>

          {/* Hint */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-haze text-sm text-center">
              💡 This is where the correct answer truly matters. Get it right to access the route's secrets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
