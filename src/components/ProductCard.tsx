"use client";

import React, { useState, useEffect } from 'react';
import { FaStar, FaHeart as FaHeartSolid } from 'react-icons/fa';
import { FiHeart } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatPrice, checkFavorite, toggleFavorite } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

interface ProductCardProps {
  id: string;
  slug?: string;
  variantSlug?: string;
  image: string;
  title: string;
  price: number;
  oldPrice?: number | null;
  sold?: number;
  category?: string;
  categorySlug?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  slug,
  variantSlug,
  image,
  title,
  price,
  oldPrice,
  sold = 0,
  category,
  categorySlug,
}) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [liked, setLiked] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      checkFavorite(id).then(setLiked).catch(() => {});
    }
  }, [id, isAuthenticated]);

  const toggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      router.push('/?login=true');
      return;
    }

    if (isToggling) return;
    
    setIsToggling(true);
    try {
      const result = await toggleFavorite(id);
      setLiked(result.isFavorite);
      showToast(
        result.isFavorite ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích',
        'success'
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Không thể cập nhật yêu thích';
      showToast(msg, 'error');
    } finally {
      setIsToggling(false);
    }
  };

  const discountPercent = oldPrice && oldPrice > price 
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : 0;

  // Always use product slug for links (not variant slug)
  // This ensures SEO-friendly URLs and prevents 404 errors
  const productUrl = categorySlug && slug
    ? `/product/${categorySlug}/${slug}` 
    : `/product/${id}`;

  return (
    <Link href={productUrl}>
      <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 w-full h-[420px] flex flex-col group cursor-pointer">
        <div className="relative w-full h-52 bg-gray-100 overflow-hidden flex-shrink-0">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />

          {/* Discount badge */}
          {discountPercent > 0 && (
            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-md text-xs font-bold">
              -{discountPercent}%
            </div>
          )}

          {/* Like button */}
          <button
            onClick={toggleLike}
            className={`
              absolute top-2 right-2 group/btn rounded-full p-2 shadow-md 
              transition-all duration-200 transform active:scale-95
              ${liked ? 'bg-green-600' : 'bg-white'}
              hover:bg-green-600
            `}
          >
            {liked ? (
              <FaHeartSolid className="text-white w-4 h-4 transition duration-200" />
            ) : (
              <FiHeart className="w-4 h-4 text-black transition-colors duration-200 group-hover/btn:text-white" />
            )}
          </button>
        </div>

        {/* Product info */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-base font-semibold text-gray-800 line-clamp-1 h-6 overflow-hidden">
            {title}
          </h3>

          <div className="flex items-center text-yellow-500 my-2 text-sm">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} size={13} />
            ))}
            <span className="text-xs text-gray-500 ml-1">(5)</span>
          </div>

          <div className="flex items-center justify-between mb-1 min-h-[3rem]">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-green-700">{formatPrice(price)}</span>
                {discountPercent > 0 && (
                  <span className="text-xs font-semibold text-red-600">-{discountPercent}%</span>
                )}
              </div>
              {oldPrice && oldPrice > price && (
                <span className="text-sm text-gray-400 line-through">{formatPrice(oldPrice)}</span>
              )}
            </div>
            {sold > 0 && <span className="text-sm text-gray-500">Đã bán: {sold}</span>}
          </div>

          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              if (!isAuthenticated) {
                router.push('/?login=true');
                return;
              }
              
              // Direct checkout with query params (variant ID + quantity)
              // This will bypass cart and checkout only this single product
              const defaultVariantId = variantSlug || id; // Use variant slug if available, fallback to product ID
              
              if (!variantSlug) {
                // If no variant slug, this product might not have variants configured
                showToast('Sản phẩm chưa có phiên bản để mua', 'error');
                return;
              }
              
              router.push(`/checkout?direct=true&variantId=${defaultVariantId}&qty=1`);
            }}
            className="mt-auto w-full bg-green-700 text-white font-bold py-2 rounded-3xl hover:bg-green-800 transition duration-200"
          >
            Mua ngay
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
