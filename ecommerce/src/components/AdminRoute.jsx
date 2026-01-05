import { useAuth } from "../contexts/AuthContext.jsx";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const { user, role, loading, lastSeen, visibleAt } = useAuth();

  // ✅ Don't redirect until loading is fully finished
  if (loading) {
    console.debug("[AdminRoute] loading...");
    return <p>Loading...</p>;
  }

  // If we have a user but role is not yet known, keep mounted and show overlay
  if (user && !role) {
    return (
      <div style={{ position: "relative" }}>
        {children}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255,255,255,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            fontSize: "1rem",
          }}
        >
          Checking session...
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (role !== "admin") return <Navigate to="/login" replace />;

  return children;
}
