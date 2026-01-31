/**
 * Cart Store
 * Manages shopping cart state using Zustand with persistence
 */

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type { CartState, CartItem, Cart } from './types';
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
  clearCart as apiClearCart,
  syncCart as apiSyncCart,
} from '@/lib/api';
import { useAuthStore } from './auth.store';

// Initial state
const initialState = {
  cart: null as Cart | null,
  items: [] as CartItem[],
  loading: false,
  syncing: false,
  error: null as string | null,
  itemCount: 0,
  subtotal: 0,
  isEmpty: true,
};

// Counter for generating unique local IDs
let localIdCounter = 0;
const generateLocalId = () => `local-${Date.now()}-${++localIdCounter}`;

// Helper to calculate cart totals
const calculateTotals = (items: CartItem[]) => {
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = items.reduce((sum, item) => {
    const price = item.unit_price ?? item.variant?.price ?? 0;
    return sum + price * item.qty;
  }, 0);
  return { itemCount, subtotal, isEmpty: items.length === 0 };
};

// Create the store
export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        ...initialState,

        // Fetch cart from server
        fetchCart: async () => {
          const isAuthenticated = useAuthStore.getState().isAuthenticated;
          if (!isAuthenticated) {
            // If not authenticated, keep local cart state
            return;
          }

          try {
            set({ loading: true, error: null });

            const cartData = await getCart();
            const items = cartData.items || [];
            const totals = calculateTotals(items);

            set({
              cart: cartData,
              items,
              ...totals,
              loading: false,
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch cart';
            set({ loading: false, error: errorMessage });
          }
        },

        // Add item to cart (requires variant_id)
        addItem: async (variantId: string, qty: number = 1) => {
          const isAuthenticated = useAuthStore.getState().isAuthenticated;

          try {
            set({ loading: true, error: null });

            if (isAuthenticated) {
              // Add to server cart
              await apiAddToCart(variantId, qty);
              // Refresh cart from server
              await get().fetchCart();
            } else {
              // Add to local cart (for guest users)
              const { items } = get();
              const existingItemIndex = items.findIndex(
                (item) => item.variant_id === variantId
              );

              let newItems: CartItem[];
              if (existingItemIndex >= 0) {
                // Update quantity of existing item
                newItems = items.map((item, index) =>
                  index === existingItemIndex
                    ? { ...item, qty: item.qty + qty }
                    : item
                );
              } else {
                // Add new item (minimal local item)
                // TODO: Fetch variant price to populate unit_price correctly
                // Current workaround: unit_price will be 0 until product details are loaded
                const newItem: CartItem = {
                  id: generateLocalId(),
                  cart_id: 'local',
                  product_id: '',
                  variant_id: variantId,
                  qty,
                  unit_price: 0, // Should fetch from variant API
                  added_at: new Date().toISOString(),
                };
                newItems = [...items, newItem];
              }

              const totals = calculateTotals(newItems);
              set({ items: newItems, ...totals, loading: false });
            }

            set({ loading: false });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to add item';
            set({ loading: false, error: errorMessage });
            throw error;
          }
        },

        // Update item quantity
        updateItemQuantity: async (itemId: string, qty: number) => {
          const isAuthenticated = useAuthStore.getState().isAuthenticated;

          try {
            set({ loading: true, error: null });

            if (qty <= 0) {
              // Remove item if quantity is 0 or less
              await get().removeItem(itemId);
              return;
            }

            if (isAuthenticated) {
              // Update on server
              await apiUpdateCartItem(itemId, qty);
              // Refresh cart from server
              await get().fetchCart();
            } else {
              // Update local cart
              const { items } = get();
              const newItems = items.map((item) =>
                item.id === itemId
                  ? { ...item, qty }
                  : item
              );
              const totals = calculateTotals(newItems);
              set({ items: newItems, ...totals, loading: false });
            }

            set({ loading: false });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update item';
            set({ loading: false, error: errorMessage });
            throw error;
          }
        },

        // Remove item from cart
        removeItem: async (itemId: string) => {
          const isAuthenticated = useAuthStore.getState().isAuthenticated;

          try {
            set({ loading: true, error: null });

            if (isAuthenticated) {
              // Remove from server
              await apiRemoveCartItem(itemId);
              // Refresh cart from server
              await get().fetchCart();
            } else {
              // Remove from local cart
              const { items } = get();
              const newItems = items.filter((item) => item.id !== itemId);
              const totals = calculateTotals(newItems);
              set({ items: newItems, ...totals, loading: false });
            }

            set({ loading: false });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to remove item';
            set({ loading: false, error: errorMessage });
            throw error;
          }
        },

        // Clear entire cart
        clearCart: async () => {
          const isAuthenticated = useAuthStore.getState().isAuthenticated;

          try {
            set({ loading: true, error: null });

            if (isAuthenticated) {
              // Clear on server
              await apiClearCart();
            }

            // Clear local state
            set({
              cart: null,
              items: [],
              itemCount: 0,
              subtotal: 0,
              isEmpty: true,
              loading: false,
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to clear cart';
            set({ loading: false, error: errorMessage });
            throw error;
          }
        },

        // Sync local cart with server (after login)
        syncCart: async (localItems: Array<{ variant_id: string; qty: number }>) => {
          const isAuthenticated = useAuthStore.getState().isAuthenticated;

          if (!isAuthenticated || localItems.length === 0) {
            return;
          }

          try {
            set({ syncing: true, error: null });

            await apiSyncCart(localItems);
            // Refresh cart from server
            await get().fetchCart();

            set({ syncing: false });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to sync cart';
            set({ syncing: false, error: errorMessage });
          }
        },

        // Setters
        setLoading: (loading: boolean) => set({ loading }),
        setError: (error: string | null) => set({ error }),

        // Reset store
        reset: () => set(initialState),
      }),
      {
        name: 'cart-storage',
        storage: createJSONStorage(() => localStorage),
        // Persist cart items for guest users
        partialize: (state) => ({
          items: state.items,
          itemCount: state.itemCount,
          subtotal: state.subtotal,
          isEmpty: state.isEmpty,
        }),
      }
    ),
    { name: 'CartStore' }
  )
);

// Selector hooks for specific pieces of state
export const useCartItems = () => useCartStore((state) => state.items);
export const useCartItemCount = () => useCartStore((state) => state.itemCount);
export const useCartSubtotal = () => useCartStore((state) => state.subtotal);
export const useCartIsEmpty = () => useCartStore((state) => state.isEmpty);
export const useCartLoading = () => useCartStore((state) => state.loading);
export const useCartError = () => useCartStore((state) => state.error);

// Action hooks
export const useCartActions = () =>
  useCartStore((state) => ({
    fetchCart: state.fetchCart,
    addItem: state.addItem,
    updateItemQuantity: state.updateItemQuantity,
    removeItem: state.removeItem,
    clearCart: state.clearCart,
    syncCart: state.syncCart,
  }));
