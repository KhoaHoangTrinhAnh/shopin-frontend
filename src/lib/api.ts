// API service for products and related data
import { createClient } from '@supabase/supabase-js';
import { Product, ProductVariant, Category, Brand } from '@/types/database';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api';

// Supabase client for auth headers
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
let supabase: any = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  categories?: string[];
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Get all products with optional filters
export async function getProducts(
  filters?: ProductFilters,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<Product>> {
  try {
    const params = new URLSearchParams();
    if (filters?.category) params.append('categoryId', filters.category);
    if (filters?.brand) params.append('brandId', filters.brand);
    if (filters?.categories) filters.categories.forEach(c => params.append('categories', c));
    if (filters?.brands) filters.brands.forEach(b => params.append('brands', b));
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`, {
      cache: 'no-store', // For real-time data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return empty response as fallback
    return {
      data: [],
      pagination: {
        total: 0,
        page,
        limit,
        totalPages: 0,
      },
    };
  }
}

// Get a single product by ID or slug
export async function getProduct(idOrSlug: string): Promise<Product | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${idOrSlug}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Get product variants for a product
export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/variants`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch variants: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching product variants:', error);
    return [];
  }
}

// Get all categories
export async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Get all brands
export async function getBrands(): Promise<Brand[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/brands`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch brands: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
}

// Get featured/popular products
export async function getFeaturedProducts(limit: number = 8): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/featured?limit=${limit}`, {
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch featured products: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

// Get best selling products
export async function getBestSellingProducts(limit: number = 8): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/best-selling?limit=${limit}`, {
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch best selling products: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching best selling products:', error);
    return [];
  }
}

// Format price in Vietnamese Dong
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

// Calculate discount percentage
export function calculateDiscount(originalPrice: number, price: number): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

// ==================== CART API ====================

export interface CartItem {
  id: string;
  cart_id: string;
  variant_id: string;
  product_id: string;
  qty: number;
  unit_price: number;
  added_at: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    main_image: string | null;
  };
  variant?: {
    id: string;
    sku: string;
    main_image: string;
    attributes: Record<string, any>;
    price: number;
    name: string;
    color: string;
    qty: number;
  };
}

export interface Cart {
  id: string;
  profile_id: string;
  items: CartItem[];
  total_items: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

/**
 * Get authorization header with access token
 */
async function getAuthHeader(): Promise<{ Authorization: string } | null> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return null;
  }

  // IMPORTANT: Use getUser() instead of getSession() to ensure fresh user data
  // getSession() might return stale/cached session
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    console.error('[Auth] Failed to get user:', error?.message);
    return null;
  }

  // Get session after confirming user exists
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Auth] No access token in session');
    }
    return null;
  }
  
  // Debug: log user info (dev only, no PII in production)
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Auth] User authenticated, session valid');
  }
  
  // Verify session matches current user
  if (session.user?.id !== user.id) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Auth] Session mismatch detected');
    }
    // Force refresh session with error handling
    try {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError || !refreshData?.session?.access_token) {
        console.error('[Auth] Token refresh failed:', refreshError?.message);
        return null;
      }
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Auth] Session refreshed successfully');
      }
      return { Authorization: `Bearer ${refreshData.session.access_token}` };
    } catch (err) {
      console.error('[Auth] Refresh exception:', err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }
  
  return { Authorization: `Bearer ${session.access_token}` };
}

/**
 * Add item to cart
 */
export async function addToCart(variantId: string, qty: number = 1): Promise<CartItem> {
  const headers = await getAuthHeader();
  
  if (!headers) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/cart/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      variant_id: variantId,
      qty,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add item to cart');
  }

  return response.json();
}

/**
 * Get user's cart
 */
export async function getCart(): Promise<Cart> {
  const headers = await getAuthHeader();
  
  if (!headers) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/cart`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch cart');
  }

  return response.json();
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(itemId: string, qty: number): Promise<CartItem> {
  const headers = await getAuthHeader();
  
  if (!headers) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({ qty }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update cart item');
  }

  return response.json();
}

/**
 * Remove item from cart
 */
export async function removeCartItem(itemId: string): Promise<{ message: string }> {
  const headers = await getAuthHeader();
  
  if (!headers) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to remove cart item');
  }

  return response.json();
}

/**
 * Clear cart
 */
export async function clearCart(): Promise<{ message: string }> {
  const headers = await getAuthHeader();
  
  if (!headers) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/cart`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to clear cart');
  }

  return response.json();
}

/**
 * Sync entire cart with optimistic updates
 */
export async function syncCart(items: Array<{ variant_id: string; qty: number }>): Promise<Cart> {
  const headers = await getAuthHeader();
  
  if (!headers) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/cart/sync`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to sync cart');
  }

  return response.json();
}

// ==================== FAVORITES API ====================

export interface FavoriteItem {
  product_id: string;
  added_at: string;
  product: {
    id: string;
    name: string;
    slug: string;
    category?: {
      id: number;
      name: string;
      slug: string | null;
    };
    default_variant?: {
      id: string;
      price: number;
      original_price: number | null;
      main_image: string | null;
    };
  };
}

export interface FavoritesResponse {
  items: FavoriteItem[];
  total: number;
}

/**
 * Get user's favorites
 */
export async function getFavorites(): Promise<FavoritesResponse> {
  const headers = await getAuthHeader();
  
  if (!headers) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/favorites`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch favorites');
  }

  return response.json();
}

/**
 * Add product to favorites
 */
export async function addToFavorites(productId: string): Promise<FavoriteItem> {
  const headers = await getAuthHeader();
  
  if (!headers) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/favorites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({ product_id: productId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add to favorites');
  }

  return response.json();
}

/**
 * Remove product from favorites
 */
export async function removeFromFavorites(productId: string): Promise<{ message: string }> {
  const headers = await getAuthHeader();
  
  if (!headers) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/favorites/${productId}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to remove from favorites');
  }

  return response.json();
}

/**
 * Check if product is in favorites
 */
export async function checkFavorite(productId: string): Promise<boolean> {
  const headers = await getAuthHeader();
  
  if (!headers) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/favorites/${productId}/check`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) return false;
    
    const data = await response.json();
    return data.isFavorite;
  } catch {
    return false;
  }
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(productId: string): Promise<{ isFavorite: boolean }> {
  const headers = await getAuthHeader();
  
  if (!headers) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/favorites/${productId}/toggle`, {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to toggle favorite');
  }

  return response.json();
}

// ==================== ADDRESSES API ====================

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

export interface AddressesResponse {
  items: Address[];
  default_address: Address | null;
  total: number;
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

/**
 * Get user's addresses
 */
export async function getAddresses(): Promise<AddressesResponse> {
  const headers = await getAuthHeader();
  
  if (!headers) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/addresses`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch addresses');
  }

  return response.json();
}

/**
 * Get default address
 */
export async function getDefaultAddress(): Promise<Address | null> {
  const headers = await getAuthHeader();
  
  if (!headers) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/addresses/default`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) return null;
    
    const data = await response.json();
    return data.address;
  } catch {
    return null;
  }
}

/**
 * Create new address
 */
export async function createAddress(data: CreateAddressData): Promise<Address> {
  const headers = await getAuthHeader();
  
  if (!headers) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/addresses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create address');
  }

  return response.json();
}

/**
 * Update address
 */
export async function updateAddress(id: string, data: Partial<CreateAddressData>): Promise<Address> {
  const headers = await getAuthHeader();
  
  if (!headers) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update address');
  }

  return response.json();
}

/**
 * Delete address
 */
export async function deleteAddress(id: string): Promise<{ message: string }> {
  const headers = await getAuthHeader();
  
  if (!headers) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/addresses/${id}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete address');
  }

  return response.json();
}

/**
 * Set address as default
 */
export async function setDefaultAddress(id: string): Promise<Address> {
  const headers = await getAuthHeader();
  
  if (!headers) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/addresses/${id}/set-default`, {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to set default address');
  }

  return response.json();
}

// ==================== ORDERS API ====================

export interface OrderItem {
  id: string;
  product_id: string | null;
  variant_id: string | null;
  variant_name: string | null;
  product_name: string | null;
  main_image: string | null;
  qty: number;
  quantity: number; // Alias for qty
  unit_price: number;
  price: number; // Alias for unit_price
  total_price: number;
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
  shipping_address: {
    full_name: string;
    phone: string;
    address_line: string;
    ward?: string;
    district?: string;
    city?: string;
  } | null;
  address: {
    full_name: string;
    phone: string;
    address_line: string;
    ward?: string;
    district?: string;
    city?: string;
  } | null;
  payment_method: string | null;
  note: string | null;
  coupon_code: string | null;
  placed_at: string;
  created_at: string; // Alias for placed_at
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
  address?: {
    full_name: string;
    phone: string;
    address_line: string;
    ward?: string;
    district?: string;
    city?: string;
  };
  payment_method?: string;
  note?: string;
  coupon_code?: string;
}

/**
 * Create order from cart
 */
export async function createOrder(data: CreateOrderData): Promise<Order> {
  const headers = await getAuthHeader();
  
  if (!headers) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create order');
  }

  return response.json();
}

/**
 * Get user's orders
 */
export async function getOrders(page: number = 1, limit: number = 10): Promise<OrdersResponse> {
  const headers = await getAuthHeader();
  
  if (!headers) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/orders?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch orders');
  }

  return response.json();
}

/**
 * Get order by ID
 */
export async function getOrderById(id: string): Promise<Order> {
  const headers = await getAuthHeader();
  
  if (!headers) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch order');
  }

  return response.json();
}

/**
 * Get latest order (for success page)
 */
export async function getLatestOrder(): Promise<Order | null> {
  const headers = await getAuthHeader();
  
  if (!headers) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/orders/latest`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) return null;
    
    const data = await response.json();
    return data.order;
  } catch {
    return null;
  }
}

/**
 * Request order cancellation (for user)
 */
export async function requestOrderCancellation(orderId: string, reason?: string): Promise<Order> {
  const headers = await getAuthHeader();
  
  if (!headers) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to request cancellation');
  }

  return response.json();
}

// ==================== PROFILE ====================

export async function getProfile() {
  const headers = await getAuthHeader();
  if (!headers) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/profiles`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch profile');
  }

  return response.json();
}

export async function updateProfile(data: {
  full_name?: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  avatar_url?: string;
}) {
  const headers = await getAuthHeader();
  if (!headers) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/profiles`, {
    method: 'PUT',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update profile');
  }

  return response.json();
}

export async function uploadAvatar(file: File) {
  const headers = await getAuthHeader();
  if (!headers) {
    throw new Error('Not authenticated');
  }

  const formData = new FormData();
  formData.append('avatar', file);

  const response = await fetch(`${API_BASE_URL}/profiles/avatar`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload avatar');
  }

  return response.json();
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const headers = await getAuthHeader();
  if (!headers) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to change password');
  }

  return response.json();
}

export async function deleteAccount(password: string) {
  const headers = await getAuthHeader();
  if (!headers) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/auth/delete-account`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete account');
  }

  return response.json();
}

// ============================================
// PAYMENT API FUNCTIONS
// ============================================

export interface CreateSepayPaymentParams {
  orderId: string;
  amount: number;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface SepayPaymentResponse {
  checkoutUrl: string;
  paymentId: string;
  orderNumber: string;
  formFields?: any;
}

export interface PaymentStatusResponse {
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  orderId: string;
  transactionId?: string;
  message?: string;
}

/**
 * Create a SePay payment checkout session
 * Returns a checkout URL to redirect the user to
 */
export async function createSepayPayment(params: CreateSepayPaymentParams): Promise<SepayPaymentResponse> {
  const headers = await getAuthHeader();
  if (!headers) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/payments/sepay/create`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create payment');
  }

  return response.json();
}

/**
 * Get payment status for an order
 */
export async function getPaymentStatus(orderId: string): Promise<PaymentStatusResponse> {
  const headers = await getAuthHeader();
  if (!headers) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/payments/status/${orderId}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get payment status');
  }

  return response.json();
}

/**
 * Verify payment after returning from SePay
 */
export async function verifyPayment(orderId: string, transactionId: string): Promise<PaymentStatusResponse> {
  const headers = await getAuthHeader();
  if (!headers) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/payments/verify`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orderId, transactionId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to verify payment');
  }

  return response.json();
}
