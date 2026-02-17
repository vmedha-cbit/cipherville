import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/authContext.jsx";
import { useTimer } from "../providers/timerContext.jsx";

export default function TimerDisplay() {
  const { timeRemaining, isLoaded, isPanic, isExpired, gameStatus } = useTimer();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Time's Up Modal
  if (isLoaded && (isExpired || gameStatus === "timeout")) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md animate-fadeIn">
        <div className="evidence-card max-w-md w-full p-8 text-center border-red-500/50 shadow-[0_0_50px_rgba(220,38,38,0.5)]">
          <div className="text-6xl mb-4">⏰</div>
          <h2 className="text-4xl font-bold text-red-500 mb-4 font-mono tracking-widest">TIME'S UP</h2>
          <p className="text-haze text-lg mb-8 leading-relaxed">
            The investigation window has closed.<br/>
            Your progress has been recorded.
          </p>
          
          <button 
            onClick={handleLogout}
            className="w-full py-4 bg-red-900/40 border border-red-500/50 text-red-400 hover:bg-red-800/40 hover:text-white transition-all font-mono font-bold tracking-wider rounded uppercase"
          >
            End Session & Logout
          </button>
        </div>
      </div>
    );
  }

  // Don't show anything if not loaded yet to avoid "00:00:00" scare
  if (!isLoaded) {
    return (
      <div className="fixed top-6 right-6 z-50">
        <div className="px-6 py-3 rounded-lg font-mono text-xl font-bold bg-black/60 text-haze border border-white/20 animate-pulse">
          SYNCING...
        </div>
      </div>
    );
  }

  // If game hasn't started properly or status is weird, show waiting
  if (timeRemaining === 0 && !isExpired && gameStatus !== "timeout") {
     return null; 
  }

  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  const isRed = timeRemaining <= 300; // Last 5 mins

  return (
    <div className="fixed top-6 right-6 z-50">
      <div 
        className={`px-6 py-3 rounded-lg font-mono text-xl font-bold border backdrop-blur-sm transition-all duration-300 ${
          isRed 
            ? 'bg-red-900/80 text-red-100 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse' 
            : 'bg-green-900/80 text-green-300 border-green-500/50 shadow-lg'
        }`}
      >
        {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </div>
    </div>
  );
}
