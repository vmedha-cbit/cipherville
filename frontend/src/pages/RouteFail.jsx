import { useNavigate } from "react-router-dom";

export default function RouteFail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-black flex items-center justify-center px-6 overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 text-6xl animate-bounce opacity-20">😹</div>
        <div className="absolute top-1/3 right-1/4 text-5xl animate-pulse opacity-20">🤦</div>
        <div className="absolute bottom-1/4 left-1/3 text-6xl animate-bounce opacity-20" style={{ animationDelay: "0.5s" }}>🎭</div>
        <div className="absolute bottom-1/3 right-1/3 text-5xl animate-pulse opacity-20" style={{ animationDelay: "0.3s" }}>😂</div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-2xl">
        {/* Big Fooled Emoji */}
        <div className="text-9xl mb-6 animate-bounce">
          🤭
        </div>

        {/* Headline */}
        <h1 className="text-6xl font-black text-red-300 mb-4 drop-shadow-lg">
          OOPS!
        </h1>

        <div className="bg-red-600/30 border-4 border-red-400 rounded-2xl p-8 mb-8 backdrop-blur-sm">
          <p className="text-3xl font-bold text-white mb-4">
            Wrong Route! 🚫
          </p>
          <p className="text-xl text-red-100 mb-6">
            You've been led astray! This path doesn't have what you're looking for.
          </p>

          {/* Funny Messages */}
          <div className="space-y-3 mb-6">
            <p className="text-lg text-red-50">
              🎪 "This is not the droids you're looking for..." 🎪
            </p>
            <p className="text-lg text-red-50">
              💀 Better luck with the other routes! 💀
            </p>
          </div>

          {/* Emoji Celebration of Fooling */}
          <div className="flex justify-center gap-4 mb-6 text-4xl">
            <span>😏</span>
            <span>🤣</span>
            <span>😈</span>
            <span>🎉</span>
            <span>🤡</span>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="px-8 py-4 bg-amber-500 text-black font-bold text-lg rounded-lg hover:bg-amber-400 transition transform hover:scale-105 shadow-lg"
        >
          ← Go Back & Try Again
        </button>

        {/* Footer Message */}
        <p className="text-red-200 text-sm mt-8 italic">
          "Not all roads lead to Rome... some lead to dead ends!" 🛣️
        </p>
      </div>
    </div>
  );
}
