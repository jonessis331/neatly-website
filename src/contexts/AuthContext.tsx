// src/contexts/AuthContext.tsx - Debug-enhanced and loading-stall patched
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
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
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const mountedRef = useRef(true);
  const initializingRef = useRef(false);
  const profileFetchingRef = useRef(false);

  const fetchProfile = useCallback(
    async (userId: string, retries = 3): Promise<void> => {
      if (profileFetchingRef.current) {
        console.log("📊 Profile fetch already in progress, skipping...");
        return;
      }

      profileFetchingRef.current = true;
      console.log("📊 Fetching profile for user:", userId);

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          console.error("❌ Profile fetch error:", error);

          if (retries > 0 && error.message.includes("network")) {
            console.log(
              `🔄 Retrying profile fetch... (${retries} retries left)`
            );
            await new Promise((res) => setTimeout(res, 1000));
            profileFetchingRef.current = false;
            return fetchProfile(userId, retries - 1);
          }

          return;
        }

        if (data) {
          console.log("✅ Profile found");
          if (mountedRef.current) setProfile(data);
          return;
        }

        console.log("📝 No profile found. Creating new profile...");
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError || !userData.user) {
          console.error("❌ Error getting user data:", userError);
          return;
        }

        const newProfile = {
          id: userId,
          email: userData.user.email!,
          full_name: userData.user.user_metadata?.full_name || null,
          subscription_status: "free",
          subscription_tier: null,
          stripe_customer_id: null,
          credits_remaining: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: createdProfile, error: createError } = await supabase
          .from("profiles")
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          if (createError.code === "23505") {
            console.log(
              "🔄 Race condition detected. Fetching existing profile again..."
            );
            const { data: existingProfile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", userId)
              .single();

            if (existingProfile && mountedRef.current) {
              setProfile(existingProfile);
            }
          } else {
            console.error("❌ Profile creation error:", createError);
          }
          return;
        }

        if (createdProfile && mountedRef.current) {
          console.log("✅ Profile created successfully");
          setProfile(createdProfile);
        }
      } catch (err) {
        console.error("❌ Unexpected error in fetchProfile:", err);
      } finally {
        profileFetchingRef.current = false;
        if (mountedRef.current) setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (initializingRef.current) return;
    initializingRef.current = true;

    const initializeAuth = async () => {
      console.log("🔍 Initializing auth...");
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        console.log("[DEBUG] Supabase session on init:", session);

        if (error) {
          console.error("❌ Session fetch error:", error);
          if (mountedRef.current) setLoading(false);
          return;
        }

        console.log("✅ Session loaded:", session);
        setSession(session);
        setLoading(false); // <-- make sure this is always called
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);
        }

        if (mountedRef.current) setLoading(false);
      } catch (err) {
        console.error("❌ Auth init error:", err);
        if (mountedRef.current) setLoading(false);
      }
    };

    initializeAuth();

    // Force timeout fallback after 6s (DEV only)
    if (import.meta.env.DEV) {
      const timeout = setTimeout(() => {
        if (loading) {
          console.warn("⚠️ Forcing loading=false due to timeout (dev only)");
          setLoading(false);
        }
      }, 6000);
      return () => clearTimeout(timeout);
    }
  }, [fetchProfile]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event, session);

      if (!mountedRef.current) return;

      setSession(session);
      setLoading(false); // <-- make sure this is always called
      setUser(session?.user ?? null);

      if (event === "SIGNED_IN" && session?.user) {
        await fetchProfile(session.user.id);
      } else if (event === "SIGNED_OUT") {
        setProfile(null);
        if (mountedRef.current) setLoading(false);
      }

      if (mountedRef.current) setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    console.log("📝 Signing up user...");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    console.log("🔐 Signing in user...");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    console.log("🚪 Signing out user...");
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    console.log("📝 Updating profile...");
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", user.id)
        .select()
        .single();

      if (!error && data && mountedRef.current) {
        setProfile(data);
      }
    } catch (err) {
      console.error("❌ Profile update error:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
