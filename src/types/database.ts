// Database types matching the schema in 001_schema.sql

export interface Brand {
  id: number;
  name: string;
  slug: string | null;
  logo_url?: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string | null;
}

export interface Product {
  id: string; // uuid
  name: string;
  slug: string;
  brand_id: number | null;
  category_id: number | null;
  description: string | null;
  default_variant_id: string; // uuid
  meta: {
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
  } | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  brand?: Brand;
  category?: Category;
  default_variant?: ProductVariant;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string; // uuid
  product_id: string;
  sku: string;
  attributes: {
    color?: string;
    storage?: string;
    memory?: string;
    connection?: string;
    [key: string]: any;
  } | null;
  variant_slug: string;
  price: number;
  original_price: number | null;
  qty: number;
  specifications: SpecificationSection[] | null;
  image_filenames: string[] | null;
  image_urls: string[] | null;
  main_image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SpecificationSection {
  [sectionName: string]: {
    [key: string]: string | string[];
  };
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_name: string | null;
  qty: number;
  unit_price: number | null;
  added_at: string;
  // Joined data
  product?: Product;
  variant?: ProductVariant;
}

export interface Cart {
  id: string;
  profile_id: string | null;
  created_at: string;
  updated_at: string;
  items?: CartItem[];
}

export interface Order {
  id: string;
  profile_id: string | null;
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  subtotal: number | null;
  shipping_fee: number;
  total: number | null;
  address: {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    district?: string;
    ward?: string;
  } | null;
  coupon_code: string | null;
  placed_at: string;
  updated_at: string;
  extra: any;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_name: string | null;
  product_name: string | null;
  qty: number;
  unit_price: number;
  total_price: number;
}

export interface WishlistItem {
  wishlist_id: string;
  product_id: string;
  added_at: string;
  // Joined data
  product?: Product;
}

export interface Review {
  id: string;
  product_id: string | null;
  profile_id: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
  updated_at: string;
  metadata: any;
}
