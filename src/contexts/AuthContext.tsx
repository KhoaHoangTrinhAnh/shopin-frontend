"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { authApi, UserProfile } from "@/lib/auth";

interface AuthContextType {
  // Auth states
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;

  // Auth actions
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  updateProfile: (updates: Partial<Omit<UserProfile, 'id' | 'email' | 'role' | 'created_at' | 'updated_at'>>) => Promise<void>;
  refreshProfile: () => Promise<void>;

  // Legacy methods for compatibility
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Auth states
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile for a user
  const loadProfile = async (userId: string) => {
    const userProfile = await authApi.getProfile(userId);
    // getProfile returns null when profile is not found or not available
    setProfile(userProfile || null);
  };

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        // First, check for existing session
        const existingSession = await authApi.getSession();
        if (isMounted && existingSession) {
          setSession(existingSession);
          setUser(existingSession.user);
          await loadProfile(existingSession.user.id);
        }
        if (isMounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Subscribe to auth state changes
    const { data } = authApi.onAuthStateChange(async (newSession) => {
      if (!isMounted) return;
      
      setSession(newSession);
      if (newSession?.user) {
        setUser(newSession.user);
        // Load profile but don't block on it
        loadProfile(newSession.user.id).catch(console.error);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    // Get the subscription for cleanup
    const subscription = data?.subscription;

    // Initialize
    initAuth();

    // Cleanup
    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Auth actions
  const signUp = async (email: string, password: string, fullName?: string) => {
    const data = await authApi.signUp(email, password, fullName);
    if (data.user) {
      setUser(data.user);
      if (data.session) {
        setSession(data.session);
        // Profile will be created by database trigger
        setTimeout(() => loadProfile(data.user!.id), 1000); // Give trigger time to complete
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    const data = await authApi.signIn(email, password);
    setUser(data.user);
    setSession(data.session);
    await loadProfile(data.user.id);
  };

  const signOut = async () => {
    await authApi.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    await authApi.resetPassword(email);
  };

  const updatePassword = async (newPassword: string) => {
    await authApi.updatePassword(newPassword);
  };

  const signInWithGoogle = async () => {
    await authApi.signInWithGoogle();
    // OAuth redirect will handle state update
  };

  const signInWithFacebook = async () => {
    await authApi.signInWithFacebook();
    // OAuth redirect will handle state update
  };

  const updateProfile = async (updates: Partial<Omit<UserProfile, 'id' | 'email' | 'role' | 'created_at' | 'updated_at'>>) => {
    if (!user) throw new Error('No user logged in');
    const updatedProfile = await authApi.updateProfile(user.id, updates);
    setProfile(updatedProfile);
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  // Legacy methods for compatibility with existing modals
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signIn(email, password);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      await signUp(email, password, name);
      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      await resetPassword(email);
      return true;
    } catch (error) {
      console.error('Forgot password error:', error);
      return false;
    }
  };

  const logout = () => {
    signOut().catch(console.error);
  };

  return (
    <AuthContext.Provider
      value={{
        // Auth
        user,
        profile,
        session,
        loading,
        isAuthenticated: !!user,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        signInWithGoogle,
        signInWithFacebook,
        updateProfile,
        refreshProfile,

        // Legacy
        login,
        register,
        forgotPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
