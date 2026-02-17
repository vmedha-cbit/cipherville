import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../providers/authContext.jsx";
import api from "../providers/api.js";

export default function ProtectedRoute({ children }) {
  const { session } = useAuth();
  const location = useLocation();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }
    api.get("/participants/progress")
      .then(({ data }) => {
        setProgress(data);
        setLoading(false);
      })
      .catch(() => {
        setProgress(null);
        setLoading(false);
      });
  }, [session, location.pathname]); // Re-fetch when path changes

  if (!session) {
    return <Navigate to="/" replace />;
  }
  if (loading) {
    return null; // Show nothing while loading
  }
  if (progress?.completedAt) {
    return <Navigate to="/" replace />; // Game completed, go to login
  }
  
  // Allow navigation - don't block based on lastVisitedRoute
  // The backend progress tracks where the user has been
  return children;
}
