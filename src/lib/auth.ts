// Auth API service
import { createClient } from '@supabase/supabase-js';
import { User, Session } from '@supabase/supabase-js';
import { AuthChangeEvent } from '@supabase/supabase-js';

// Support multiple env var names (use NEXT_PUBLIC for browser build)
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

// API base URL fallback support
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE_URL || 'http://localhost:3000/api';

let supabase: any;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Provide a minimal fallback that surfaces a clear runtime error when used.
  const missingMsg =
    'Supabase environment variables are missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_URL and SUPABASE_ANON_KEY) and restart the dev server.';
  console.warn(missingMsg);
  const throwMissing = () => {
    throw new Error(missingMsg);
  };

  supabase = {
    auth: {
      // Minimal, safe stubs for common auth methods so the app doesn't crash
      signInWithOAuth: async () => ({ data: null, error: new Error(missingMsg) }),
      signUp: async () => ({ data: { user: null, session: null }, error: new Error(missingMsg) }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error(missingMsg) }),
      getSession: async () => ({ data: { session: null } }),
      setSession: async () => ({ data: { session: null }, error: new Error(missingMsg) }),
      signOut: async () => ({ error: new Error(missingMsg) }),
      updateUser: async () => ({ data: null, error: new Error(missingMsg) }),
      onAuthStateChange: (callback?: (event: any, session: any) => void) => {
        // No-op stub used when env vars are missing. Returns a subscription-like object
        // so callers can call `.unsubscribe()` safely.
        return {
          data: {
            subscription: {
              unsubscribe: () => {},
            },
          },
        };
      },
    },
  } as any;
}

export { supabase };

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: 'user' | 'admin';
  avatar_url: string | null;
  blocked?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  session: Session | null;
  profile?: UserProfile;
}

/**
 * Auth API service using backend REST API
 */
export const authApi = {
  /**
   * Sign up with email and password
   * Uses Supabase Auth directly for reliable registration
   */
  async signUp(email: string, password: string, fullName?: string): Promise<AuthResponse> {
    try {
      // Use Supabase signUp directly
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email.split('@')[0],
          },
        },
      });

      if (authError) {
        throw new Error(authError.message || 'Registration failed');
      }

      if (!authData.user) {
        throw new Error('Registration failed - no user returned');
      }

      // Note: Supabase may require email confirmation depending on settings
      // If email confirmation is enabled, session will be null until confirmed
      
      // Try to create/sync profile with backend if we have a session
      if (authData.session) {
        try {
          await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authData.session.access_token}`,
            },
            body: JSON.stringify({
              email,
              full_name: fullName,
            }),
          });
        } catch (syncError) {
          console.warn('Profile sync with backend failed (trigger may have created it):', syncError);
        }
      }

      return {
        user: authData.user,
        session: authData.session,
      };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  /**
   * Sign in with email and password
   * Uses Supabase Auth directly for reliable session handling
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      // Use Supabase signInWithPassword directly - this handles session correctly
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message || 'Login failed');
      }

      if (!authData.user || !authData.session) {
        throw new Error('Login failed - no user or session returned');
      }

      // Fetch profile from backend
      let profile: UserProfile | undefined;
      try {
        const profileResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${authData.session.access_token}`,
          },
        });
        if (profileResponse.ok) {
          profile = await profileResponse.json();
        }
      } catch (profileError) {
        console.warn('Could not fetch profile:', profileError);
      }

      return {
        user: authData.user,
        session: authData.session,
        profile,
      };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });
      }

      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  /**
   * Request password reset
   */
  async resetPassword(email: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Password reset failed');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  /**
   * Update password (when user is logged in)
   */
  async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  },

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        // No active session - return null instead of throwing to allow callers
        // to handle unauthenticated states without error noise in the console.
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        // Don't throw here; return null so callers can decide what to do.
        // Attempt to parse a JSON error message if available for logging.
        try {
          const err = await response.json();
          console.warn('Get profile warning:', err?.message || response.statusText);
        } catch (e) {
          console.warn('Get profile request failed:', response.statusText);
        }
        return null;
      }

      return await response.json();
    } catch (error) {
      // Log as warning to avoid noisy stack traces during normal auth flows
      console.warn('Get profile error:', error);
      return null;
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No session');
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<void> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  },

  /**
   * Sign in with Facebook
   */
  async signInWithFacebook(): Promise<void> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Facebook sign in error:', error);
      throw error;
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (session: Session) => void) {
    return supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session) => {
        callback(session);
      }
    );
  },

  /**
   * Get current session
   */
  async getSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  /**
   * Verify session
   */
  async verifySession(): Promise<{ user: User; profile: UserProfile } | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Verify session error:', error);
      return null;
    }
  },
};
