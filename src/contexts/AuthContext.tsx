// src/contexts/AuthContext.tsx - Final fix for profile fetch issue
import React, { createContext, useContext, useEffect, useState } from "react";
import { type User, type Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { type Profile } from "../types/database";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log("🔍 Initializing auth...");

        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("❌ Session error:", error);
          if (isMounted) {
            setLoading(false);
          }
          return;
        }

        console.log("📋 Initial session:", session ? "Found" : "None");

        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            console.log("👤 User found, fetching profile...");
            await fetchProfile(session.user.id);
          } else {
            console.log("👤 No user, setting loading false");
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      console.log(
        "🔄 Auth state changed:",
        event,
        session ? "Session exists" : "No session"
      );

      if (!isMounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user && event !== "SIGNED_OUT") {
        console.log("👤 Auth change: User found, fetching profile...");
        await fetchProfile(session.user.id);
      } else {
        console.log("👤 Auth change: No user or signed out");
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    console.log("📊 Starting profile fetch for user:", userId);

    try {
      // First, try to get existing profile
      console.log("🔍 Checking for existing profile...");
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle(); // Use maybeSingle instead of single to avoid error on no results

      if (error) {
        console.error("❌ Error querying profiles:", error);
        setLoading(false);
        return;
      }

      if (data) {
        console.log("✅ Existing profile found!");
        setProfile(data);
        setLoading(false);
        return;
      }

      // No profile exists, create one
      console.log("🔨 No profile found, creating new one...");

      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        console.error("❌ Error getting user data:", userError);
        setLoading(false);
        return;
      }

      const newProfile = {
        id: userId,
        email: userData.user.email!,
        full_name: userData.user.user_metadata?.full_name || null,
        subscription_status: "free",
        subscription_tier: null,
        stripe_customer_id: null,
        credits_remaining: 2, // Free credits
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log("📝 Creating profile with data:", newProfile);

      const { data: createdProfile, error: createError } = await supabase
        .from("profiles")
        .insert(newProfile)
        .select()
        .single();

      if (createError) {
        console.error("❌ Error creating profile:", createError);

        // Check if it's a unique constraint violation (profile already exists)
        if (createError.code === "23505") {
          console.log("🔄 Profile already exists, retrying fetch...");
          // Try to fetch again in case it was created by another tab/request
          const { data: retryData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

          if (retryData) {
            console.log("✅ Found profile on retry!");
            setProfile(retryData);
          }
        }

        setLoading(false);
        return;
      }

      console.log("✅ Profile created successfully!");
      setProfile(createdProfile);
    } catch (error) {
      console.error("❌ Unexpected error in fetchProfile:", error);
    } finally {
      setLoading(false);
      console.log("🎯 Profile fetch complete, loading set to false");
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    console.log("📝 Signing up user...");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    console.log("📝 Signup result:", error ? "Error" : "Success");
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    console.log("🔐 Signing in user...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("🔐 Signin result:", error ? "Error" : "Success");
    return { data, error };
  };

  const signOut = async () => {
    console.log("🚪 Signing out user...");
    setLoading(true);
    await supabase.auth.signOut();
    // Auth state change will handle cleanup
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      console.log("❌ No user to update profile");
      return;
    }

    console.log("📝 Updating profile...");

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", user.id)
        .select()
        .single();

      if (!error && data) {
        console.log("✅ Profile updated successfully");
        setProfile(data);
      } else {
        console.error("❌ Error updating profile:", error);
      }
    } catch (error) {
      console.error("❌ Unexpected error updating profile:", error);
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  console.log("🎯 Auth state:", {
    hasUser: !!user,
    hasProfile: !!profile,
    loading,
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
