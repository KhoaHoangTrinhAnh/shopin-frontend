/**
 * Cart Store Unit Tests
 */

import { useCartStore } from '../cart.store';
import { useAuthStore } from '../auth.store';
import * as api from '@/lib/api';

// Mock the API
jest.mock('@/lib/api', () => ({
  getCart: jest.fn(),
  addToCart: jest.fn(),
  updateCartItem: jest.fn(),
  removeCartItem: jest.fn(),
  clearCart: jest.fn(),
  syncCart: jest.fn(),
}));

// Mock auth store
jest.mock('../auth.store', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({
      isAuthenticated: false,
    })),
  },
}));

describe('CartStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useCartStore.getState().reset();
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useCartStore.getState();

      expect(state.cart).toBeNull();
      expect(state.items).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.syncing).toBe(false);
      expect(state.error).toBeNull();
      expect(state.itemCount).toBe(0);
      expect(state.subtotal).toBe(0);
      expect(state.isEmpty).toBe(true);
    });
  });

  describe('addItem (guest user)', () => {
    it('should add item to local cart for guest user', async () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({ isAuthenticated: false });

      await useCartStore.getState().addItem('variant-456', 2);

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].variant_id).toBe('variant-456');
      expect(state.items[0].qty).toBe(2);
      expect(state.itemCount).toBe(2);
    });

    it('should update quantity for existing item in local cart', async () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({ isAuthenticated: false });

      // Add item first
      await useCartStore.getState().addItem('variant-456', 1);
      // Add same item again
      await useCartStore.getState().addItem('variant-456', 2);

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].qty).toBe(3);
      expect(state.itemCount).toBe(3);
    });
  });

  describe('addItem (authenticated user)', () => {
    it('should add item via API for authenticated user', async () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({ isAuthenticated: true });
      (api.addToCart as jest.Mock).mockResolvedValueOnce({ success: true });
      (api.getCart as jest.Mock).mockResolvedValueOnce({
        id: 'cart-123',
        items: [
          {
            id: 'item-1',
            variant_id: 'variant-456',
            qty: 2,
          },
        ],
      });

      await useCartStore.getState().addItem('variant-456', 2);

      expect(api.addToCart).toHaveBeenCalledWith('variant-456', 2);
      expect(api.getCart).toHaveBeenCalled();
    });
  });

  describe('updateItemQuantity', () => {
    it('should update item quantity in local cart', async () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({ isAuthenticated: false });

      // Add item first
      await useCartStore.getState().addItem('variant-456', 1);
      const itemId = useCartStore.getState().items[0].id;

      // Update quantity
      await useCartStore.getState().updateItemQuantity(itemId, 5);

      const state = useCartStore.getState();
      expect(state.items[0].qty).toBe(5);
      expect(state.itemCount).toBe(5);
    });

    it('should remove item when quantity is 0', async () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({ isAuthenticated: false });

      // Add item first
      await useCartStore.getState().addItem('variant-456', 1);
      const itemId = useCartStore.getState().items[0].id;

      // Update quantity to 0
      await useCartStore.getState().updateItemQuantity(itemId, 0);

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
      expect(state.isEmpty).toBe(true);
    });
  });

  describe('removeItem', () => {
    it('should remove item from local cart', async () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({ isAuthenticated: false });

      // Add two items
      await useCartStore.getState().addItem('variant-1', 1);
      await useCartStore.getState().addItem('variant-2', 2);

      const itemId = useCartStore.getState().items[0].id;
      await useCartStore.getState().removeItem(itemId);

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].variant_id).toBe('variant-2');
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({ isAuthenticated: false });

      // Add items
      await useCartStore.getState().addItem('variant-1', 1);
      await useCartStore.getState().addItem('variant-2', 2);

      await useCartStore.getState().clearCart();

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
      expect(state.cart).toBeNull();
      expect(state.itemCount).toBe(0);
      expect(state.subtotal).toBe(0);
      expect(state.isEmpty).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set loading state', () => {
      useCartStore.getState().setLoading(true);
      expect(useCartStore.getState().loading).toBe(true);
    });

    it('should set error state', () => {
      useCartStore.getState().setError('Failed to load cart');
      expect(useCartStore.getState().error).toBe('Failed to load cart');
    });
  });

  describe('reset', () => {
    it('should reset to initial state', async () => {
      (useAuthStore.getState as jest.Mock).mockReturnValue({ isAuthenticated: false });

      // Add some items
      await useCartStore.getState().addItem('variant-1', 1);
      
      useCartStore.getState().reset();

      const state = useCartStore.getState();
      expect(state.items).toEqual([]);
      expect(state.itemCount).toBe(0);
      expect(state.isEmpty).toBe(true);
    });
  });
});
