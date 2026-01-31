/**
 * Favorites Store
 * Manages wishlist/favorites state using Zustand
 */

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type { FavoritesState, FavoriteItem } from './types';
import {
  getFavorites,
  addToFavorites as apiAddToFavorites,
  removeFromFavorites as apiRemoveFromFavorites,
  toggleFavorite as apiToggleFavorite,
  checkFavorite,
} from '@/lib/api';
import { useAuthStore } from './auth.store';

// Initial state
const initialState = {
  items: [] as FavoriteItem[],
  loading: false,
  error: null as string | null,
  itemCount: 0,
  productIds: [] as string[],
};

// Create the store
export const useFavoritesStore = create<FavoritesState>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        ...initialState,

        // Fetch favorites from server
        fetchFavorites: async () => {
          const isAuthenticated = useAuthStore.getState().isAuthenticated;
          if (!isAuthenticated) {
            return;
          }

          try {
            set({ loading: true, error: null });

            const response = await getFavorites();
            const items = response.items || [];
            const productIds = items.map((item) => item.product_id);

            set({
              items,
              itemCount: items.length,
              productIds,
              loading: false,
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch favorites';
            set({ loading: false, error: errorMessage });
          }
        },

        // Add product to favorites
        addFavorite: async (productId: string) => {
          const isAuthenticated = useAuthStore.getState().isAuthenticated;

          try {
            set({ loading: true, error: null });

            if (isAuthenticated) {
              await apiAddToFavorites(productId);
              // Refresh from server
              await get().fetchFavorites();
            } else {
              // Add to local favorites for guest
              const { items, productIds } = get();
              if (!productIds.includes(productId)) {
                const newItem: FavoriteItem = {
                  product_id: productId,
                  added_at: new Date().toISOString(),
                  product: {
                    id: productId,
                    name: '',
                    slug: '',
                  },
                };
                const newItems = [...items, newItem];
                set({
                  items: newItems,
                  itemCount: newItems.length,
                  productIds: [...productIds, productId],
                  loading: false,
                });
              } else {
                set({ loading: false });
              }
            }

            set({ loading: false });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to add favorite';
            set({ loading: false, error: errorMessage });
            throw error;
          }
        },

        // Remove product from favorites
        removeFavorite: async (productId: string) => {
          const isAuthenticated = useAuthStore.getState().isAuthenticated;

          try {
            set({ loading: true, error: null });

            if (isAuthenticated) {
              await apiRemoveFromFavorites(productId);
              // Refresh from server
              await get().fetchFavorites();
            } else {
              // Remove from local favorites
              const { items, productIds } = get();
              const newItems = items.filter((item) => item.product_id !== productId);
              const newProductIds = productIds.filter((id) => id !== productId);
              set({
                items: newItems,
                itemCount: newItems.length,
                productIds: newProductIds,
                loading: false,
              });
            }

            set({ loading: false });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to remove favorite';
            set({ loading: false, error: errorMessage });
            throw error;
          }
        },

        // Toggle favorite status
        toggleFavorite: async (productId: string) => {
          const { productIds } = get();
          const isFavorited = productIds.includes(productId);

          if (isFavorited) {
            await get().removeFavorite(productId);
            return false;
          } else {
            await get().addFavorite(productId);
            return true;
          }
        },

        // Check if product is favorited
        isFavorite: (productId: string) => {
          return get().productIds.includes(productId);
        },

        // Setters
        setLoading: (loading: boolean) => set({ loading }),
        setError: (error: string | null) => set({ error }),

        // Reset store
        reset: () => set(initialState),
      }),
      {
        name: 'favorites-storage',
        storage: createJSONStorage(() => localStorage),
        // Persist favorite product IDs for guest users
        partialize: (state) => ({
          productIds: state.productIds,
          itemCount: state.itemCount,
        }),
      }
    ),
    { name: 'FavoritesStore' }
  )
);

// Selector hooks
export const useFavoriteItems = () => useFavoritesStore((state) => state.items);
export const useFavoriteCount = () => useFavoritesStore((state) => state.itemCount);
export const useFavoriteProductIds = () => useFavoritesStore((state) => state.productIds);
export const useFavoritesLoading = () => useFavoritesStore((state) => state.loading);
export const useFavoritesError = () => useFavoritesStore((state) => state.error);

// Action hooks
export const useFavoritesActions = () =>
  useFavoritesStore((state) => ({
    fetchFavorites: state.fetchFavorites,
    addFavorite: state.addFavorite,
    removeFavorite: state.removeFavorite,
    toggleFavorite: state.toggleFavorite,
    isFavorite: state.isFavorite,
  }));

// Convenience hook to check if a specific product is favorited
export const useIsFavorite = (productId: string) =>
  useFavoritesStore((state) => state.productIds.includes(productId));
