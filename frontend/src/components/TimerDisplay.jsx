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
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-xl animate-fadeIn p-6">
        <div className="absolute inset-0 z-0 opacity-20 fingerprint-bg mix-blend-overlay"></div>
        <div className="max-w-md w-full bg-card border-2 border-destructive p-10 rounded-xl shadow-[0_0_100px_rgba(239,68,68,0.5)] text-center relative overflow-hidden">
          {/* Decorative scanner line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-destructive animate-[scan_2s_linear_infinite]"></div>
          
          <div className="text-6xl mb-6 animate-pulse">⏰</div>
          <h1 className="text-5xl font-bold text-destructive mb-2 tracking-widest font-mono">TERMINATED</h1>
          <div className="h-1 w-24 bg-destructive mx-auto mb-6"></div>
          
          <p className="text-destructive-foreground mb-8 leading-relaxed font-mono">
            INVESTIGATION WINDOW CLOSED.<br/>
            MISSION STATUS: <span className="font-bold">INCOMPLETE</span>
          </p>
          
          <button 
            onClick={handleLogout}
            className="w-full py-4 bg-destructive/10 border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 font-mono font-bold tracking-widest rounded uppercase shadow-lg shadow-destructive/20 relative overflow-hidden group"
          >
            <span className="relative z-10">ACKNOWLEDGE & LOGOUT</span>
            <div className="absolute inset-0 bg-destructive transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
          </button>
        </div>
      </div>
    );
  }

  // Don't show anything if not loaded yet to avoid "00:00:00" scare
  if (!isLoaded) {
    return (
      <div className="fixed top-6 right-6 z-50">
        <div className="px-6 py-3 rounded-lg font-mono text-xl font-bold bg-background/80 text-primary border border-primary/50 animate-pulse shadow-[0_0_15px_rgba(255,59,59,0.3)]">
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
        className={`px-6 py-3 rounded-lg font-mono text-xl font-bold border backdrop-blur-md transition-all duration-500 flex items-center gap-3 ${
          isRed 
            ? 'bg-destructive/20 text-destructive border-destructive shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse' 
            : 'bg-background/80 text-foreground border-primary/50 shadow-[0_0_15px_rgba(255,59,59,0.2)]'
        }`}
      >
        <span className={`w-2 h-2 rounded-full ${isRed ? 'bg-destructive' : 'bg-green-500 animate-pulse'}`}></span>
        {hours > 0 ? `${hours.toString().padStart(2, '0')}:` : ''}{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </div>
    </div>
  );
}
