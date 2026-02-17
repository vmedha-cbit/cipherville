import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { attachSession } from "./api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (session?.userId && session?.sessionToken) {
      attachSession(session.userId, session.sessionToken);
    }
  }, [session]);

  // New login function for backend-driven session
  const login = async (rollNo, displayName) => {
    const { data } = await api.post("/auth/participant-login", { rollNo, displayName });
    // Attach session headers IMMEDIATELY before setting state
    attachSession(data.userId, data.sessionToken);
    // Then store both userId and sessionToken
    setSession({ userId: data.userId, sessionToken: data.sessionToken });
    return data;
  };

  const logout = async () => {
    if (session) {
      await api.post("/auth/participant-logout");
    }
    setSession(null);
  };

  const updateSession = (patch) => {
    // Update session state only - NO localStorage
    const next = { ...session, ...patch };
    setSession(next);
  };

  const value = useMemo(() => ({ session, login, logout, updateSession }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
