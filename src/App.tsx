// src/App.tsx - Updated with better navigation and auto-download
import React, { useState, useEffect, useRef, useCallback } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { ContactSupport } from "./components/pages/ContactSupport";
import { RefundPolicy } from "./components/legal/RefundPolicy";
import { TermsOfService } from "./components/legal/TermsOfService";
import { CancellationPolicy } from "./components/legal/CancellationPolicy";
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

// Enhanced router with all pages
type Route =
  | "landing"
  | "dashboard"
  | "contact-support"
  | "refund-policy"
  | "terms-of-service"
  | "cancellation-policy";

interface RouterState {
  current: Route;
  history: Route[];
  transitioning: boolean;
}

// Auto-download functionality
const detectOS = (): "mac" | "windows" | "unknown" => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes("mac")) return "mac";
  if (userAgent.includes("win")) return "windows";
  return "unknown";
};

const downloadApp = (os: "mac" | "windows") => {
  const downloadLinks = {
    mac: "/downloads/neatly-mac.dmg",
    windows: "/downloads/neatly-windows.exe",
  };

  // Create temporary link and trigger download
  const link = document.createElement("a");
  link.href = downloadLinks[os];
  link.download = `neatly-${os === "mac" ? "mac.dmg" : "windows.exe"}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const AppContent: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [router, setRouter] = useState<RouterState>({
    current: "landing",
    history: ["landing"],
    transitioning: false,
  });

  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [hasAutoDownloaded, setHasAutoDownloaded] = useState(false);
  const mountedRef = useRef(true);
  const navigationLockRef = useRef(false);

  // Initialize route from URL
  useEffect(() => {
    const path = window.location.pathname;
    let initialRoute: Route = "landing";

    // Map paths to routes
    const pathRouteMap: Record<string, Route> = {
      "/": "landing",
      "/dashboard": "dashboard",
      "/contact-support": "contact-support",
      "/refund-policy": "refund-policy",
      "/terms-of-service": "terms-of-service",
      "/cancellation-policy": "cancellation-policy",
    };

    initialRoute = pathRouteMap[path] || "landing";

    setRouter({
      current: initialRoute,
      history: [initialRoute],
      transitioning: false,
    });

    // Replace state without triggering popstate
    window.history.replaceState({ route: initialRoute }, "", path);
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

        // Update URL - map routes to paths
        const routePathMap: Record<Route, string> = {
          landing: "/",
          dashboard: "/dashboard",
          "contact-support": "/contact-support",
          "refund-policy": "/refund-policy",
          "terms-of-service": "/terms-of-service",
          "cancellation-policy": "/cancellation-policy",
        };

        const path = routePathMap[route];
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

  // Remove auto-download functionality - now handled after payment
  // Auto-download removed - now triggered after trial signup with payment info

  // Auth state change handler - Auto-redirect to dashboard on sign-in
  useEffect(() => {
    if (authLoading) return;

    if (!initialLoadComplete) {
      setInitialLoadComplete(true);

      // Auto-navigate to dashboard if user is already authenticated
      if (user && router.current === "landing") {
        navigate("dashboard", { replace: true });
      }
    } else {
      // Auto-redirect to dashboard on new sign-in
      if (user && router.current === "landing") {
        navigate("dashboard", { replace: true });
      }

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
        <LoadingScreen message="Initializing..." />
      </ThemeProvider>
    );
  }

  // Route rendering with transitions
  const renderRoute = () => {
    const commonProps = {
      onNavigate: navigate,
      onGoBack: goBack,
      canGoBack: router.history.length > 1,
      currentRoute: router.current,
    };

    switch (router.current) {
      case "dashboard":
        return user ? (
          <Dashboard
            {...commonProps}
            onNavigateToLanding={() => navigate("landing")}
          />
        ) : null;

      case "contact-support":
        return <ContactSupport {...commonProps} />;

      case "refund-policy":
        return <RefundPolicy {...commonProps} />;

      case "terms-of-service":
        return <TermsOfService {...commonProps} />;

      case "cancellation-policy":
        return <CancellationPolicy {...commonProps} />;

      case "landing":
      default:
        return (
          <LandingPage
            {...commonProps}
            onNavigateToDashboard={() => navigate("dashboard")}
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
