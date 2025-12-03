import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const adminEmail = "teyahc@hotmail.com";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading...</p>;

  if (!user || user.email !== adminEmail) {
    return <Navigate to="/login" />;
  }

  return children;
}
