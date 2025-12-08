import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [localUser, setLocalUser] = useState(null);

  const navigate = useNavigate();

  // Auth context (real logged-in user + role)
  const { user: authUser, role: authRole } = useAuth();

  // --- Test Supabase auth on mount ---
  useEffect(() => {
    async function testConnection() {
      try {
        const { data, error } = await supabase.auth.getUser();
        console.log("[Supabase Test] getUser:", { data, error });
        if (data?.user) setLocalUser(data.user);
      } catch (err) {
        console.error("[Supabase Test] Error:", err);
      }
    }
    testConnection();
  }, []);

  // --- Redirect when auth context updates ---
  useEffect(() => {
    if (authUser && authRole) {
      console.log("[AUTH CONTEXT UPDATED]", authUser.email, authRole);
      if (authRole === "admin") navigate("/admin");
      else navigate("/customer");
    }
  }, [authUser, authRole]);

  // --- Fetch user role & redirect ---
  const redirectBasedOnRole = async (userId) => {
    try {
      console.log("[Redirect] Fetching role for:", userId);

      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) throw error;

      console.log("[Redirect] Role:", data.role);

      if (data.role === "admin") navigate("/admin");
      else navigate("/customer");
    } catch (err) {
      console.error("[Redirect] Error:", err);
      navigate("/customer"); // fallback
    }
  };

  // --- LOGIN OR REGISTER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    console.log("[HANDLE SUBMIT]", isLogin ? "Login" : "Register", email);

    try {
      let currentUser;

      if (isLogin) {
        // ----------------------------
        // LOGIN
        // ----------------------------
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        console.log("[LOGIN] Data:", data, "Error:", error);

        if (error) throw error;
        currentUser = data.user;
      } else {
        // ----------------------------
        // REGISTER
        // ----------------------------
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        console.log("[SIGNUP] Data:", data, "Error:", error);

        if (error) throw error;

        // If the signUp flow requires email confirmation, Supabase will
        // return no session for the new user. In that case we should not
        // attempt to upsert to the `users` table from the client (RLS will
        // block it) — instruct the user to confirm their email instead.
        if (!data?.session) {
          setErrorMsg(
            "Registration created — please check your email to confirm your account before logging in."
          );
          setLoading(false);
          return;
        }

        // We have an active session, proceed to insert the user profile row
        currentUser = data.user;

        console.log("[SIGNUP] Upserting into users table...");

        const { error: upsertError } = await supabase.from("users").upsert([
          {
            id: currentUser.id,
            email: currentUser.email ?? email,
            role: "customer",
          },
        ]);

        if (upsertError) throw upsertError;
        console.log("[SIGNUP] User role saved to DB");

        // Auto-login after register (should already be logged in if session exists)
        const { data: loginData, error: loginError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (loginError) throw loginError;

        currentUser = loginData.user;
      }

      if (!currentUser) throw new Error("No user returned from Supabase");

      setLocalUser(currentUser);

      // Fetch user role
      const { data: userData, error: roleError } = await supabase
        .from("users")
        .select("role")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (roleError) throw roleError;

      const role = userData?.role || "customer";
      console.log("[ROLE]", role);

      // Redirect
      if (role === "admin") navigate("/admin");
      else navigate("/customer");

      // Clear fields
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("[HANDLE SUBMIT ERROR]", err);
      setErrorMsg(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGOUT ---
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      console.log("[LOGOUT] User signed out");

      setLocalUser(null);
      navigate("/login");
    } catch (err) {
      console.error("[LOGOUT ERROR]", err);
    }
  };

  // --- If user is logged in, show welcome + logout ---
  if (localUser) {
    return (
      <div className="page-wrapper">
        <h2>Welcome, {localUser.email}</h2>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            marginTop: "1rem",
            background: "#eee",
            border: "1px solid #ccc",
            padding: "0.5rem 1rem",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  // --- LOGIN / REGISTER FORM ---
  return (
    <div className="page-wrapper">
      <h2>{isLogin ? "Login" : "Register"}</h2>

      <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          autoComplete="off"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          autoComplete="new-password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : isLogin ? "Login" : "Register"}
        </button>
      </form>

      {errorMsg && (
        <div style={{ color: "#b00020", marginTop: "1rem" }}>{errorMsg}</div>
      )}

      <p style={{ marginTop: "1rem" }}>
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          style={{
            background: "none",
            border: "none",
            color: "#f45b69",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {isLogin ? "Register" : "Login"}
        </button>
      </p>
    </div>
  );
}
