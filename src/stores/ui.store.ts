/**
 * UI Store
 * Manages UI state like toasts, modals, search, sidebar using Zustand
 */

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type { UIState, Toast, Modal } from './types';

// Generate unique ID for toasts
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Initial state
const initialState = {
  toasts: [] as Toast[],
  modals: {} as Record<string, Modal>,
  isSearchOpen: false,
  isSidebarOpen: false,
  isMobileMenuOpen: false,
  isLoading: false,
  theme: 'system' as 'light' | 'dark' | 'system',
};

// Default toast duration in milliseconds
const DEFAULT_TOAST_DURATION = 5000;

// Create the store
export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        ...initialState,

        // ==================== TOAST ACTIONS ====================

        showToast: (message: string, type: Toast['type'] = 'info', duration?: number) => {
          const id = generateId();
          const toast: Toast = {
            id,
            message,
            type,
            duration: duration ?? DEFAULT_TOAST_DURATION,
          };

          set((state) => ({
            toasts: [...state.toasts, toast],
          }));

          // Auto-remove toast after duration
          const toastDuration = duration ?? DEFAULT_TOAST_DURATION;
          if (toastDuration > 0) {
            setTimeout(() => {
              get().removeToast(id);
            }, toastDuration);
          }
        },

        removeToast: (id: string) => {
          set((state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id),
          }));
        },

        clearToasts: () => {
          set({ toasts: [] });
        },

        // ==================== MODAL ACTIONS ====================

        openModal: (id: string, data?: Record<string, unknown>) => {
          set((state) => ({
            modals: {
              ...state.modals,
              [id]: { id, isOpen: true, data },
            },
          }));
        },

        closeModal: (id: string) => {
          set((state) => ({
            modals: {
              ...state.modals,
              [id]: { ...state.modals[id], id, isOpen: false },
            },
          }));
        },

        toggleModal: (id: string) => {
          set((state) => {
            const modal = state.modals[id];
            return {
              modals: {
                ...state.modals,
                [id]: { id, isOpen: !modal?.isOpen, data: modal?.data },
              },
            };
          });
        },

        // ==================== SEARCH ACTIONS ====================

        openSearch: () => {
          set({ isSearchOpen: true });
        },

        closeSearch: () => {
          set({ isSearchOpen: false });
        },

        toggleSearch: () => {
          set((state) => ({ isSearchOpen: !state.isSearchOpen }));
        },

        // ==================== SIDEBAR ACTIONS ====================

        openSidebar: () => {
          set({ isSidebarOpen: true });
        },

        closeSidebar: () => {
          set({ isSidebarOpen: false });
        },

        toggleSidebar: () => {
          set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
        },

        // ==================== MOBILE MENU ACTIONS ====================

        openMobileMenu: () => {
          set({ isMobileMenuOpen: true });
        },

        closeMobileMenu: () => {
          set({ isMobileMenuOpen: false });
        },

        toggleMobileMenu: () => {
          set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen }));
        },

        // ==================== GLOBAL LOADING ====================

        setGlobalLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        // ==================== THEME ====================

        setTheme: (theme: 'light' | 'dark' | 'system') => {
          set({ theme });
        },

        // ==================== RESET ====================

        reset: () => set(initialState),
      }),
      {
        name: 'ui-storage',
        storage: createJSONStorage(() => localStorage),
        // Only persist theme preference
        partialize: (state) => ({
          theme: state.theme,
        }),
      }
    ),
    { name: 'UIStore' }
  )
);

// ==================== SELECTOR HOOKS ====================

// Toast selectors
export const useToasts = () => useUIStore((state) => state.toasts);

// Modal fallback cache to prevent re-renders
const modalFallbacks = new Map<string, Modal>();

// Modal selectors
export const useModal = (id: string) => {
  return useUIStore((state) => {
    if (state.modals[id]) return state.modals[id];
    
    // Return cached fallback or create one
    if (!modalFallbacks.has(id)) {
      modalFallbacks.set(id, { id, isOpen: false });
    }
    return modalFallbacks.get(id)!;
  });
};
export const useIsModalOpen = (id: string) =>
  useUIStore((state) => state.modals[id]?.isOpen ?? false);

// Search selectors
export const useIsSearchOpen = () => useUIStore((state) => state.isSearchOpen);

// Sidebar selectors
export const useIsSidebarOpen = () => useUIStore((state) => state.isSidebarOpen);

// Mobile menu selectors
export const useIsMobileMenuOpen = () => useUIStore((state) => state.isMobileMenuOpen);

// Loading selectors
export const useIsGlobalLoading = () => useUIStore((state) => state.isLoading);

// Theme selectors
export const useTheme = () => useUIStore((state) => state.theme);

// ==================== ACTION HOOKS ====================
// Using individual selectors to avoid object recreation and infinite loops

export const useToastActions = () => {
  const showToast = useUIStore((state) => state.showToast);
  const removeToast = useUIStore((state) => state.removeToast);
  const clearToasts = useUIStore((state) => state.clearToasts);
  return { showToast, removeToast, clearToasts };
};

export const useModalActions = () => {
  const openModal = useUIStore((state) => state.openModal);
  const closeModal = useUIStore((state) => state.closeModal);
  const toggleModal = useUIStore((state) => state.toggleModal);
  return { openModal, closeModal, toggleModal };
};

export const useSearchActions = () => {
  const openSearch = useUIStore((state) => state.openSearch);
  const closeSearch = useUIStore((state) => state.closeSearch);
  const toggleSearch = useUIStore((state) => state.toggleSearch);
  return { openSearch, closeSearch, toggleSearch };
};

export const useSidebarActions = () => {
  const openSidebar = useUIStore((state) => state.openSidebar);
  const closeSidebar = useUIStore((state) => state.closeSidebar);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  return { openSidebar, closeSidebar, toggleSidebar };
};

export const useMobileMenuActions = () => {
  const openMobileMenu = useUIStore((state) => state.openMobileMenu);
  const closeMobileMenu = useUIStore((state) => state.closeMobileMenu);
  const toggleMobileMenu = useUIStore((state) => state.toggleMobileMenu);
  return { openMobileMenu, closeMobileMenu, toggleMobileMenu };
};

// Convenience hook for toast (similar to old useToast)
export const useToast = () => {
  const { showToast, removeToast } = useToastActions();
  return {
    toast: showToast,
    success: (message: string, duration?: number) => showToast(message, 'success', duration),
    error: (message: string, duration?: number) => showToast(message, 'error', duration),
    warning: (message: string, duration?: number) => showToast(message, 'warning', duration),
    info: (message: string, duration?: number) => showToast(message, 'info', duration),
    dismiss: removeToast,
  };
};

// Convenience hook for search (replaces useSearch from SearchContext)
export const useSearch = () => {
  const isSearchOpen = useIsSearchOpen();
  const { openSearch, closeSearch, toggleSearch } = useSearchActions();
  return {
    isSearchOpen,
    openSearch,
    closeSearch,
    toggleSearch,
  };
};
