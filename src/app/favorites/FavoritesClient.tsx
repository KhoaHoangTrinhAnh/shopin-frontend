"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Heart, Trash2, Loader2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { getFavorites, removeFromFavorites, FavoriteItem } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

export default function FavoritesClient() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await getFavorites();
      setFavorites(response.items);
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) {
      fetchFavorites();
    }
  }, [authLoading, fetchFavorites]);

  const handleRemove = async (productId: string) => {
    setRemovingId(productId);
    try {
      await removeFromFavorites(productId);
      setFavorites((prev) => prev.filter((item) => item.product_id !== productId));
      showToast("Đã xóa khỏi yêu thích", "success");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Không thể xóa";
      showToast(msg, "error");
    } finally {
      setRemovingId(null);
    }
  };

  // Show loading
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
          icon={Heart}
          title="Vui lòng đăng nhập"
          description="Đăng nhập để xem danh sách yêu thích của bạn"
          action={
            <Button asChild size="lg">
              <Link href="/?login=true">Đăng nhập</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={Heart}
          title="Danh sách yêu thích trống"
          description="Bạn chưa thêm sản phẩm nào vào danh sách yêu thích. Hãy khám phá và thêm sản phẩm ưa thích của bạn!"
          action={
            <Button asChild>
              <Link href="/all-products">Khám phá sản phẩm</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">
          Danh sách yêu thích
          <span className="text-lg text-muted-foreground ml-2">({favorites.length})</span>
        </h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {favorites.map((item) => {
          const product = item.product;
          if (!product) return null;

          return (
            <div key={item.product_id} className="relative group">
              <ProductCard
                id={product.slug}
                image={product.default_variant?.main_image || "/placeholder.png"}
                title={product.name}
                price={product.default_variant?.price || 0}
                oldPrice={product.default_variant?.original_price}
                category={product.category?.name}
              />
              <button
                onClick={() => handleRemove(item.product_id)}
                disabled={removingId === item.product_id}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 disabled:opacity-50"
                title="Xóa khỏi yêu thích"
              >
                {removingId === item.product_id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
