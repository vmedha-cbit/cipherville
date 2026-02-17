import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./authContext.jsx";
import api from "./api.js";

const TimerContext = createContext();

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within TimerProvider");
  }
  return context;
};

export const TimerProvider = ({ children }) => {
  const { session } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerDuration, setTimerDuration] = useState(1800);
  const [gameStartedAt, setGameStartedAt] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [gameStatus, setGameStatus] = useState("playing"); // playing, completed, timeout
  const [isPaused, setIsPaused] = useState(false);

  // Load timer on session change
  useEffect(() => {
    if (!session?.userId || !session?.sessionToken) {
      setTimeRemaining(0);
      setGameStartedAt(null);
      setIsExpired(false);
      setGameStatus("playing");
      setIsLoaded(true);
      return;
    }

    // Small delay to ensure headers are attached
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/participants/game/status`);
        
        if (data.startTime) {
          const startTime = new Date(data.startTime);
          setGameStartedAt(startTime);
          setTimerDuration(data.duration || 1800);
          setGameStatus(data.status || "started");
          
          const remaining = Math.max(0, data.timeRemaining || 0);
          setTimeRemaining(remaining);
          
          if (data.isExpired) {
            setIsExpired(true);
          }
        }
        setIsLoaded(true);
      } catch (err) {
        console.error("Timer load error:", err);
        setIsLoaded(true);
      }
    }, 100); // Wait 100ms for headers to attach

    return () => clearTimeout(timer);
  }, [session?.userId, session?.sessionToken]);

  // Countdown timer with periodic server sync
  useEffect(() => {
    if (!gameStartedAt || !session?.userId || !session?.sessionToken) return;
    
    if (gameStatus === "completed" || gameStatus === "timeout" || isExpired || isPaused) {
      return;
    }

    const countDown = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now - gameStartedAt) / 1000);
      const remaining = Math.max(0, timerDuration - elapsed);

      setTimeRemaining(remaining);

      if (remaining === 0) {
        setIsExpired(true);
        setGameStatus("timeout");
        clearInterval(countDown);
      }
    }, 1000);

    // Initial calculation
    const now = new Date();
    const elapsed = Math.floor((now - gameStartedAt) / 1000);
    const remaining = Math.max(0, timerDuration - elapsed);
    setTimeRemaining(remaining);

    // Sync with server every 5 seconds to detect desync or completion
    const syncInterval = setInterval(async () => {
      try {
        const { data } = await api.get(`/participants/game/status`);
        if (data.startTime) {
          const serverStartTime = new Date(data.startTime);
          setGameStartedAt(serverStartTime);
          setGameStatus(data.status || "started");
          if (data.isExpired) {
            setIsExpired(true);
          }
        }
      } catch (err) {
        console.error("Sync error:", err);
      }
    }, 5000);

    return () => {
      clearInterval(countDown);
      clearInterval(syncInterval);
    };
  }, [gameStartedAt, timerDuration, gameStatus, isExpired, isPaused, session?.userId, session?.sessionToken]);

  const value = {
    timeRemaining,
    timerDuration,
    gameStartedAt,
    isExpired,
    isLoaded,
    gameStatus,
    isPanic: timeRemaining > 0 && timeRemaining <= 300,
    getElapsedTime: useCallback(() => {
      if (!gameStartedAt) return 0;
      return Math.floor((new Date() - gameStartedAt) / 1000);
    }, [gameStartedAt]),
    pauseTimer: () => setIsPaused(true),
    resumeTimer: () => setIsPaused(false),
    isPaused
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};
