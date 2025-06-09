// src/App.tsx - Fixed with working Supabase test
import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { supabase } from "./lib/supabase";
import {
  Box,
  CircularProgress,
  Typography,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

const LoadingScreen: React.FC = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        bgcolor: "background.default",
      }}
    >
      <CircularProgress size={60} sx={{ mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        Loading your account...
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        This should only take a moment
      </Typography>
    </Box>
  </ThemeProvider>
);

// Test function - moved outside component
const testSupabaseConnection = async () => {
  console.log("🧪 Testing Supabase connection...");

  try {
    // Test 1: Basic connection
    console.log("🔗 Testing basic connection...");
    const { data: testData, error: testError } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);

    if (testError) {
      console.error("❌ Basic connection failed:", testError);

      if (testError.code === "42P01") {
        console.error("🚨 PROFILES TABLE DOES NOT EXIST!");
        console.log("👉 Go to Supabase SQL Editor and run:");
        console.log(`
CREATE TABLE public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  subscription_status text default 'free',
  subscription_tier text,
  stripe_customer_id text unique,
  credits_remaining integer default 2,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access for authenticated users" ON public.profiles
FOR ALL USING (auth.uid() = id);
        `);
      }
      return;
    }
    console.log("✅ Basic connection works");

    // Test 2: Check if table exists
    console.log("📋 Checking if profiles table exists...");
    const { data: tableData, error: tableError } = await supabase
      .from("profiles")
      .select("*")
      .limit(1);

    if (tableError) {
      console.error("❌ Profiles table error:", tableError);
      return;
    }
    console.log("✅ Profiles table exists");

    // Test 3: Check current user
    console.log("👤 Checking current user...");
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error("❌ User auth error:", userError);
      return;
    }

    if (!userData.user) {
      console.log("🚫 No authenticated user");
      return;
    }

    console.log("✅ User authenticated:", userData.user.id);

    // Test 4: Try to fetch user's profile
    console.log("📊 Testing profile fetch...");
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("❌ Profile fetch error:", profileError);
      return;
    }

    if (profileData) {
      console.log("✅ Profile found:", profileData);
    } else {
      console.log("📝 No profile found, testing profile creation...");

      // Test 5: Try to create profile
      const newProfile = {
        id: userData.user.id,
        email: userData.user.email!,
        full_name: userData.user.user_metadata?.full_name || null,
        subscription_status: "free",
        credits_remaining: 2,
      };

      const { data: createData, error: createError } = await supabase
        .from("profiles")
        .insert(newProfile)
        .select()
        .single();

      if (createError) {
        console.error("❌ Profile creation error:", createError);

        if (createError.code === "42501") {
          console.error("🚨 PERMISSION DENIED - RLS POLICY ISSUE!");
          console.log("Go to Supabase and check your RLS policies!");
        }
        return;
      }

      console.log("✅ Profile created successfully:", createData);
    }

    console.log("🎉 All tests passed!");
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
};

const AppContent: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [currentView, setCurrentView] = useState<"landing" | "dashboard">(
    "landing"
  );
  const [debugMode] = useState(() => {
    // Enable debug mode in development
    return import.meta.env.DEV;
  });

  // Test Supabase connection when component mounts
  useEffect(() => {
    console.log("🚀 AppContent mounted, running Supabase test...");
    testSupabaseConnection();
  }, []); // This should run now!

  // Debug logging
  useEffect(() => {
    if (debugMode) {
      console.log("🎯 AppContent state:", {
        user: user ? "Present" : "None",
        profile: profile ? "Present" : "None",
        loading,
        currentView,
      });
    }
  }, [user, profile, loading, currentView, debugMode]);

  // Add timeout for loading state to prevent infinite loading
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.warn("⚠️ Auth loading timeout - this might indicate an issue");
      }, 10000); // 10 second timeout warning

      return () => clearTimeout(timeout);
    }
  }, [loading]);

  // Show loading screen while auth is initializing
  if (loading) {
    if (debugMode) {
      console.log("⏳ Showing loading screen...");
    }
    return <LoadingScreen />;
  }

  const handleNavigateToDashboard = () => {
    console.log("🧭 Navigating to dashboard");
    setCurrentView("dashboard");
  };

  const handleNavigateToLanding = () => {
    console.log("🧭 Navigating to landing");
    setCurrentView("landing");
  };

  // If user is logged in and on landing page, show landing with dashboard option
  if (user && currentView === "landing") {
    if (debugMode) {
      console.log("🏠 Showing landing page for logged-in user");
    }
    return <LandingPage onNavigateToDashboard={handleNavigateToDashboard} />;
  }

  // If user is logged in and wants dashboard, show dashboard
  if (user && currentView === "dashboard") {
    if (debugMode) {
      console.log("📊 Showing dashboard for logged-in user");
    }
    return <Dashboard />;
  }

  // If no user, always show landing page
  if (debugMode) {
    console.log("🏠 Showing landing page for anonymous user");
  }
  return <LandingPage onNavigateToDashboard={handleNavigateToDashboard} />;
};

const App: React.FC = () => {
  console.log("🚀 App starting...");

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
