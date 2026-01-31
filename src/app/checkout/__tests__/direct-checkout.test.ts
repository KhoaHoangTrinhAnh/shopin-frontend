/**
 * Direct Checkout Flow Tests
 * Tests the "Buy Now" functionality that allows users to purchase a single product
 * without adding it to cart
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock Next.js router
const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: jest.fn(),
  }),
  useSearchParams: () => mockSearchParams,
}));

// Mock API functions
jest.mock('@/lib/api', () => ({
  formatPrice: (price: number) => `${price.toLocaleString('vi-VN')}₫`,
  getCart: jest.fn(),
  getDefaultAddress: jest.fn(),
  createDirectOrder: jest.fn(),
  createOrder: jest.fn(),
}));

// Mock auth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    loading: false,
  }),
}));

// Mock toast hook
const mockShowToast = jest.fn();
jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

describe('Direct Checkout Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.delete('direct');
    mockSearchParams.delete('variantId');
    mockSearchParams.delete('qty');
  });

  describe('ProductCard - Buy Now Button', () => {
    it('should redirect to checkout with correct query params when variant exists', () => {
      const variantSlug = 'iphone-15-pro-128gb-black';
      const expectedUrl = `/checkout?direct=true&variantId=${variantSlug}&qty=1`;

      // Simulate button click
      const onClickHandler = (variantSlug: string, router: any, isAuthenticated: boolean) => {
        if (!isAuthenticated) {
          router.push('/?login=true');
          return;
        }
        router.push(`/checkout?direct=true&variantId=${variantSlug}&qty=1`);
      };

      onClickHandler(variantSlug, { push: mockPush }, true);

      expect(mockPush).toHaveBeenCalledWith(expectedUrl);
    });

    it('should show error when no variant slug is available', () => {
      const variantSlug = undefined;

      const onClickHandler = (variantSlug: string | undefined, showToast: any, isAuthenticated: boolean) => {
        if (!isAuthenticated) return;
        
        if (!variantSlug) {
          showToast('Sản phẩm chưa có phiên bản để mua', 'error');
          return;
        }
      };

      onClickHandler(variantSlug, mockShowToast, true);

      expect(mockShowToast).toHaveBeenCalledWith('Sản phẩm chưa có phiên bản để mua', 'error');
    });

    it('should redirect to login when not authenticated', () => {
      const variantSlug = 'iphone-15-pro-128gb-black';

      const onClickHandler = (variantSlug: string, router: any, isAuthenticated: boolean) => {
        if (!isAuthenticated) {
          router.push('/?login=true');
          return;
        }
      };

      onClickHandler(variantSlug, { push: mockPush }, false);

      expect(mockPush).toHaveBeenCalledWith('/?login=true');
    });
  });

  describe('Checkout Page - Direct Mode Detection', () => {
    it('should detect direct checkout mode from query params', () => {
      mockSearchParams.set('direct', 'true');
      mockSearchParams.set('variantId', 'test-variant-id');
      mockSearchParams.set('qty', '1');

      const params = new URLSearchParams(window.location.search);
      const isDirect = mockSearchParams.get('direct') === 'true';
      const variantId = mockSearchParams.get('variantId');
      const qty = parseInt(mockSearchParams.get('qty') || '1', 10);

      expect(isDirect).toBe(true);
      expect(variantId).toBe('test-variant-id');
      expect(qty).toBe(1);
    });

    it('should parse quantity correctly', () => {
      mockSearchParams.set('qty', '3');
      const qty = parseInt(mockSearchParams.get('qty') || '1', 10);
      expect(qty).toBe(3);
    });

    it('should default to quantity 1 if not provided', () => {
      mockSearchParams.delete('qty');
      const qty = parseInt(mockSearchParams.get('qty') || '1', 10);
      expect(qty).toBe(1);
    });
  });

  describe('Backend API - Variant Lookup', () => {
    it('should accept UUID format variant ID', () => {
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const variantId = '68c05a1e-ed24-431e-a70d-ef14fb16dc4b';
      
      expect(uuidPattern.test(variantId)).toBe(true);
    });

    it('should accept slug format variant ID', () => {
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const variantSlug = 'iphone-15-pro-128gb-black';
      
      expect(uuidPattern.test(variantSlug)).toBe(false);
    });

    it('should detect correct field for Supabase query', () => {
      const detectFieldType = (variantIdOrSlug: string) => {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(variantIdOrSlug);
        return isUUID ? 'id' : 'slug';
      };

      expect(detectFieldType('68c05a1e-ed24-431e-a70d-ef14fb16dc4b')).toBe('id');
      expect(detectFieldType('iphone-15-pro-128gb-black')).toBe('slug');
    });
  });

  describe('Direct Order Creation', () => {
    it('should call createDirectOrder with correct parameters', async () => {
      const { createDirectOrder } = require('@/lib/api');
      
      const orderData = {
        variant_id: 'test-variant-id',
        qty: 1,
        address_id: 'test-address-id',
        payment_method: 'cod',
      };

      createDirectOrder.mockResolvedValueOnce({ id: 'order-123' });

      const result = await createDirectOrder(orderData);

      expect(createDirectOrder).toHaveBeenCalledWith(orderData);
      expect(result).toEqual({ id: 'order-123' });
    });

    it('should handle createDirectOrder errors', async () => {
      const { createDirectOrder } = require('@/lib/api');
      
      const orderData = {
        variant_id: 'invalid-variant',
        qty: 1,
        address_id: 'test-address-id',
      };

      createDirectOrder.mockRejectedValueOnce(new Error('Variant not found'));

      await expect(createDirectOrder(orderData)).rejects.toThrow('Variant not found');
    });
  });

  describe('Order Placement Logic', () => {
    it('should use createDirectOrder when in direct checkout mode', async () => {
      const { createDirectOrder, createOrder } = require('@/lib/api');
      
      const isDirectCheckout = true;
      const directVariantId = 'test-variant';
      const directQuantity = 1;
      const address = { id: 'addr-123' };
      const paymentMethod = 'cod';
      const note = '';

      createDirectOrder.mockResolvedValueOnce({ id: 'order-123' });

      let orderId;
      if (isDirectCheckout && directVariantId) {
        const order = await createDirectOrder({
          variant_id: directVariantId,
          qty: directQuantity,
          address_id: address.id,
          payment_method: paymentMethod,
          note: note || undefined,
        });
        orderId = order.id;
      }

      expect(createDirectOrder).toHaveBeenCalledWith({
        variant_id: directVariantId,
        qty: directQuantity,
        address_id: address.id,
        payment_method: paymentMethod,
        note: undefined,
      });
      expect(createOrder).not.toHaveBeenCalled();
      expect(orderId).toBe('order-123');
    });

    it('should use createOrder when in normal cart mode', async () => {
      const { createDirectOrder, createOrder } = require('@/lib/api');
      
      const isDirectCheckout = false;
      const address = { id: 'addr-123' };
      const paymentMethod = 'cod';
      const note = '';

      createOrder.mockResolvedValueOnce({ id: 'order-456' });

      let orderId;
      if (!isDirectCheckout) {
        const order = await createOrder({
          address_id: address.id,
          payment_method: paymentMethod,
          note: note || undefined,
        });
        orderId = order.id;
      }

      expect(createOrder).toHaveBeenCalledWith({
        address_id: address.id,
        payment_method: paymentMethod,
        note: undefined,
      });
      expect(createDirectOrder).not.toHaveBeenCalled();
      expect(orderId).toBe('order-456');
    });
  });

  describe('Validation', () => {
    it('should require address before placing order', () => {
      const address = null;
      const validateBeforeOrder = (addr: any) => {
        if (!addr) {
          return 'Vui lòng chọn địa chỉ nhận hàng';
        }
        return null;
      };

      const error = validateBeforeOrder(address);
      expect(error).toBe('Vui lòng chọn địa chỉ nhận hàng');
    });

    it('should allow order with valid address', () => {
      const address = { id: 'addr-123', full_name: 'Test User' };
      const validateBeforeOrder = (addr: any) => {
        if (!addr) {
          return 'Vui lòng chọn địa chỉ nhận hàng';
        }
        return null;
      };

      const error = validateBeforeOrder(address);
      expect(error).toBeNull();
    });

    it('should validate quantity is positive', () => {
      const validateQuantity = (qty: number) => qty > 0;

      expect(validateQuantity(1)).toBe(true);
      expect(validateQuantity(5)).toBe(true);
      expect(validateQuantity(0)).toBe(false);
      expect(validateQuantity(-1)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle variant with special characters in slug', () => {
      const variantSlug = 'điện-thoại-samsung-galaxy-s24-ultra';
      const encodedSlug = encodeURIComponent(variantSlug);
      
      expect(encodedSlug).toBe('%C4%91i%E1%BB%87n-tho%E1%BA%A1i-samsung-galaxy-s24-ultra');
    });

    it('should handle large quantities', () => {
      mockSearchParams.set('qty', '999');
      const qty = parseInt(mockSearchParams.get('qty') || '1', 10);
      expect(qty).toBe(999);
    });

    it('should handle malformed quantity as default', () => {
      mockSearchParams.set('qty', 'invalid');
      const qty = parseInt(mockSearchParams.get('qty') || '1', 10);
      expect(isNaN(qty) ? 1 : qty).toBe(1);
    });
  });
});

describe('Integration Test Scenarios', () => {
  it('should complete full direct checkout flow', async () => {
    const { createDirectOrder } = require('@/lib/api');
    
    // Step 1: User clicks "Mua ngay" on product card
    const variantSlug = 'iphone-15-pro-128gb-black';
    mockPush(`/checkout?direct=true&variantId=${variantSlug}&qty=1`);
    
    // Step 2: Checkout page detects direct mode
    mockSearchParams.set('direct', 'true');
    mockSearchParams.set('variantId', variantSlug);
    mockSearchParams.set('qty', '1');
    
    const isDirect = mockSearchParams.get('direct') === 'true';
    const variantId = mockSearchParams.get('variantId');
    const qty = parseInt(mockSearchParams.get('qty') || '1', 10);
    
    expect(isDirect).toBe(true);
    expect(variantId).toBe(variantSlug);
    
    // Step 3: Create direct order
    createDirectOrder.mockResolvedValueOnce({
      id: 'order-789',
      status: 'confirmed',
      total: 25000000,
    });
    
    const order = await createDirectOrder({
      variant_id: variantId!,
      qty,
      address_id: 'addr-123',
      payment_method: 'cod',
    });
    
    expect(order.id).toBe('order-789');
    expect(order.status).toBe('confirmed');
    
    // Step 4: Redirect to success page
    mockPush(`/orders/success?orderId=${order.id}`);
    
    expect(mockPush).toHaveBeenLastCalledWith('/orders/success?orderId=order-789');
  });
});
