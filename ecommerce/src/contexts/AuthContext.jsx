import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        setUser(data?.user ?? null);
      } catch (e) {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    init();

    return () => {
      mounted = false;
      try {
        sub?.subscription?.unsubscribe();
      } catch (e) {}
    };
  }, []);

  // fetch role whenever user changes
  useEffect(() => {
    let mounted = true;
    const loadRole = async () => {
      setRole(null);
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        if (!mounted) return;
        if (error) {
          setRole(null);
        } else {
          setRole(data?.role ?? null);
        }
      } catch (e) {
        if (mounted) setRole(null);
      }
    };

    loadRole();

    return () => {
      mounted = false;
    };
  }, [user]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
    } catch (e) {
      console.error("[AuthContext] signOut error", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
