/**
 * Order Store
 * Manages order history and order creation state using Zustand
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { OrderState, Order, CreateOrderData, OrdersResponse } from './types';
import {
  getOrders,
  getOrderById,
  getLatestOrder,
  createOrder as apiCreateOrder,
  requestOrderCancellation,
} from '@/lib/api';

// Initial state
const initialState = {
  orders: [] as Order[],
  currentOrder: null as Order | null,
  latestOrder: null as Order | null,
  loading: false,
  error: null as string | null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// Create the store
export const useOrderStore = create<OrderState>()(
  devtools(
    (set, get) => ({
      // State
      ...initialState,

      // Fetch orders with pagination
      fetchOrders: async (page: number = 1, limit: number = 10) => {
        try {
          set({ loading: true, error: null });

          const response: OrdersResponse = await getOrders(page, limit);

          set({
            orders: response.items,
            pagination: {
              page: response.page,
              limit: response.limit,
              total: response.total,
              totalPages: response.totalPages,
            },
            loading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders';
          set({ loading: false, error: errorMessage });
        }
      },

      // Fetch single order by ID
      fetchOrderById: async (id: string) => {
        try {
          set({ loading: true, error: null });

          const order = await getOrderById(id);

          set({
            currentOrder: order,
            loading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch order';
          set({ loading: false, error: errorMessage });
          throw error;
        }
      },

      // Fetch latest order (for success page)
      fetchLatestOrder: async () => {
        try {
          set({ loading: true, error: null });

          const order = await getLatestOrder();

          set({
            latestOrder: order,
            currentOrder: order,
            loading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch latest order';
          set({ loading: false, error: errorMessage });
        }
      },

      // Create a new order from cart
      createOrder: async (data: CreateOrderData) => {
        try {
          set({ loading: true, error: null });

          const order = await apiCreateOrder(data);

          set((state) => ({
            orders: [order, ...state.orders],
            currentOrder: order,
            latestOrder: order,
            pagination: {
              ...state.pagination,
              total: state.pagination.total + 1,
              totalPages: Math.ceil((state.pagination.total + 1) / state.pagination.limit),
            },
            loading: false,
          }));

          return order;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
          set({ loading: false, error: errorMessage });
          throw error;
        }
      },

      // Cancel an order
      cancelOrder: async (orderId: string, reason?: string) => {
        try {
          set({ loading: true, error: null });

          const updatedOrder = await requestOrderCancellation(orderId, reason);

          set((state) => ({
            orders: state.orders.map((order) =>
              order.id === orderId ? updatedOrder : order
            ),
            currentOrder: state.currentOrder?.id === orderId ? updatedOrder : state.currentOrder,
            latestOrder: state.latestOrder?.id === orderId ? updatedOrder : state.latestOrder,
            loading: false,
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';
          set({ loading: false, error: errorMessage });
          throw error;
        }
      },

      // Set current order (for viewing details)
      setCurrentOrder: (order: Order | null) => set({ currentOrder: order }),

      // Setters
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),

      // Reset store
      reset: () => set(initialState),
    }),
    { name: 'OrderStore' }
  )
);

// Selector hooks for specific pieces of state
export const useOrders = () => useOrderStore((state) => state.orders);
export const useCurrentOrder = () => useOrderStore((state) => state.currentOrder);
export const useLatestOrder = () => useOrderStore((state) => state.latestOrder);
export const useOrderLoading = () => useOrderStore((state) => state.loading);
export const useOrderError = () => useOrderStore((state) => state.error);
export const useOrderPagination = () => useOrderStore((state) => state.pagination);

// Action hooks
export const useOrderActions = () => {
  const fetchOrders = useOrderStore((state) => state.fetchOrders);
  const fetchOrderById = useOrderStore((state) => state.fetchOrderById);
  const fetchLatestOrder = useOrderStore((state) => state.fetchLatestOrder);
  const createOrder = useOrderStore((state) => state.createOrder);
  const cancelOrder = useOrderStore((state) => state.cancelOrder);
  const setCurrentOrder = useOrderStore((state) => state.setCurrentOrder);
  return { fetchOrders, fetchOrderById, fetchLatestOrder, createOrder, cancelOrder, setCurrentOrder };
};
