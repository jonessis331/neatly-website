// src/App.tsx - Production-grade navigation and authentication
import React, { useState, useEffect, useRef, useCallback } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import {
  Box,
  CircularProgress,
  Typography,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Fade,
  Backdrop,
} from "@mui/material";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
  },
  typography: {
    fontFamily:
      '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
  },
});

const LoadingScreen: React.FC<{ message?: string }> = ({
  message = "Loading...",
}) => (
  <Backdrop open sx={{ zIndex: 9999, bgcolor: "background.default" }}>
    <Fade in>
      <Box sx={{ textAlign: "center" }}>
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h6" color="text.secondary">
          {message}
        </Typography>
      </Box>
    </Fade>
  </Backdrop>
);

// Router implementation - production-grade
type Route = "landing" | "dashboard";

interface RouterState {
  current: Route;
  history: Route[];
  transitioning: boolean;
}

const AppContent: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [router, setRouter] = useState<RouterState>({
    current: "landing",
    history: ["landing"],
    transitioning: false,
  });

  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const mountedRef = useRef(true);
  const navigationLockRef = useRef(false);

  // Initialize route from URL
  useEffect(() => {
    const path = window.location.pathname;
    const initialRoute: Route = path === "/dashboard" ? "dashboard" : "landing";

    setRouter({
      current: initialRoute,
      history: [initialRoute],
      transitioning: false,
    });

    // Replace state without triggering popstate
    window.history.replaceState(
      { route: initialRoute },
      "",
      `/${initialRoute === "landing" ? "" : initialRoute}`
    );
  }, []);

  // Navigation handler with proper state management
  const navigate = useCallback(
    (route: Route, options: { replace?: boolean } = {}) => {
      if (!mountedRef.current || navigationLockRef.current) return;

      navigationLockRef.current = true;

      setRouter((prev) => {
        if (prev.current === route) {
          navigationLockRef.current = false;
          return prev;
        }

        const newHistory = options.replace
          ? [...prev.history.slice(0, -1), route]
          : [...prev.history, route];

        // Update URL
        const path = route === "landing" ? "/" : `/${route}`;
        if (options.replace) {
          window.history.replaceState({ route }, "", path);
        } else {
          window.history.pushState({ route }, "", path);
        }

        return {
          current: route,
          history: newHistory,
          transitioning: true,
        };
      });

      // Complete transition
      setTimeout(() => {
        if (mountedRef.current) {
          setRouter((prev) => ({ ...prev, transitioning: false }));
          navigationLockRef.current = false;
        }
      }, 300);
    },
    []
  );

  const goBack = useCallback(() => {
    if (router.history.length > 1) {
      window.history.back();
    } else {
      navigate("landing");
    }
  }, [router.history, navigate]);

  // Handle browser navigation
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const state = e.state as { route?: Route };
      if (state?.route && mountedRef.current && !navigationLockRef.current) {
        setRouter((prev) => ({
          current: state.route!,
          history: prev.history.slice(0, -1),
          transitioning: true,
        }));

        setTimeout(() => {
          if (mountedRef.current) {
            setRouter((prev) => ({ ...prev, transitioning: false }));
          }
        }, 300);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Auth state change handler - fixed to prevent infinite loops
  useEffect(() => {
    // Skip if still loading
    if (authLoading) return;

    if (!initialLoadComplete) {
      setInitialLoadComplete(true);

      // Only auto-navigate on initial load if user exists and we're on landing
      if (user && router.current === "landing") {
        const urlParams = new URLSearchParams(window.location.search);
        // Don't auto-navigate if coming from a specific action (like signup)
        if (!urlParams.get("action")) {
          navigate("dashboard", { replace: true });
        }
      }
    } else {
      // Handle logout - navigate to landing if on dashboard without user
      if (!user && router.current === "dashboard") {
        navigate("landing", { replace: true });
      }
    }
  }, [user, authLoading, router.current, navigate, initialLoadComplete]);

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Show loading only during initial auth check
  if (!initialLoadComplete) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoadingScreen message="Authenticating..." />
      </ThemeProvider>
    );
  }

  // Route rendering with transitions
  const renderRoute = () => {
    switch (router.current) {
      case "dashboard":
        // Protect dashboard route
        if (!user) {
          return null;
        }
        return (
          <Dashboard
            onNavigateToLanding={() => navigate("landing")}
            onGoBack={goBack}
            canGoBack={router.history.length > 1}
            currentView={router.current}
          />
        );

      case "landing":
      default:
        return (
          <LandingPage
            onNavigateToDashboard={() => navigate("dashboard")}
            currentView={router.current}
          />
        );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", position: "relative" }}>
        <Fade in={!router.transitioning} timeout={300}>
          <Box sx={{ minHeight: "100vh" }}>{renderRoute()}</Box>
        </Fade>
      </Box>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  // Development helper - clear stale auth state
  useEffect(() => {
    if (import.meta.env.DEV) {
      // Check for stale auth state
      const checkAuthState = async () => {
        const storedSession = localStorage.getItem("supabase.auth.token");
        if (storedSession) {
          try {
            const parsed = JSON.parse(storedSession);
            const expiresAt = parsed.expires_at;
            if (expiresAt && new Date(expiresAt * 1000) < new Date()) {
              console.log("🧹 Clearing expired auth state");
              localStorage.removeItem("supabase.auth.token");
              sessionStorage.clear();
            }
          } catch (e) {
            console.error("Error checking auth state:", e);
          }
        }
      };
      checkAuthState();
    }
  }, []);

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
