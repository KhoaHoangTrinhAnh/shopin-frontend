// Admin API service
import { createClient } from '@supabase/supabase-js';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api';

// Supabase client for auth headers
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// Helper to get auth token
async function getAuthToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

// Helper for authenticated fetch
async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAuthToken();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

// =============================================================================
// TYPES
// =============================================================================

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  stats: {
    orders: { total: number; change: number };
    revenue: { total: number; change: number };
    users: { total: number; change: number };
    products: { total: number };
    pendingOrders: number;
  };
  recentOrders: Order[];
}

export interface Order {
  id: string;
  created_at: string;
  status: string;
  total_price: number;
  shipping_address?: string;
  shipping_phone?: string;
  payment_method?: string;
  confirmed_at?: string;
  admin_notes?: string;
  customer?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
  };
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product?: {
    id: string;
    name: string;
    thumbnail?: string;
    slug?: string;
  };
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  content_blocks?: ContentBlock[];
  featured_image?: string;
  topic?: string;
  keyword?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  seo_keywords?: string;
  status: 'draft' | 'published';
  view_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface ContentBlock {
  type: 'text' | 'image';
  content?: string;
  level?: 'h2' | 'h3' | 'p';
  url?: string;
  alt?: string;
  caption?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value?: number;
  max_discount?: number;
  usage_limit?: number;
  usage_count: number;
  start_date?: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  gender?: string;
  date_of_birth?: string;
  created_at: string;
  updated_at: string;
}

export interface AISettings {
  api_key?: string;
  model: string;
  api_url: string;
  prompt: string;
  has_api_key?: boolean;
}

export interface ShopSettings {
  shop_name: string;
  shop_description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  social_links: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  shipping_fee: number;
  free_shipping_threshold: number;
}

// =============================================================================
// DASHBOARD
// =============================================================================

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await authFetch(`${API_BASE_URL}/admin/dashboard`);
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }
  return response.json();
}

// =============================================================================
// ORDERS
// =============================================================================

export async function getAdminOrders(query?: PaginationQuery): Promise<PaginatedResponse<Order>> {
  const params = new URLSearchParams();
  if (query?.page) params.append('page', query.page.toString());
  if (query?.limit) params.append('limit', query.limit.toString());
  if (query?.search) params.append('search', query.search);
  if (query?.status) params.append('status', query.status);
  if (query?.sort) params.append('sort', query.sort);
  if (query?.order) params.append('order', query.order);

  const response = await authFetch(`${API_BASE_URL}/admin/orders?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  return response.json();
}

export async function getAdminOrderDetail(id: string): Promise<Order> {
  const response = await authFetch(`${API_BASE_URL}/admin/orders/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch order detail');
  }
  return response.json();
}

export async function confirmOrder(id: string, notes?: string): Promise<Order> {
  const response = await authFetch(`${API_BASE_URL}/admin/orders/${id}/confirm`, {
    method: 'POST',
    body: JSON.stringify({ admin_notes: notes }),
  });
  if (!response.ok) {
    throw new Error('Failed to confirm order');
  }
  return response.json();
}

export async function updateOrderStatus(id: string, status: string, notes?: string): Promise<Order> {
  const response = await authFetch(`${API_BASE_URL}/admin/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, admin_notes: notes }),
  });
  if (!response.ok) {
    throw new Error('Failed to update order status');
  }
  return response.json();
}

export async function getPendingCancellations(query?: PaginationQuery): Promise<PaginatedResponse<Order>> {
  const params = new URLSearchParams();
  if (query?.page) params.append('page', query.page.toString());
  if (query?.limit) params.append('limit', query.limit.toString());

  const response = await authFetch(`${API_BASE_URL}/admin/orders/cancellations/pending?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch pending cancellations');
  }
  return response.json();
}

export async function approveCancellation(orderId: string): Promise<Order> {
  const response = await authFetch(`${API_BASE_URL}/admin/orders/${orderId}/cancellation/approve`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to approve cancellation');
  }
  return response.json();
}

export async function rejectCancellation(orderId: string, reason?: string): Promise<Order> {
  const response = await authFetch(`${API_BASE_URL}/admin/orders/${orderId}/cancellation/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
  if (!response.ok) {
    throw new Error('Failed to reject cancellation');
  }
  return response.json();
}

// =============================================================================
// ARTICLES
// =============================================================================

export async function getAdminArticles(query?: PaginationQuery): Promise<PaginatedResponse<Article>> {
  const params = new URLSearchParams();
  if (query?.page) params.append('page', query.page.toString());
  if (query?.limit) params.append('limit', query.limit.toString());
  if (query?.search) params.append('search', query.search);
  if (query?.status) params.append('status', query.status);
  if (query?.sort) params.append('sort', query.sort);
  if (query?.order) params.append('order', query.order);

  const response = await authFetch(`${API_BASE_URL}/admin/articles?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }
  return response.json();
}

export async function getAdminArticle(id: string): Promise<Article> {
  const response = await authFetch(`${API_BASE_URL}/admin/articles/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch article');
  }
  return response.json();
}

export async function createArticle(data: Partial<Article>): Promise<Article> {
  const response = await authFetch(`${API_BASE_URL}/admin/articles`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create article');
  }
  return response.json();
}

export async function updateArticle(id: string, data: Partial<Article>): Promise<Article> {
  const response = await authFetch(`${API_BASE_URL}/admin/articles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update article');
  }
  return response.json();
}

export async function deleteArticle(id: string): Promise<void> {
  const response = await authFetch(`${API_BASE_URL}/admin/articles/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete article');
  }
}

export async function generateArticleContent(keyword: string, topic?: string): Promise<Partial<Article>> {
  const response = await authFetch(`${API_BASE_URL}/admin/articles/generate`, {
    method: 'POST',
    body: JSON.stringify({ keyword, topic }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate content');
  }
  return response.json();
}

export async function uploadArticleImage(file: File): Promise<{ url: string }> {
  const token = await getAuthToken();
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/admin/articles/upload-image`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }
  return response.json();
}

// =============================================================================
// COUPONS
// =============================================================================

export async function getAdminCoupons(query?: PaginationQuery): Promise<PaginatedResponse<Coupon>> {
  const params = new URLSearchParams();
  if (query?.page) params.append('page', query.page.toString());
  if (query?.limit) params.append('limit', query.limit.toString());
  if (query?.search) params.append('search', query.search);
  if (query?.status) params.append('status', query.status);
  if (query?.sort) params.append('sort', query.sort);
  if (query?.order) params.append('order', query.order);

  const response = await authFetch(`${API_BASE_URL}/admin/coupons?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch coupons');
  }
  return response.json();
}

export async function getAdminCoupon(id: string): Promise<Coupon> {
  const response = await authFetch(`${API_BASE_URL}/admin/coupons/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch coupon');
  }
  return response.json();
}

export async function createCoupon(data: Partial<Coupon>): Promise<Coupon> {
  const response = await authFetch(`${API_BASE_URL}/admin/coupons`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create coupon');
  }
  return response.json();
}

export async function updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon> {
  const response = await authFetch(`${API_BASE_URL}/admin/coupons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update coupon');
  }
  return response.json();
}

export async function deleteCoupon(id: string): Promise<void> {
  const response = await authFetch(`${API_BASE_URL}/admin/coupons/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete coupon');
  }
}

export async function toggleCouponStatus(id: string): Promise<Coupon> {
  const response = await authFetch(`${API_BASE_URL}/admin/coupons/${id}/toggle`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    throw new Error('Failed to toggle coupon status');
  }
  return response.json();
}

export async function validateCoupon(code: string, orderTotal: number): Promise<{ valid: boolean; coupon: Coupon; discount: number }> {
  const response = await authFetch(`${API_BASE_URL}/coupons/validate`, {
    method: 'POST',
    body: JSON.stringify({ code, orderTotal }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Invalid coupon');
  }
  return response.json();
}

// =============================================================================
// USERS
// =============================================================================

export async function getAdminUsers(query?: PaginationQuery): Promise<PaginatedResponse<User>> {
  const params = new URLSearchParams();
  if (query?.page) params.append('page', query.page.toString());
  if (query?.limit) params.append('limit', query.limit.toString());
  if (query?.search) params.append('search', query.search);
  if (query?.sort) params.append('sort', query.sort);
  if (query?.order) params.append('order', query.order);

  const response = await authFetch(`${API_BASE_URL}/admin/users?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
}

export async function getAdminUserDetail(id: string): Promise<User & { ordersCount: number; addresses: unknown[] }> {
  const response = await authFetch(`${API_BASE_URL}/admin/users/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user detail');
  }
  return response.json();
}

export async function updateUserRole(id: string, role: 'user' | 'admin'): Promise<User> {
  const response = await authFetch(`${API_BASE_URL}/admin/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
  if (!response.ok) {
    throw new Error('Failed to update user role');
  }
  return response.json();
}

// =============================================================================
// SETTINGS
// =============================================================================

export async function getAISettings(): Promise<AISettings> {
  const response = await authFetch(`${API_BASE_URL}/admin/settings/ai`);
  if (!response.ok) {
    throw new Error('Failed to fetch AI settings');
  }
  return response.json();
}

export async function updateAISettings(data: Partial<AISettings>): Promise<AISettings> {
  const response = await authFetch(`${API_BASE_URL}/admin/settings/ai`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update AI settings');
  }
  return response.json();
}

export async function resetAIPrompt(): Promise<{ prompt: string }> {
  const response = await authFetch(`${API_BASE_URL}/admin/settings/ai/reset-prompt`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to reset AI prompt');
  }
  return response.json();
}

export async function getShopSettings(): Promise<ShopSettings> {
  const response = await authFetch(`${API_BASE_URL}/admin/settings/shop`);
  if (!response.ok) {
    throw new Error('Failed to fetch shop settings');
  }
  return response.json();
}

export async function updateShopSettings(data: Partial<ShopSettings>): Promise<ShopSettings> {
  const response = await authFetch(`${API_BASE_URL}/admin/settings/shop`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update shop settings');
  }
  return response.json();
}

// =============================================================================
// CATEGORIES
// =============================================================================

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  product_count?: number;
}

export async function getAdminCategories(): Promise<Category[]> {
  const response = await authFetch(`${API_BASE_URL}/admin/categories`);
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  return response.json();
}

export async function getAdminCategory(id: number): Promise<Category> {
  const response = await authFetch(`${API_BASE_URL}/admin/categories/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch category');
  }
  return response.json();
}

export async function getCategoryProductCount(id: number): Promise<number> {
  const response = await authFetch(`${API_BASE_URL}/admin/categories/${id}/product-count`);
  if (!response.ok) {
    throw new Error('Failed to fetch product count');
  }
  return response.json();
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  const response = await authFetch(`${API_BASE_URL}/admin/categories`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create category');
  }
  return response.json();
}

export async function updateCategory(id: number, data: Partial<Category>): Promise<Category> {
  const response = await authFetch(`${API_BASE_URL}/admin/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update category');
  }
  return response.json();
}

export async function deleteCategory(id: number): Promise<{ success: boolean }> {
  const response = await authFetch(`${API_BASE_URL}/admin/categories/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete category');
  }
  return response.json();
}

// =============================================================================
// BRANDS
// =============================================================================

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  product_count?: number;
}

export async function getAdminBrands(): Promise<Brand[]> {
  const response = await authFetch(`${API_BASE_URL}/admin/brands`);
  if (!response.ok) {
    throw new Error('Failed to fetch brands');
  }
  return response.json();
}

export async function getAdminBrand(id: number): Promise<Brand> {
  const response = await authFetch(`${API_BASE_URL}/admin/brands/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch brand');
  }
  return response.json();
}

export async function getBrandProductCount(id: number): Promise<number> {
  const response = await authFetch(`${API_BASE_URL}/admin/brands/${id}/product-count`);
  if (!response.ok) {
    throw new Error('Failed to fetch product count');
  }
  return response.json();
}

export async function createBrand(data: Partial<Brand>): Promise<Brand> {
  const response = await authFetch(`${API_BASE_URL}/admin/brands`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create brand');
  }
  return response.json();
}

export async function updateBrand(id: number, data: Partial<Brand>): Promise<Brand> {
  const response = await authFetch(`${API_BASE_URL}/admin/brands/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update brand');
  }
  return response.json();
}

export async function deleteBrand(id: number): Promise<{ success: boolean }> {
  const response = await authFetch(`${API_BASE_URL}/admin/brands/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete brand');
  }
  return response.json();
}

// =============================================================================
// PUBLIC ARTICLES (for blog)
// =============================================================================

export async function getPublicArticles(query?: PaginationQuery): Promise<PaginatedResponse<Article>> {
  const params = new URLSearchParams();
  if (query?.page) params.append('page', query.page.toString());
  if (query?.limit) params.append('limit', query.limit.toString());
  if (query?.search) params.append('search', query.search);

  const response = await fetch(`${API_BASE_URL}/articles?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }
  return response.json();
}

export async function getPublicArticle(slug: string): Promise<Article> {
  const response = await fetch(`${API_BASE_URL}/articles/${slug}`);
  if (!response.ok) {
    throw new Error('Failed to fetch article');
  }
  return response.json();
}
