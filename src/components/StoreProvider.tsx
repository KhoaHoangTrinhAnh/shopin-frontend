'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { useAuthStore, useCartStore, useFavoritesStore } from '@/stores';

interface StoreProviderProps {
  children: ReactNode;
}

/**
 * StoreProvider initializes Zustand stores on app mount
 * Place this at the root of your app to ensure stores are hydrated
 */
export function StoreProvider({ children }: StoreProviderProps) {
  const initialized = useRef(false);

  // Initialize stores once on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initStores = async () => {
      try {
        // Initialize auth first
        await useAuthStore.getState().initialize();

        // If authenticated, load user data
        if (useAuthStore.getState().isAuthenticated) {
          await Promise.all([
            useCartStore.getState().fetchCart().catch(console.error),
            useFavoritesStore.getState().fetchFavorites().catch(console.error),
          ]);
        }
      } catch (error) {
        console.error('Failed to initialize stores:', error);
      }
    };

    initStores();
  }, []);

  // Render children immediately - hydration happens in background
  return <>{children}</>;
}

export default StoreProvider;
