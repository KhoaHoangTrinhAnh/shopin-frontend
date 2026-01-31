/**
 * Auth Store Unit Tests
 */

import { useAuthStore } from '../auth.store';
import { authApi } from '@/lib/auth';

// Mock the auth API
jest.mock('@/lib/auth', () => ({
  authApi: {
    signUp: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
    updatePassword: jest.fn(),
    signInWithGoogle: jest.fn(),
    signInWithFacebook: jest.fn(),
    updateProfile: jest.fn(),
    getProfile: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
  },
  supabase: {
    auth: {
      getSession: jest.fn(() => ({ data: { session: null } })),
    },
  },
}));

// Mock api functions
jest.mock('@/lib/api', () => ({
  uploadAvatar: jest.fn(),
  changePassword: jest.fn(),
}));

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useAuthStore.getState().reset();
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.profile).toBeNull();
      expect(state.session).toBeNull();
      expect(state.loading).toBe(true); // Initial loading is true
      expect(state.error).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('signIn', () => {
    it('should sign in successfully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { access_token: 'token', user: mockUser };
      const mockProfile = { id: 'profile-123', user_id: 'user-123', email: 'test@example.com' };

      (authApi.signIn as jest.Mock).mockResolvedValueOnce({
        user: mockUser,
        session: mockSession,
        profile: mockProfile,
      });

      const result = await useAuthStore.getState().signIn('test@example.com', 'password');

      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.session).toEqual(mockSession);
      expect(state.profile).toEqual(mockProfile);
      expect(state.isAuthenticated).toBe(true);
      expect(state.loading).toBe(false);
    });

    it('should handle sign in error', async () => {
      (authApi.signIn as jest.Mock).mockRejectedValueOnce(new Error('Invalid credentials'));

      const result = await useAuthStore.getState().signIn('test@example.com', 'wrong-password');

      expect(result.user).toBeNull();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toBe('Invalid credentials');

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe('Invalid credentials');
    });
  });

  describe('signUp', () => {
    it('should sign up successfully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { access_token: 'token', user: mockUser };

      (authApi.signUp as jest.Mock).mockResolvedValueOnce({
        user: mockUser,
        session: mockSession,
      });

      const result = await useAuthStore.getState().signUp('test@example.com', 'password', 'John');

      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.session).toEqual(mockSession);
      expect(state.loading).toBe(false);
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      // First set some user data
      useAuthStore.setState({
        user: { id: 'user-123' } as any,
        profile: { id: 'profile-123' } as any,
        session: { access_token: 'token' } as any,
        isAuthenticated: true,
      });

      (authApi.signOut as jest.Mock).mockResolvedValueOnce(undefined);

      await useAuthStore.getState().signOut();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.profile).toBeNull();
      expect(state.session).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setters', () => {
    it('should set loading state', () => {
      useAuthStore.getState().setLoading(true);
      expect(useAuthStore.getState().loading).toBe(true);

      useAuthStore.getState().setLoading(false);
      expect(useAuthStore.getState().loading).toBe(false);
    });

    it('should set error state', () => {
      useAuthStore.getState().setError('Something went wrong');
      expect(useAuthStore.getState().error).toBe('Something went wrong');

      useAuthStore.getState().setError(null);
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      // Set some state
      useAuthStore.setState({
        user: { id: 'user-123' } as any,
        isAuthenticated: true,
        error: 'Some error',
      });

      useAuthStore.getState().reset();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
