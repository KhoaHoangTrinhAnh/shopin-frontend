/**
 * Address Store
 * Manages user addresses state using Zustand
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AddressState, Address, CreateAddressData } from './types';
import {
  getAddresses,
  getDefaultAddress as apiGetDefaultAddress,
  createAddress as apiCreateAddress,
  updateAddress as apiUpdateAddress,
  deleteAddress as apiDeleteAddress,
  setDefaultAddress as apiSetDefaultAddress,
} from '@/lib/api';

// Initial state
const initialState = {
  addresses: [] as Address[],
  defaultAddress: null as Address | null,
  pendingCount: 0,
  error: null as string | null,
};

// Create the store
export const useAddressStore = create<AddressState>()(
  devtools(
    (set, get) => ({
      // State
      ...initialState,

      // Fetch all addresses
      fetchAddresses: async () => {
        set((state) => ({ pendingCount: state.pendingCount + 1, error: null }));
        try {
          const response = await getAddresses();

          set((state) => ({
            addresses: response.items || [],
            defaultAddress: response.default_address || null,
            pendingCount: state.pendingCount - 1,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch addresses';
          set((state) => ({ pendingCount: state.pendingCount - 1, error: errorMessage }));
        }
      },

      // Fetch default address only
      fetchDefaultAddress: async () => {
        set((state) => ({ pendingCount: state.pendingCount + 1, error: null }));
        try {
          const address = await apiGetDefaultAddress();

          set((state) => ({
            defaultAddress: address,
            pendingCount: state.pendingCount - 1,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch default address';
          set((state) => ({ pendingCount: state.pendingCount - 1, error: errorMessage }));
        }
      },

      // Create a new address
      createAddress: async (data: CreateAddressData) => {
        set((state) => ({ pendingCount: state.pendingCount + 1, error: null }));
        try {
          const newAddress = await apiCreateAddress(data);

          set((state) => {
            let updatedAddresses: Address[];
            let defaultAddress: Address | null;
            
            if (data.is_default || state.addresses.length === 0) {
              // Clear is_default on all existing addresses
              updatedAddresses = state.addresses.map(addr => ({ ...addr, is_default: false }));
              updatedAddresses.push({ ...newAddress, is_default: true });
              defaultAddress = newAddress;
            } else {
              updatedAddresses = [...state.addresses, newAddress];
              defaultAddress = state.defaultAddress;
            }

            return {
              addresses: updatedAddresses,
              defaultAddress,
              pendingCount: state.pendingCount - 1,
            };
          });

          return newAddress;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create address';
          set((state) => ({ pendingCount: state.pendingCount - 1, error: errorMessage }));
          throw error;
        }
      },

      // Update an address
      updateAddress: async (id: string, data: Partial<CreateAddressData>) => {
        set((state) => ({ pendingCount: state.pendingCount + 1, error: null }));
        try {
          const updatedAddress = await apiUpdateAddress(id, data);

          set((state) => ({
            addresses: state.addresses.map((addr) =>
              addr.id === id ? updatedAddress : addr
            ),
            defaultAddress: state.defaultAddress?.id === id
              ? updatedAddress
              : state.defaultAddress,
            pendingCount: state.pendingCount - 1,
          }));

          return updatedAddress;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update address';
          set((state) => ({ pendingCount: state.pendingCount - 1, error: errorMessage }));
          throw error;
        }
      },

      // Delete an address
      deleteAddress: async (id: string) => {
        set((state) => ({ pendingCount: state.pendingCount + 1, error: null }));
        try {
          await apiDeleteAddress(id);

          set((state) => {
            const addresses = state.addresses.filter((addr) => addr.id !== id);
            // If we deleted the default address, set first remaining as default
            let defaultAddress = state.defaultAddress?.id === id
              ? (addresses[0] || null)
              : state.defaultAddress;

            return {
              addresses,
              defaultAddress,
              pendingCount: state.pendingCount - 1,
            };
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete address';
          set((state) => ({ pendingCount: state.pendingCount - 1, error: errorMessage }));
          throw error;
        }
      },

      // Set an address as default
      setDefaultAddress: async (id: string) => {
        set((state) => ({ pendingCount: state.pendingCount + 1, error: null }));
        try {
          const updatedAddress = await apiSetDefaultAddress(id);

          set((state) => ({
            addresses: state.addresses.map((addr) => ({
              ...addr,
              is_default: addr.id === id,
            })),
            defaultAddress: updatedAddress,
            pendingCount: state.pendingCount - 1,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to set default address';
          set((state) => ({ pendingCount: state.pendingCount - 1, error: errorMessage }));
          throw error;
        }
      },

      // Setters
      setLoading: (loading: boolean) => set((state) => ({ pendingCount: loading ? state.pendingCount + 1 : Math.max(0, state.pendingCount - 1) })),
      setError: (error: string | null) => set({ error }),

      // Reset store
      reset: () => set(initialState),
    }),
    { name: 'AddressStore' }
  )
);

// Selector hooks
export const useAddresses = () => useAddressStore((state) => state.addresses);
export const useDefaultAddress = () => useAddressStore((state) => state.defaultAddress);
export const useAddressLoading = () => useAddressStore((state) => state.pendingCount > 0);
export const useAddressError = () => useAddressStore((state) => state.error);

// Action hooks
export const useAddressActions = () =>
  useAddressStore((state) => ({
    fetchAddresses: state.fetchAddresses,
    fetchDefaultAddress: state.fetchDefaultAddress,
    createAddress: state.createAddress,
    updateAddress: state.updateAddress,
    deleteAddress: state.deleteAddress,
    setDefaultAddress: state.setDefaultAddress,
  }));
