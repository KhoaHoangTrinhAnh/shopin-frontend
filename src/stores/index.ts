/**
 * Zustand Stores Index
 * Central export point for all stores
 */

// Types
export * from './types';

// Auth Store
export {
  useAuthStore,
  useUser,
  useProfile,
  useSession,
  useIsAuthenticated,
  useAuthLoading,
  useAuthError,
  useAuthActions,
} from './auth.store';

// Cart Store
export {
  useCartStore,
  useCartItems,
  useCartItemCount,
  useCartSubtotal,
  useCartIsEmpty,
  useCartLoading,
  useCartError,
  useCartActions,
} from './cart.store';

// Order Store
export {
  useOrderStore,
  useOrders,
  useCurrentOrder,
  useLatestOrder,
  useOrderLoading,
  useOrderError,
  useOrderPagination,
  useOrderActions,
} from './order.store';

// UI Store
export {
  useUIStore,
  useToasts,
  useModal,
  useIsModalOpen,
  useIsSearchOpen,
  useIsSidebarOpen,
  useIsMobileMenuOpen,
  useIsGlobalLoading,
  useTheme,
  useToastActions,
  useModalActions,
  useSearchActions,
  useSidebarActions,
  useMobileMenuActions,
  useToast,
  useSearch,
} from './ui.store';

// Chat Store (for AI chat - legacy)
export {
  useChatStore,
  useConversations,
  useCurrentConversation,
  useChatMessages,
  useChatLoading,
  useChatSending,
  useChatError,
  useIsChatOpen,
  useChatActions,
} from './chat.store';

// Support Chat Store (customer-side realtime chat)
export { useSupportChatStore } from './support-chat.store';

// Admin Chat Store (admin-side realtime chat)
export { useAdminChatStore } from './admin-chat.store';

// Favorites Store
export {
  useFavoritesStore,
  useFavoriteItems,
  useFavoriteCount,
  useFavoriteProductIds,
  useFavoritesLoading,
  useFavoritesError,
  useFavoritesActions,
  useIsFavorite,
} from './favorites.store';

// Address Store
export {
  useAddressStore,
  useAddresses,
  useDefaultAddress,
  useAddressLoading,
  useAddressError,
  useAddressActions,
} from './address.store';

// ==================== STORE INITIALIZATION ====================

/**
 * Initialize all stores that need initial data loading
 * Call this once on app startup (e.g., in your root layout or _app.tsx)
 */
export async function initializeStores() {
  const { useAuthStore } = await import('./auth.store');
  const { useCartStore } = await import('./cart.store');
  const { useFavoritesStore } = await import('./favorites.store');

  // Initialize auth first
  await useAuthStore.getState().initialize();

  // If authenticated, load user data
  if (useAuthStore.getState().isAuthenticated) {
    // Load cart and favorites in parallel
    await Promise.all([
      useCartStore.getState().fetchCart(),
      useFavoritesStore.getState().fetchFavorites(),
    ]);
  }
}

/**
 * Reset all stores (useful for logout)
 */
export async function resetAllStores() {
  const { useAuthStore } = await import('./auth.store');
  const { useCartStore } = await import('./cart.store');
  const { useOrderStore } = await import('./order.store');
  const { useUIStore } = await import('./ui.store');
  const { useChatStore } = await import('./chat.store');
  const { useSupportChatStore } = await import('./support-chat.store');
  const { useFavoritesStore } = await import('./favorites.store');
  const { useAddressStore } = await import('./address.store');

  // Reset all stores
  useAuthStore.getState().reset();
  useCartStore.getState().reset();
  useOrderStore.getState().reset();
  // Don't reset UI store theme preference
  useChatStore.getState().reset();
  useSupportChatStore.getState().reset();
  useFavoritesStore.getState().reset();
  useAddressStore.getState().reset();
}

// ==================== STORE HOOKS FOR PROVIDERS ====================

import { useEffect, useRef } from 'react';
import { useAuthStore } from './auth.store';
import { useCartStore } from './cart.store';
import { useFavoritesStore } from './favorites.store';

/**
 * Hook to initialize stores on app mount
 * Use this in your root layout or app component
 */
export function useStoreInitialization() {
  useEffect(() => {
    initializeStores().catch(console.error);
  }, []);
}

/**
 * Hook to sync cart with server after login
 */
export function useCartSync() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const cartItems = useCartStore((state) => state.items);
  const syncCart = useCartStore((state) => state.syncCart);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !hasSyncedRef.current) {
      // Check if items are local (not synced)
      const localItems = cartItems.filter((item) => item.id.startsWith('local-'));
      
      if (localItems.length > 0) {
        // Sync local cart with server
        const itemsToSync = localItems.map((item) => ({
          variant_id: item.variant_id,
          qty: item.qty,
        }));
        syncCart(itemsToSync).then(() => {
          hasSyncedRef.current = true;
        }).catch(console.error);
      } else {
        // Just fetch server cart
        fetchCart().then(() => {
          hasSyncedRef.current = true;
        }).catch(console.error);
      }
    }
    
    // Reset sync flag when logged out
    if (!isAuthenticated) {
      hasSyncedRef.current = false;
    }
  }, [isAuthenticated, syncCart, fetchCart]);
}

/**
 * Hook to load favorites after login
 */
export function useFavoritesSync() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const fetchFavorites = useFavoritesStore((state) => state.fetchFavorites);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites().catch(console.error);
    }
  }, [isAuthenticated, fetchFavorites]);
}
