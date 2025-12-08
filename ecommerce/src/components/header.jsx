import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/styles.css";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Header() {
  const [loginOpen, setLoginOpen] = useState(false);
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();

      // Force the auth state to refresh & redirect user
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="site-header">
      <div className="logo">
        <h1>My E-Commerce Store</h1>
      </div>

      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/cart">Cart</Link>

        {role === "admin" && <Link to="/admin">Admin Home</Link>}

        {user ? (
          <button
            onClick={handleLogout}
            style={{
              background: "var(--bubblegum-pink)",
              color: "white",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "5px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        ) : (
          <div
            className="login-dropdown"
            onMouseEnter={() => setLoginOpen(true)}
            onMouseLeave={() => setLoginOpen(false)}
          >
            <span className="login-link">Login ▼</span>
            {loginOpen && (
              <div className="dropdown-menu">
                <Link to="/login">Login / Register</Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
