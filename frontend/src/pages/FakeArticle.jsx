export default function FakeArticle() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-6">
      <div className="text-center">
        {/* Error Animation Container */}
        <div className="bg-red-500/10 border-4 border-red-500/50 rounded-2xl p-12 backdrop-blur-sm shadow-2xl animate-pulse">
          {/* Emoji */}
          <div className="text-9xl mb-6 animate-bounce">
            🫵
          </div>
          
          {/* Error Message */}
          <h1 className="text-5xl font-bold text-red-500 mb-4">
            WRONG QR CODE!
          </h1>
          
          <p className="text-3xl font-semibold text-white">
            You got the wrong one brooo!
          </p>
          
          {/* Decorative Elements */}
          <div className="mt-8 flex justify-center gap-4">
            <span className="text-4xl">❌</span>
            <span className="text-4xl">🚫</span>
            <span className="text-4xl">⛔</span>
          </div>
          
          {/* Error Code */}
          <div className="mt-8 text-red-400/60 font-mono text-sm">
            ERROR CODE: QR_INVALID_001
          </div>
        </div>
        
        {/* Hint Text */}
        <p className="mt-8 text-gray-400 text-lg">
          Try scanning a different QR code...
        </p>
      </div>
    </div>
  );
}
