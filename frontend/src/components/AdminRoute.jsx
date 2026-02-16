import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("cipherville-admin-token");
  if (!token) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}
