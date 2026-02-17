import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { attachSession } from "./api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("cipherville-session");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.userId && parsed?.sessionToken) {
          setSession(parsed);
          attachSession(parsed.userId, parsed.sessionToken);
        }
      } catch (e) {
        console.error("Failed to parse session", e);
        localStorage.removeItem("cipherville-session");
      }
    }
    setLoading(false);
  }, []);

  // Sync session changes to localStorage
  useEffect(() => {
    if (session?.userId && session?.sessionToken) {
      localStorage.setItem("cipherville-session", JSON.stringify(session));
      attachSession(session.userId, session.sessionToken);
    } else if (!loading) {
      // Only clear if we've finished loading (avoid clearing on initial render if null)
      localStorage.removeItem("cipherville-session");
    }
  }, [session, loading]);

  const login = async (rollNo, displayName) => {
    const { data } = await api.post("/auth/participant-login", { rollNo, displayName });
    // Attach session headers IMMEDIATELY before setting state
    attachSession(data.userId, data.sessionToken);
    
    const newSession = { 
      userId: data.userId, 
      sessionToken: data.sessionToken,
      rollNo,
      displayName
    };
    
    setSession(newSession);
    return data;
  };

  const logout = async () => {
    if (session) {
      try {
        await api.post("/auth/participant-logout");
      } catch (e) {
        console.error("Logout failed", e);
      }
    }
    setSession(null);
    localStorage.removeItem("cipherville-session");
  };

  const updateSession = (patch) => {
    setSession(prev => prev ? { ...prev, ...patch } : null);
  };

  const value = useMemo(() => ({ session, login, logout, updateSession, loading }), [session, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
