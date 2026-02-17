import { useTimer } from "../providers/timerContext.jsx";
import { useAuth } from "../providers/authContext.jsx";
import { useLocation } from "react-router-dom";

export default function TimerDisplay() {
  const { timeRemaining, gameStartedAt, isExpired, isPanic, isLoaded, gameStatus } = useTimer();
  const { session } = useAuth();
  const location = useLocation();

  // Debug logging
  if (process.env.NODE_ENV === "development") {
    console.log("TimerDisplay Debug:", {
      isLoaded,
      gameStartedAt,
      sessionRollNumber: session?.rollNumber,
      pathname: location.pathname,
      timeRemaining,
    });
  }

  // Don't show for admins
  const adminToken = localStorage.getItem("cipherville-admin-token");
  if (adminToken) return null;

  // Don't show if not logged in
  if (!session?.rollNumber) return null;

  // Don't show on login page
  if (location.pathname === "/") return null;

  // Don't show if timer not loaded yet
  if (!isLoaded) return null;

  // Don't show before game starts
  if (!gameStartedAt) return null;
  
  // Don't show if game is completed (timer stopped)
  if (gameStatus === "completed") return null;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Determine styling
  let bgColor = "bg-blue-900/70";
  let borderColor = "border-blue-500";
  let textColor = "text-blue-300";
  let animation = "";

  if (isExpired) {
    bgColor = "bg-red-900/80";
    borderColor = "border-red-600";
    textColor = "text-red-300";
    animation = "animate-pulse";
  } else if (isPanic) {
    bgColor = "bg-yellow-900/80";
    borderColor = "border-yellow-500";
    textColor = "text-yellow-300";
    animation = "animate-pulse";
  }

  return (
    <div className={`fixed top-24 right-6 z-40 ${bgColor} border-2 ${borderColor} rounded-lg px-6 py-3 shadow-2xl ${animation}`}>
      <div className={`font-mono text-3xl font-bold ${textColor} text-center`}>
        ⏱ {formatted}
      </div>
      {isExpired && (
        <div className="text-red-200 text-xs text-center mt-1 font-semibold">TIME'S UP</div>
      )}
      {isPanic && !isExpired && (
        <div className="text-yellow-200 text-xs text-center mt-1 font-semibold">HURRY!</div>
      )}
    </div>
  );
}
