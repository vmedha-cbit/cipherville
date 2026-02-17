import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
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
  
  // Ref to track server time offset (Server Time - Local Time)
  const serverTimeOffset = useRef(0);

  // Define fetchTimer at component level
  const fetchTimer = useCallback(async () => {
    if (!session?.userId || !session?.sessionToken) return;

    try {
      const { data } = await api.get(`/participants/game/status`);
      
      if (data.serverTime) {
        const serverTime = new Date(data.serverTime).getTime();
        const localTime = Date.now();
        serverTimeOffset.current = serverTime - localTime;
      }

      if (data.startTime) {
        const startTime = new Date(data.startTime);
        setGameStartedAt(startTime);
        setTimerDuration(data.duration);
        setGameStatus(data.status || "started");
        
        if (data.isExpired) {
          setIsExpired(true);
          setTimeRemaining(0);
        } else {
          // Initial calc
          const now = Date.now() + serverTimeOffset.current;
          const elapsed = Math.floor((now - startTime.getTime()) / 1000);
          const currentDuration = data.duration; 
          if (!currentDuration) console.warn("Timer duration missing from backend!");
          const remaining = Math.max(0, (currentDuration || 1800) - elapsed);
          setTimeRemaining(remaining);
        }
      }
      setIsLoaded(true);
    } catch (err) {
      console.error("Timer load error:", err);
      setIsLoaded(true);
    }
  }, [session?.userId, session?.sessionToken]);

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

    fetchTimer();
  }, [session?.userId, session?.sessionToken, fetchTimer]);

  // Countdown timer
  useEffect(() => {
    if (!gameStartedAt || !session?.userId || !session?.sessionToken) return;
    
    if (gameStatus === "completed" || gameStatus === "timeout" || isExpired || isPaused) {
      return;
    }

    const updateTimer = () => {
      const now = Date.now() + serverTimeOffset.current;
      const startTime = new Date(gameStartedAt).getTime();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, timerDuration - elapsed);

      setTimeRemaining(remaining);

      if (remaining === 0) {
        setIsExpired(true);
        setGameStatus("timeout");
        // Notify backend about timeout
        api.post('/participants/end-game', { reason: 'timeout' }).catch(e => console.error("Timeout sync failed", e));
      }
    };

    // Update immediately
    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    // Sync with server every 10 seconds to correct drift
    const syncInterval = setInterval(async () => {
      if (document.hidden) return;
      await fetchTimer();
    }, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(syncInterval);
    };
  }, [gameStartedAt, timerDuration, gameStatus, isExpired, isPaused, session?.userId, session?.sessionToken, fetchTimer]);

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
      const now = Date.now() + serverTimeOffset.current;
      return Math.floor((now - new Date(gameStartedAt).getTime()) / 1000);
    }, [gameStartedAt]),
    pauseTimer: () => setIsPaused(true),
    resumeTimer: () => setIsPaused(false),
    refreshTimer: fetchTimer, // Exposed here
    isPaused
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};
