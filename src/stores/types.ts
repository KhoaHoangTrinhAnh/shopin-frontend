/**
 * Zustand Store Types
 * Centralized type definitions for all stores
 */

import type { Session, User } from '@supabase/supabase-js';
import type {
  Product,
  ProductVariant,
  Order as DatabaseOrder,
  OrderItem as DatabaseOrderItem,
} from '@/types/database';

// ==================== AUTH STORE TYPES ====================

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: 'user' | 'admin';
  avatar_url: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  blocked?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  // State
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;

  // Computed
  isAuthenticated: boolean;

  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ user: User | null; error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// ==================== CART STORE TYPES ====================

// Re-export from API for consistency
import type { 
  CartItem as ApiCartItem, 
  Cart as ApiCart,
  FavoriteItem as ApiFavoriteItem,
} from '@/lib/api';

export type CartItem = ApiCartItem;
export type Cart = ApiCart;
export type FavoriteItem = ApiFavoriteItem;

export interface CartState {
  // State
  cart: Cart | null;
  items: CartItem[];
  loading: boolean;
  syncing: boolean;
  error: string | null;

  // Computed
  itemCount: number;
  subtotal: number;
  isEmpty: boolean;

  // Actions
  fetchCart: () => Promise<void>;
  addItem: (variantId: string, qty?: number) => Promise<void>;
  updateItemQuantity: (itemId: string, qty: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCart: (items: Array<{ variant_id: string; qty: number }>) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// ==================== ORDER STORE TYPES ====================

export interface OrderItem {
  id: string;
  product_id: string | null;
  variant_id: string | null;
  variant_name: string | null;
  product_name: string | null;
  main_image: string | null;
  qty: number;
  quantity: number;
  unit_price: number;
  price: number;
  total_price: number;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line: string;
  ward?: string;
  district?: string;
  city?: string;
}

export interface Order {
  id: string;
  order_number: string;
  profile_id: string;
  status: string;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total: number;
  shipping_address: ShippingAddress | null;
  address: ShippingAddress | null;
  payment_method: string | null;
  note: string | null;
  coupon_code: string | null;
  placed_at: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface OrdersResponse {
  items: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateOrderData {
  address_id?: string;
  address?: ShippingAddress;
  payment_method?: string;
  note?: string;
  coupon_code?: string;
}

export interface OrderState {
  // State
  orders: Order[];
  currentOrder: Order | null;
  latestOrder: Order | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Actions
  fetchOrders: (page?: number, limit?: number) => Promise<void>;
  fetchOrderById: (id: string) => Promise<void>;
  fetchLatestOrder: () => Promise<void>;
  createOrder: (data: CreateOrderData) => Promise<Order>;
  cancelOrder: (orderId: string, reason?: string) => Promise<void>;
  setCurrentOrder: (order: Order | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// ==================== UI STORE TYPES ====================

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface Modal {
  id: string;
  isOpen: boolean;
  data?: Record<string, unknown>;
}

export interface UIState {
  // State
  toasts: Toast[];
  modals: Record<string, Modal>;
  isSearchOpen: boolean;
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;
  isLoading: boolean;
  theme: 'light' | 'dark' | 'system';

  // Toast Actions
  showToast: (message: string, type?: Toast['type'], duration?: number) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Modal Actions
  openModal: (id: string, data?: Record<string, unknown>) => void;
  closeModal: (id: string) => void;
  toggleModal: (id: string) => void;

  // Search Actions
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;

  // Sidebar Actions
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;

  // Mobile Menu Actions
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;

  // Global Loading
  setGlobalLoading: (loading: boolean) => void;

  // Theme
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Reset
  reset: () => void;
}

// ==================== CHAT STORE TYPES ====================

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  profile_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

export interface ChatState {
  // State
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: ChatMessage[];
  loading: boolean;
  sending: boolean;
  error: string | null;
  isOpen: boolean;

  // Actions
  fetchConversations: () => Promise<void>;
  fetchConversation: (id: string) => Promise<void>;
  createConversation: (title?: string) => Promise<Conversation>;
  sendMessage: (content: string) => Promise<ChatMessage>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// ==================== FAVORITES STORE TYPES ====================
// FavoriteItem is re-exported from API at the top of this file

export interface FavoritesState {
  // State
  items: FavoriteItem[];
  loading: boolean;
  error: string | null;

  // Computed
  itemCount: number;
  productIds: string[];

  // Actions
  fetchFavorites: () => Promise<void>;
  addFavorite: (productId: string) => Promise<void>;
  removeFavorite: (productId: string) => Promise<void>;
  toggleFavorite: (productId: string) => Promise<boolean>;
  isFavorite: (productId: string) => boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// ==================== ADDRESS STORE TYPES ====================

export interface Address {
  id: string;
  profile_id: string;
  full_name: string;
  phone: string;
  address_line: string;
  ward: string | null;
  district: string | null;
  city: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressData {
  full_name: string;
  phone: string;
  address_line: string;
  ward?: string;
  district?: string;
  city?: string;
  is_default?: boolean;
}

export interface AddressState {
  // State
  addresses: Address[];
  defaultAddress: Address | null;
  pendingCount: number;
  error: string | null;

  // Actions
  fetchAddresses: () => Promise<void>;
  fetchDefaultAddress: () => Promise<void>;
  createAddress: (data: CreateAddressData) => Promise<Address>;
  updateAddress: (id: string, data: Partial<CreateAddressData>) => Promise<Address>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}
