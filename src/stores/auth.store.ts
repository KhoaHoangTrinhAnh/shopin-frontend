/**
 * Auth Store
 * Manages authentication state using Zustand with persistence
 */

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type { User, Session } from '@supabase/supabase-js';
import type { AuthState, UserProfile } from './types';
import { authApi, supabase } from '@/lib/auth';
import { uploadAvatar as apiUploadAvatar, changePassword as apiChangePassword } from '@/lib/api';

// Initial state
const initialState = {
  user: null as User | null,
  profile: null as UserProfile | null,
  session: null as Session | null,
  loading: true,
  error: null as string | null,
  isAuthenticated: false,
};

// Create the store
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        ...initialState,

        // Initialize auth - call this on app startup
        initialize: async () => {
          try {
            set({ loading: true, error: null });

            // Check for existing session
            const existingSession = await authApi.getSession();
            
            if (existingSession) {
              const userProfile = await authApi.getProfile(existingSession.user.id);
              
              set({
                session: existingSession,
                user: existingSession.user,
                profile: userProfile,
                isAuthenticated: true,
                loading: false,
              });
            } else {
              set({
                user: null,
                profile: null,
                session: null,
                isAuthenticated: false,
                loading: false,
              });
            }

            // Subscribe to auth state changes and store unsubscribe
            const { data: { subscription } } = authApi.onAuthStateChange(async (newSession: Session | null) => {
              if (newSession?.user) {
                try {
                  const userProfile = await authApi.getProfile(newSession.user.id);
                  set({
                    session: newSession,
                    user: newSession.user,
                    profile: userProfile,
                    isAuthenticated: true,
                  });
                } catch (profileError) {
                  console.error('Failed to load profile on auth change:', profileError);
                  set({
                    session: newSession,
                    user: newSession.user,
                    profile: null,
                    isAuthenticated: true,
                  });
                }
              } else {
                set({
                  session: null,
                  user: null,
                  profile: null,
                  isAuthenticated: false,
                });
              }
            });
            
            // Return unsubscribe function for cleanup
            return subscription?.unsubscribe;
          } catch (error) {
            console.error('Auth initialization error:', error);
            set({
              loading: false,
              error: error instanceof Error ? error.message : 'Failed to initialize auth',
            });
          }
        },

        // Sign up with email and password
        signUp: async (email: string, password: string, fullName?: string) => {
          try {
            set({ loading: true, error: null });

            const data = await authApi.signUp(email, password, fullName);

            if (data.user) {
              // Profile will be created by database trigger
              set({
                user: data.user,
                session: data.session,
                isAuthenticated: !!data.session,
                loading: false,
              });

              // Retry profile loading with exponential backoff
              if (data.session) {
                const maxRetries = 5;
                const loadProfile = async (attempt = 0): Promise<void> => {
                  try {
                    const profile = await authApi.getProfile(data.user.id);
                    if (profile && get().session?.user?.id === data.user.id) {
                      set({ profile });
                    }
                  } catch (err) {
                    if (attempt < maxRetries && get().session?.user?.id === data.user.id) {
                      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
                      setTimeout(() => loadProfile(attempt + 1), delay);
                    }
                  }
                };
                loadProfile();
              }

              return { user: data.user, error: null };
            }

            set({ loading: false });
            return { user: null, error: new Error('Sign up failed - no user returned') };
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
            set({ loading: false, error: errorMessage });
            return { user: null, error: error instanceof Error ? error : new Error(errorMessage) };
          }
        },

        // Sign in with email and password
        signIn: async (email: string, password: string) => {
          try {
            set({ loading: true, error: null });

            const data = await authApi.signIn(email, password);

            set({
              user: data.user,
              session: data.session,
              profile: data.profile || null,
              isAuthenticated: true,
              loading: false,
            });

            return { user: data.user, error: null };
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
            set({ loading: false, error: errorMessage });
            return { user: null, error: error instanceof Error ? error : new Error(errorMessage) };
          }
        },

        // Sign out
        signOut: async () => {
          try {
            set({ loading: true, error: null });
            await authApi.signOut();
            set({
              user: null,
              profile: null,
              session: null,
              isAuthenticated: false,
              loading: false,
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
            set({ loading: false, error: errorMessage });
            throw error;
          }
        },

        // Reset password
        resetPassword: async (email: string) => {
          try {
            set({ loading: true, error: null });
            await authApi.resetPassword(email);
            set({ loading: false });
            return { error: null };
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
            set({ loading: false, error: errorMessage });
            return { error: error instanceof Error ? error : new Error(errorMessage) };
          }
        },

        // Update password
        updatePassword: async (password: string) => {
          try {
            set({ loading: true, error: null });
            await authApi.updatePassword(password);
            set({ loading: false });
            return { error: null };
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Password update failed';
            set({ loading: false, error: errorMessage });
            return { error: error instanceof Error ? error : new Error(errorMessage) };
          }
        },

        // Sign in with Google
        signInWithGoogle: async () => {
          try {
            set({ loading: true, error: null });
            await authApi.signInWithGoogle();
            // OAuth redirect will handle state update via onAuthStateChange
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Google sign in failed';
            set({ loading: false, error: errorMessage });
            throw error;
          }
        },

        // Sign in with Facebook
        signInWithFacebook: async () => {
          try {
            set({ loading: true, error: null });
            await authApi.signInWithFacebook();
            // OAuth redirect will handle state update via onAuthStateChange
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Facebook sign in failed';
            set({ loading: false, error: errorMessage });
            throw error;
          }
        },

        // Update profile
        updateProfile: async (data: Partial<UserProfile>) => {
          const { user } = get();
          if (!user) {
            throw new Error('No user logged in');
          }

          try {
            set({ loading: true, error: null });
            const updatedProfile = await authApi.updateProfile(user.id, data);
            set({ profile: updatedProfile, loading: false });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
            set({ loading: false, error: errorMessage });
            throw error;
          }
        },

        // Refresh profile from server
        refreshProfile: async () => {
          const { user } = get();
          if (!user) return;

          try {
            const profile = await authApi.getProfile(user.id);
            set({ profile });
          } catch (error) {
            console.error('Failed to refresh profile:', error);
          }
        },

        // Upload avatar
        uploadAvatar: async (file: File) => {
          set({ loading: true, error: null });
          try {
            const result = await apiUploadAvatar(file);
            
            // Refresh profile to get updated avatar URL
            const { user } = get();
            if (user) {
              try {
                const profile = await authApi.getProfile(user.id);
                set({ profile });
              } catch (profileError) {
                console.error('Failed to refresh profile after avatar upload:', profileError);
              }
            }
            
            return result.avatar_url;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Avatar upload failed';
            set({ error: errorMessage });
            throw error;
          } finally {
            set({ loading: false });
          }
        },

        // Change password
        changePassword: async (currentPassword: string, newPassword: string) => {
          try {
            set({ loading: true, error: null });
            await apiChangePassword(currentPassword, newPassword);
            set({ loading: false });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Password change failed';
            set({ loading: false, error: errorMessage });
            throw error;
          }
        },

        // Setters
        setLoading: (loading: boolean) => set({ loading }),
        setError: (error: string | null) => set({ error }),

        // Reset store
        reset: () => set(initialState),
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => localStorage),
        // Only persist user ID and session, not full objects for security
        partialize: (state) => ({
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);

// Selector hooks for specific pieces of state
export const useUser = () => useAuthStore((state) => state.user);
export const useProfile = () => useAuthStore((state) => state.profile);
export const useSession = () => useAuthStore((state) => state.session);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.loading);
export const useAuthError = () => useAuthStore((state) => state.error);

// Action hooks
export const useAuthActions = () =>
  useAuthStore((state) => ({
    initialize: state.initialize,
    signUp: state.signUp,
    signIn: state.signIn,
    signOut: state.signOut,
    resetPassword: state.resetPassword,
    updatePassword: state.updatePassword,
    signInWithGoogle: state.signInWithGoogle,
    signInWithFacebook: state.signInWithFacebook,
    updateProfile: state.updateProfile,
    refreshProfile: state.refreshProfile,
    uploadAvatar: state.uploadAvatar,
    changePassword: state.changePassword,
  }));
