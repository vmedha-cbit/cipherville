import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { attachSession } from "./api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem("cipherville-session");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (session?.userId && session?.sessionToken) {
      attachSession(session.userId, session.sessionToken);
    }
  }, [session]);

  const login = async (rollNumber, displayName) => {
    const { data } = await api.post("/auth/participant-login", { rollNumber, displayName });
    const nextSession = {
      userId: data.userId,
      sessionToken: data.sessionToken,
      rollNumber: data.rollNumber
    };
    localStorage.setItem("cipherville-session", JSON.stringify(nextSession));
    setSession(nextSession);
  };

  const logout = async () => {
    if (session) {
      await api.post("/auth/participant-logout");
    }
    localStorage.removeItem("cipherville-session");
    setSession(null);
  };

  const updateSession = (patch) => {
    const next = { ...session, ...patch };
    localStorage.setItem("cipherville-session", JSON.stringify(next));
    setSession(next);
  };

  const value = useMemo(() => ({ session, login, logout, updateSession }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
