"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import CartItem from "@/app/cart/CartItem";
import OrderSummary from "@/app/cart/OrderSummary";
import { ArrowLeft, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { getCart, syncCart } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

interface CartItemType {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  maxQuantity?: number;
  variant?: string;
  variantId?: string;
  productSlug?: string;
  categorySlug?: string;
}

export default function CartPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Track pending changes for debounced sync
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasPendingChangesRef = useRef(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      setIsLoading(false);
      return;
    }

    try {
      const cart = await getCart();
      const items: CartItemType[] = cart.items.map((item) => ({
        id: item.id,
        name: item.product?.name || "Sản phẩm",
        image: item.variant?.main_image || "/placeholder.png",
        price: item.unit_price,
        quantity: item.qty,
        maxQuantity: item.variant?.qty || 99,
        variant: item.variant?.attributes
          ? Object.values(item.variant.attributes).join(" - ")
          : undefined,
        variantId: item.variant_id,
        productSlug: item.product?.slug,
        categorySlug: undefined, // Category not included in cart API response
      }));
      setCartItems(items);
      hasPendingChangesRef.current = false;
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      showToast("Không thể tải giỏ hàng", "error");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, showToast]);

  useEffect(() => {
    if (!authLoading) {
      fetchCart();
    }
  }, [authLoading, fetchCart]);

  // Debounced sync function
  const debouncedSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      if (!hasPendingChangesRef.current || !isAuthenticated) return;

      setIsSyncing(true);
      try {
        const syncItems = cartItems
          .filter(item => item.variantId)
          .map(item => ({
            variant_id: item.variantId!,
            qty: item.quantity,
          }));

        const updatedCart = await syncCart(syncItems);
        
        // Check for corrections
        const correctedItems = updatedCart.items.filter((serverItem) => {
          const localItem = cartItems.find(i => i.variantId === serverItem.variant_id);
          return localItem && localItem.quantity !== serverItem.qty;
        });

        if (correctedItems.length > 0) {
          showToast("Một số sản phẩm đã được điều chỉnh do số lượng trong kho", "info");
          fetchCart(); // Refresh to get corrected quantities
        } else {
          hasPendingChangesRef.current = false;
        }
      } catch (error) {
        console.error("Failed to sync cart:", error);
        showToast("Không thể đồng bộ giỏ hàng", "error");
      } finally {
        setIsSyncing(false);
      }
    }, 500); // 500ms debounce
  }, [cartItems, isAuthenticated, showToast, fetchCart]);

  // Optimistic update functions
  const handleUpdateQuantity = (id: string, newQty: number) => {
    if (newQty < 0) return;
    
    // Optimistic UI update
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQty } : item
      ).filter(item => item.quantity > 0)
    );
    
    hasPendingChangesRef.current = true;
    debouncedSync();
  };

  const handleIncrease = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    if (item && (!item.maxQuantity || item.quantity < item.maxQuantity)) {
      handleUpdateQuantity(id, item.quantity + 1);
    } else if (item && item.maxQuantity) {
      showToast(`Chỉ còn ${item.maxQuantity} sản phẩm trong kho`, "info");
    }
  };

  const handleDecrease = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    if (item && item.quantity > 1) {
      handleUpdateQuantity(id, item.quantity - 1);
    }
  };

  const handleRemove = (id: string) => {
    // Optimistic removal
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    hasPendingChangesRef.current = true;
    debouncedSync();
    showToast("Đã xóa sản phẩm khỏi giỏ hàng", "success");
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    const item = cartItems.find((i) => i.id === id);
    if (item) {
      const qty = Math.max(1, Math.min(newQuantity, item.maxQuantity || 999));
      handleUpdateQuantity(id, qty);
    }
  };

  // Sync cart when leaving the page
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      // Force sync on unmount if there are pending changes
      if (hasPendingChangesRef.current) {
        const syncItems = cartItems
          .filter(item => item.variantId)
          .map(item => ({
            variant_id: item.variantId!,
            qty: item.quantity,
          }));
        syncCart(syncItems).catch(console.error);
      }
    };
  }, [cartItems]);

  // Show loading while auth is checking or cart is loading
  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={ShoppingCart}
          title="Vui lòng đăng nhập"
          description="Đăng nhập để xem giỏ hàng của bạn"
          action={
            <Button asChild size="lg">
              <Link href="/?login=true">Đăng nhập</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={ShoppingCart}
          title="Giỏ hàng trống"
          description="Giỏ hàng của bạn đang trống. Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm!"
          action={
            <Button asChild size="lg">
              <Link href="/all-products">Mua sắm ngay</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            <h1 className="text-2xl md:text-3xl font-bold">Giỏ hàng</h1>
            <p className="text-lg text-muted-foreground">
              {cartItems.length} sản phẩm {isSyncing && "(đang đồng bộ...)"}
            </p>
          </div>

          <div className="space-y-4">
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onRemove={handleRemove}
                onQuantityChange={handleQuantityChange}
              />
            ))}
          </div>

          <Button variant="ghost" className="mt-6 group" asChild>
            <Link href="/all-products" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Tiếp tục mua sắm
            </Link>
          </Button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <OrderSummary cartItems={cartItems} />
        </div>
      </div>
    </div>
  );
}
