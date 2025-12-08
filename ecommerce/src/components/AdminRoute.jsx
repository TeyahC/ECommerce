import { useAuth } from "../contexts/AuthContext.jsx";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const { user, role, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" />;
  if (role !== "admin") return <Navigate to="/login" />;

  return children;
}
