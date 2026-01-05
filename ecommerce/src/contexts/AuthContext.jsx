import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [lastSeen, setLastSeen] = useState(null);
  const [visibleAt, setVisibleAt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    // timers used by init and the auth listener
    let _clearTimer = null;
    let _loadTimer = null;
    // inactivity logout timer
    let _logoutTimer = null;
    const LOGOUT_MS = 30 * 60 * 1000; // 30 minutes
    // when the page is hidden, suspend processing auth events
    let suspended = false;

    // restore lastSeen from sessionStorage so a full page reload still
    // treats the user as recently seen for a short window.
    try {
      const saved = sessionStorage.getItem("auth:lastSeen");
      if (saved) {
        const ts = Number(saved);
        if (!Number.isNaN(ts)) setLastSeen(ts);
      }
    } catch (e) {}

    const init = async () => {
      let foundUser = null;
      try {
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        foundUser = data?.user ?? null;
        console.debug("[AuthContext:init] getUser ->", !!foundUser);
        setUser(foundUser);
        if (foundUser) {
          const ts = Date.now();
          setLastSeen(ts);
          try {
            sessionStorage.setItem("auth:lastSeen", String(ts));
          } catch (e) {}
          // start/reset inactivity timer when we detect a user on init
          try {
            clearTimeout(_logoutTimer);
          } catch (e) {}
          _logoutTimer = setTimeout(() => {
            if (!mounted) return;
            console.debug(
              "[AuthContext] inactivity timeout reached — signing out"
            );
            supabase.auth.signOut();
            setUser(null);
            setRole(null);
            setLastSeen(null);
            try {
              sessionStorage.removeItem("auth:lastSeen");
            } catch (e) {}
          }, LOGOUT_MS);
        }
      } catch (e) {
        if (mounted) setUser(null);
      } finally {
        if (!mounted) return;

        // If we found a user, clear loading immediately.
        // If not, start a short grace period during which onAuthStateChange
        // may provide the session; after the grace period, mark loading false.
        if (foundUser) {
          console.debug("[AuthContext:init] user found, clear loading");
          setLoading(false);
        } else {
          console.debug("[AuthContext:init] no user, starting load grace");
          _loadTimer = setTimeout(() => {
            if (!mounted) return;
            console.debug(
              "[AuthContext:init] load grace ended, setting loading=false"
            );
            setLoading(false);
            _loadTimer = null;
          }, 900);
        }
      }
    };

    // Debounced auth change handler and initial load coordination.
    // We'll use two timers described above.
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      console.debug("[AuthContext:onAuth] event fired — session?", !!session);
      try {
        window.dispatchEvent(
          new CustomEvent("auth:event", {
            detail: "[onAuth] fired " + !!session,
          })
        );
      } catch (e) {}
      if (!mounted) return;
      if (suspended) {
        console.debug("[AuthContext:onAuth] suspended — ignoring auth event");
        return;
      }

      // cancel any pending clear
      if (_clearTimer) {
        clearTimeout(_clearTimer);
        _clearTimer = null;
      }

      if (session?.user) {
        console.debug("[AuthContext:onAuth] session present");
        try {
          window.dispatchEvent(
            new CustomEvent("auth:user", { detail: "setUser true" })
          );
        } catch (e) {}
        // session available: cancel any pending load timer and mark loaded
        if (_loadTimer) {
          clearTimeout(_loadTimer);
          _loadTimer = null;
        }
        setUser(session.user);
        console.debug("[AuthContext:onAuth] setUser ->", !!session.user);
        const ts = Date.now();
        setLastSeen(ts);
        try {
          sessionStorage.setItem("auth:lastSeen", String(ts));
        } catch (e) {}
        setLoading(false);
        // reset inactivity timer on any auth session event
        try {
          clearTimeout(_logoutTimer);
        } catch (e) {}
        _logoutTimer = setTimeout(() => {
          if (!mounted) return;
          console.debug(
            "[AuthContext] inactivity timeout reached — signing out"
          );
          supabase.auth.signOut();
          setUser(null);
          setRole(null);
          setLastSeen(null);
          try {
            sessionStorage.removeItem("auth:lastSeen");
          } catch (e) {}
        }, LOGOUT_MS);
      } else {
        console.debug("[AuthContext:onAuth] session null — scheduling clear");
        try {
          window.dispatchEvent(
            new CustomEvent("auth:user", {
              detail: "session null scheduled clear",
            })
          );
        } catch (e) {}
        // wait a short time before clearing user — prevents quick flaps
        _clearTimer = setTimeout(() => {
          if (!mounted) return;
          // Check persisted lastSeen and recent visibility to avoid clearing
          // user for brief transient auth null events (read from sessionStorage
          // to avoid stale closure values).
          try {
            const RECENT_MS = 30 * 60 * 1000; // 30 minutes
            const s = sessionStorage.getItem("auth:lastSeen");
            const v = sessionStorage.getItem("app:visibleAt");
            const last = s ? Number(s) : 0;
            const vis = v ? Number(v) : 0;
            const now = Date.now();
            const recentSeen =
              last && !Number.isNaN(last) && now - last < RECENT_MS;
            const recentVisible = vis && !Number.isNaN(vis) && now - vis < 5000; // 5s
            if (recentSeen || recentVisible) {
              console.debug(
                "[AuthContext:onAuth] skipping clear — recent activity detected",
                { recentSeen, recentVisible }
              );
              return;
            }
          } catch (e) {}

          setUser(null);
          console.debug("[AuthContext:onAuth] cleared user (timer)");
          try {
            window.dispatchEvent(
              new CustomEvent("auth:user", { detail: "cleared user" })
            );
          } catch (e) {}
          setLastSeen(null);
          try {
            sessionStorage.removeItem("auth:lastSeen");
          } catch (e) {}
        }, 700);
      }
    });

    init();

    // Pause auth processing while the document is hidden to avoid firing
    // auth handlers on every tab leave. When the page becomes visible again
    // we call init() to refresh the session state once.
    function handleVisibility() {
      if (document.hidden) {
        suspended = true;
        // clear any pending timers while hidden
        if (_clearTimer) {
          clearTimeout(_clearTimer);
          _clearTimer = null;
        }
        if (_loadTimer) {
          clearTimeout(_loadTimer);
          _loadTimer = null;
        }
        console.debug(
          "[AuthContext] visibility hidden — suspending auth updates"
        );
      } else {
        suspended = false;
        console.debug(
          "[AuthContext] visibility visible — resuming auth updates"
        );
        // record when the app became visible so other components (DebugOverlay / AdminRoute)
        // can use a short visibility grace window to avoid redirect flapping.
        try {
          const ts = Date.now();
          sessionStorage.setItem("app:visibleAt", String(ts));
          setVisibleAt(ts);
          try {
            window.dispatchEvent(
              new CustomEvent("auth:visibility", { detail: "visible " + ts })
            );
          } catch (e) {}
        } catch (e) {}
        // Do NOT call init() here to avoid forcing a getUser() check on every
        // tab return — we intentionally resume processing and let the
        // existing onAuthStateChange subscription handle any session events.
      }
    }

    // activity handler to reset inactivity sign-out timer
    function resetActivity() {
      try {
        const ts = Date.now();
        setLastSeen(ts);
        try {
          sessionStorage.setItem("auth:lastSeen", String(ts));
        } catch (e) {}
        // reset logout timer
        try {
          clearTimeout(_logoutTimer);
        } catch (e) {}
        _logoutTimer = setTimeout(() => {
          if (!mounted) return;
          console.debug(
            "[AuthContext] inactivity timeout reached — signing out"
          );
          supabase.auth.signOut();
          setUser(null);
          setRole(null);
          setLastSeen(null);
          try {
            sessionStorage.removeItem("auth:lastSeen");
          } catch (e) {}
        }, LOGOUT_MS);
      } catch (e) {}
    }

    document.addEventListener("visibilitychange", handleVisibility);
    // listen for user activity and reset inactivity timer
    window.addEventListener("mousemove", resetActivity);
    window.addEventListener("keydown", resetActivity);
    window.addEventListener("click", resetActivity);
    window.addEventListener("focus", resetActivity);

    // In init() we set loading=false in the finally block only after we
    // attempt getUser. If getUser returns no user, we allow a small grace
    // period for an imminent onAuthStateChange to provide the session.
    // Implement that by wrapping setLoading(false) in a timer when no user.
    // To do that we intercept the initial init above by delaying loading
    // flip when no user was found. (Modify init's finally below.)

    return () => {
      mounted = false;
      try {
        if (_clearTimer) {
          clearTimeout(_clearTimer);
          _clearTimer = null;
        }
        if (_loadTimer) {
          clearTimeout(_loadTimer);
          _loadTimer = null;
        }
        sub?.subscription?.unsubscribe();
        try {
          document.removeEventListener("visibilitychange", handleVisibility);
        } catch (e) {}
        try {
          window.removeEventListener("mousemove", resetActivity);
          window.removeEventListener("keydown", resetActivity);
          window.removeEventListener("click", resetActivity);
          window.removeEventListener("focus", resetActivity);
        } catch (e) {}
        try {
          clearTimeout(_logoutTimer);
          _logoutTimer = null;
        } catch (e) {}
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
      setLastSeen(null);
      try {
        sessionStorage.removeItem("auth:lastSeen");
      } catch (e) {}
    } catch (e) {
      console.error("[AuthContext] signOut error", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, role, loading, lastSeen, visibleAt, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
