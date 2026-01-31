/**
 * Auth Hooks - Compatibility Layer
 * Provides the same useAuth() interface using Zustand stores
 * This allows gradual migration from context to Zustand
 */

'use client';

import {
  useAuthStore,
  useUser,
  useProfile,
  useSession,
  useIsAuthenticated,
  useAuthLoading,
} from '@/stores';

/**
 * useAuth hook - provides same interface as old AuthContext
 * Components can import from here without changes
 */
export function useAuth() {
  const user = useUser();
  const profile = useProfile();
  const session = useSession();
  const loading = useAuthLoading();
  const isAuthenticated = useIsAuthenticated();

  // Get all actions from store
  const signUp = useAuthStore((state) => state.signUp);
  const signIn = useAuthStore((state) => state.signIn);
  const signOut = useAuthStore((state) => state.signOut);
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const updatePassword = useAuthStore((state) => state.updatePassword);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const signInWithFacebook = useAuthStore((state) => state.signInWithFacebook);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const refreshProfile = useAuthStore((state) => state.refreshProfile);

  // Legacy methods for compatibility with existing modals
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await signIn(email, password);
      return !result.error;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const result = await signUp(email, password, name);
      return !result.error;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      const result = await resetPassword(email);
      return !result.error;
    } catch (error) {
      console.error('Forgot password error:', error);
      return false;
    }
  };

  const logout = () => {
    signOut().catch(console.error);
  };

  return {
    // State
    user,
    profile,
    session,
    loading,
    isAuthenticated,

    // Modern actions
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    signInWithGoogle,
    signInWithFacebook,
    updateProfile,
    refreshProfile,

    // Legacy methods for compatibility
    login,
    register,
    forgotPassword,
    logout,
  };
}

// Re-export for backwards compatibility
export { useAuth as default };
