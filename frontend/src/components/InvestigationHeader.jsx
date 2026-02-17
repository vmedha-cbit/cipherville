export default function InvestigationHeader() {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-black via-steel to-black border-b border-amber-500/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent">
            CIPHERVILLE
          </h1>
          <p className="text-xs text-haze mt-0.5">Central Investigation Database</p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-haze font-mono">SYSTEM ONLINE</span>
        </div>
      </div>
    </div>
  );
}
