import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/authContext.jsx";

export default function ProtectedRoute({ children }) {
  const { session } = useAuth();
  if (!session) {
    return <Navigate to="/" replace />;
  }
  return children;
}
