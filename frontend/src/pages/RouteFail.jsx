import { useNavigate, useLocation } from "react-router-dom";

export default function RouteFail() {
  const navigate = useNavigate();
  const location = useLocation();
  const reason = location.state?.reason || "wrong-route";
  const routeId = location.state?.routeId || "Unknown";

  const isWrongAnswer = reason === "wrong-answer";

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="film-grain" />
      <div className="min-h-screen px-6 py-10 flex items-center justify-center">
        <div className="max-w-2xl w-full evidence-card p-10 text-center space-y-8">
          {/* Large Error Emoji */}
          <div className="text-9xl animate-bounce">
            {isWrongAnswer ? "❌" : "⚠️"}
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
            {isWrongAnswer ? "WRONG ANSWER!" : "WRONG ROUTE!"}
          </h1>

          {/* Message */}
          <div className="bg-red-900/40 border-2 border-red-500/70 rounded-lg p-8 space-y-4">
            {isWrongAnswer ? (
              <>
                <p className="text-2xl font-bold text-red-300 mb-2">
                  ❌ Access Denied
                </p>
                <p className="text-lg text-red-100 mb-6">
                  The unscrambled word you entered is incorrect. Route {routeId} remains locked.
                </p>
                <div className="space-y-3 bg-black/50 p-4 rounded">
                  <p className="text-amber-300 text-sm">
                    💡 Go back to Phase 1 and carefully unscramble the jumbled word.
                  </p>
                  <p className="text-amber-300 text-sm">
                    🔄 Try this route again with the correct answer, or explore other routes.
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-red-300 mb-2">
                  ❌ Dead End Detected
                </p>
                <p className="text-lg text-red-100 mb-6">
                  This route doesn't contain the officer's birth year. You've been led astray!
                </p>
                <div className="space-y-3 bg-black/50 p-4 rounded">
                  <p className="text-amber-300 text-sm">
                    💡 The correct route holds the key to the officer's birth year.
                  </p>
                  <p className="text-amber-300 text-sm">
                    🔄 Go back to Phase 1 and try a different route.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="w-full py-4 btn-investigate bg-amber-600 hover:bg-amber-700 font-semibold text-lg transition transform hover:scale-105"
          >
            ← Go Back & Try Another Route
          </button>

          {/* Footer Message */}
          <p className="text-haze/60 text-sm border-t border-white/10 pt-6">
            Case Status: Route Investigation Failed | Route {routeId} returned to Phase 1
          </p>
        </div>
      </div>
    </div>
  );
}

