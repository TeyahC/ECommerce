import { useState } from "react";
import { supabase } from "../supabase";

export default function Customer() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true); // toggle between login/register

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      let user;
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        user = data.user;
        alert("Logged in!");
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        user = data.user;
        alert("Registered! Please confirm your email.");
      }
      setEmail("");
      setPassword("");
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="page-wrapper">
      <h1>{isLogin ? "Customer Login" : "Register"}</h1>
      <form onSubmit={handleSubmit} className="admin-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isLogin ? "Login" : "Register"}</button>
      </form>
      <p style={{ marginTop: "1rem" }}>
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
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
