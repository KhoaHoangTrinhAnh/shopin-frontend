/**
 * Order Store Unit Tests
 */

import { useOrderStore } from '../order.store';
import * as api from '@/lib/api';

// Mock the API
jest.mock('@/lib/api', () => ({
  getOrders: jest.fn(),
  getOrderById: jest.fn(),
  getLatestOrder: jest.fn(),
  createOrder: jest.fn(),
  requestOrderCancellation: jest.fn(),
}));

describe('OrderStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useOrderStore.getState().reset();
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useOrderStore.getState();

      expect(state.orders).toEqual([]);
      expect(state.currentOrder).toBeNull();
      expect(state.latestOrder).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    });
  });

  describe('fetchOrders', () => {
    it('should fetch orders successfully', async () => {
      const mockOrders = [
        { id: 'order-1', order_number: 'ORD-001', status: 'pending' },
        { id: 'order-2', order_number: 'ORD-002', status: 'completed' },
      ];

      (api.getOrders as jest.Mock).mockResolvedValueOnce({
        items: mockOrders,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      await useOrderStore.getState().fetchOrders();

      const state = useOrderStore.getState();
      expect(state.orders).toEqual(mockOrders);
      expect(state.pagination.total).toBe(2);
      expect(state.pagination.totalPages).toBe(1);
      expect(state.loading).toBe(false);
    });

    it('should handle fetch orders error', async () => {
      (api.getOrders as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

      await useOrderStore.getState().fetchOrders();

      const state = useOrderStore.getState();
      expect(state.orders).toEqual([]);
      expect(state.error).toBe('Failed to fetch');
      expect(state.loading).toBe(false);
    });
  });

  describe('fetchOrderById', () => {
    it('should fetch single order by ID', async () => {
      const mockOrder = { id: 'order-1', order_number: 'ORD-001', status: 'pending' };

      (api.getOrderById as jest.Mock).mockResolvedValueOnce(mockOrder);

      await useOrderStore.getState().fetchOrderById('order-1');

      const state = useOrderStore.getState();
      expect(state.currentOrder).toEqual(mockOrder);
      expect(state.loading).toBe(false);
    });
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const mockOrder = {
        id: 'order-new',
        order_number: 'ORD-003',
        status: 'pending',
        items: [],
      };

      (api.createOrder as jest.Mock).mockResolvedValueOnce(mockOrder);

      const result = await useOrderStore.getState().createOrder({
        address_id: 'addr-1',
        payment_method: 'cod',
      });

      expect(result).toEqual(mockOrder);

      const state = useOrderStore.getState();
      expect(state.orders[0]).toEqual(mockOrder);
      expect(state.currentOrder).toEqual(mockOrder);
      expect(state.latestOrder).toEqual(mockOrder);
    });

    it('should handle create order error', async () => {
      (api.createOrder as jest.Mock).mockRejectedValueOnce(new Error('Failed to create order'));

      await expect(useOrderStore.getState().createOrder({})).rejects.toThrow('Failed to create order');

      const state = useOrderStore.getState();
      expect(state.error).toBe('Failed to create order');
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      const originalOrder = { id: 'order-1', order_number: 'ORD-001', status: 'pending' };
      const cancelledOrder = { ...originalOrder, status: 'cancelled' };

      // Set up initial state
      useOrderStore.setState({
        orders: [originalOrder as any],
        currentOrder: originalOrder as any,
      });

      (api.requestOrderCancellation as jest.Mock).mockResolvedValueOnce(cancelledOrder);

      await useOrderStore.getState().cancelOrder('order-1', 'Changed my mind');

      expect(api.requestOrderCancellation).toHaveBeenCalledWith('order-1', 'Changed my mind');

      const state = useOrderStore.getState();
      expect(state.orders[0].status).toBe('cancelled');
      expect(state.currentOrder?.status).toBe('cancelled');
    });
  });

  describe('setCurrentOrder', () => {
    it('should set current order', () => {
      const mockOrder = { id: 'order-1' } as any;

      useOrderStore.getState().setCurrentOrder(mockOrder);

      expect(useOrderStore.getState().currentOrder).toEqual(mockOrder);
    });

    it('should clear current order with null', () => {
      useOrderStore.setState({ currentOrder: { id: 'order-1' } as any });

      useOrderStore.getState().setCurrentOrder(null);

      expect(useOrderStore.getState().currentOrder).toBeNull();
    });
  });

  describe('setters', () => {
    it('should set loading state', () => {
      useOrderStore.getState().setLoading(true);
      expect(useOrderStore.getState().loading).toBe(true);
    });

    it('should set error state', () => {
      useOrderStore.getState().setError('Something went wrong');
      expect(useOrderStore.getState().error).toBe('Something went wrong');
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      // Set some state
      useOrderStore.setState({
        orders: [{ id: 'order-1' }] as any,
        currentOrder: { id: 'order-1' } as any,
        error: 'Some error',
      });

      useOrderStore.getState().reset();

      const state = useOrderStore.getState();
      expect(state.orders).toEqual([]);
      expect(state.currentOrder).toBeNull();
      expect(state.error).toBeNull();
    });
  });
});
