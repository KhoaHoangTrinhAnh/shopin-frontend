"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight, ChevronDown, ZoomIn } from "lucide-react";
import { Product, ProductVariant } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice, calculateDiscount, addToCart, checkFavorite, toggleFavorite } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
  initialVariantSlug?: string;
}

export default function ProductDetailClient({
  product,
  relatedProducts,
  initialVariantSlug,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  
  // Find initial variant based on URL slug or use default
  const getInitialVariant = () => {
    if (initialVariantSlug && product.variants) {
      const variant = product.variants.find(v => v.variant_slug === initialVariantSlug);
      if (variant) return variant;
    }
    return product.default_variant || product.variants?.[0]!;
  };
  
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(getInitialVariant());
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  
  const [collapsedSections, setCollapsedSections] = useState<Record<number, boolean>>(() => {
    const sections: Record<number, boolean> = {};
    selectedVariant?.specifications?.forEach((_, idx) => {
      sections[idx] = true;
    });
    return sections;
  });

  const variants = product.variants || [];
  const variantImages = selectedVariant?.image_urls || [];
  const mainImage = selectedVariant?.main_image || "/placeholder.png";
  const images = mainImage && !variantImages.includes(mainImage) 
    ? [mainImage, ...variantImages] 
    : variantImages.length > 0 ? variantImages : [mainImage];

  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  // Check favorite status on mount
  useEffect(() => {
    if (isAuthenticated && product.id) {
      checkFavorite(product.id).then(setIsFavorite).catch(() => {});
    }
  }, [isAuthenticated, product.id]);

  useEffect(() => {
    if (thumbnailContainerRef.current && images.length > 1) {
      const container = thumbnailContainerRef.current;
      const thumbnails = container.children;
      if (thumbnails[selectedImageIndex]) {
        const thumbnail = thumbnails[selectedImageIndex] as HTMLElement;
        
        // Calculate if thumbnail is in view
        const containerRect = container.getBoundingClientRect();
        const thumbnailRect = thumbnail.getBoundingClientRect();
        
        // If thumbnail is not fully visible, scroll it into view
        if (
          thumbnailRect.left < containerRect.left ||
          thumbnailRect.right > containerRect.right
        ) {
          thumbnail.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }
      }
    }
  }, [selectedImageIndex, images.length]);

  const variantAttributes = variants.reduce((acc, variant) => {
    if (!variant.attributes) return acc;
    Object.entries(variant.attributes).forEach(([key, value]) => {
      if (!acc[key]) acc[key] = new Set();
      acc[key].add(value as string);
    });
    return acc;
  }, {} as Record<string, Set<string>>);

  const discount = selectedVariant?.original_price
    ? calculateDiscount(selectedVariant.original_price, selectedVariant.price)
    : 0;

  const handleVariantSelect = (key: string, value: string) => {
    const currentAttrs = selectedVariant.attributes || {};
    const candidateVariants = variants.filter((v) => v.attributes?.[key] === value);

    if (candidateVariants.length === 0) return;

    let bestVariant = candidateVariants[0];
    let bestScore = 0;

    candidateVariants.forEach((v) => {
      let score = 0;
      if (v.attributes) {
        Object.entries(currentAttrs).forEach(([k, val]) => {
          if (k !== key && v.attributes![k] === val) score++;
        });
      }
      if (score > bestScore) {
        bestScore = score;
        bestVariant = v;
      }
    });

    setSelectedVariant(bestVariant);
    setSelectedImageIndex(0);
    
    const newSections: Record<number, boolean> = {};
    bestVariant.specifications?.forEach((_, idx) => {
      newSections[idx] = true;
    });
    setCollapsedSections(newSections);

    // Update URL with new variant slug
    if (bestVariant.variant_slug && product.category?.slug) {
      router.replace(`/product/${product.category.slug}/${bestVariant.variant_slug}`, { scroll: false });
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập để thêm vào giỏ hàng', 'error');
      router.push('/?login=true');
      return;
    }
    
    if (!selectedVariant?.id) {
      showToast('Vui lòng chọn phiên bản sản phẩm', 'error');
      return;
    }

    setIsAddingToCart(true);
    
    try {
      await addToCart(selectedVariant.id, quantity);
      showToast(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`, 'success');
    } catch (error: any) {
      // Handle expected auth/profile related errors gracefully
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('Profile not found') || msg.includes('No session') || msg.includes('Not authenticated')) {
        showToast('Vui lòng đăng nhập để tiếp tục', 'error');
        router.push('/?login=true');
      } else {
        // Unexpected error: log for debugging and show user-friendly message
        console.error('Failed to add to cart:', error);
        showToast(msg || 'Không thể thêm vào giỏ hàng', 'error');
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập để mua hàng', 'error');
      router.push('/?login=true');
      return;
    }
    
    if (!selectedVariant?.id) {
      showToast('Vui lòng chọn phiên bản sản phẩm', 'error');
      return;
    }

    setIsAddingToCart(true);
    
    try {
      // Add to cart first
      await addToCart(selectedVariant.id, quantity);
      // Reset loading state before redirect
      setIsAddingToCart(false);
      // Redirect to checkout
      router.push('/checkout');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('Profile not found') || msg.includes('No session') || msg.includes('Not authenticated')) {
        showToast('Vui lòng đăng nhập để tiếp tục', 'error');
        router.push('/?login=true');
      } else {
        console.error('Failed to add to cart:', error);
        showToast(msg || 'Không thể thêm vào giỏ hàng', 'error');
      }
      setIsAddingToCart(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập để thêm vào yêu thích', 'error');
      router.push('/?login=true');
      return;
    }

    setIsTogglingFavorite(true);
    try {
      const result = await toggleFavorite(product.id);
      setIsFavorite(result.isFavorite);
      showToast(
        result.isFavorite ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích',
        'success'
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Không thể cập nhật yêu thích';
      showToast(msg, 'error');
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleMouseEnter = () => setIsZoomed(true);
  const handleMouseLeave = () => setIsZoomed(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="space-y-4">
          {/* Main Image with Zoom */}
          <div 
            className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className={cn(
              "relative w-full h-full transition-transform duration-200",
              isZoomed && "scale-150"
            )}
            style={isZoomed ? {
              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
            } : {}}
            >
              <Image
                src={images[selectedImageIndex] || mainImage}
                alt={product.name}
                fill
                className="object-contain"
                priority
              />
            </div>
            
            {/* Zoom Indicator */}
            {!isZoomed && (
              <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="h-5 w-5" />
              </div>
            )}
            
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  onMouseEnter={(e) => { e.stopPropagation(); setIsZoomed(false); }}
                  onMouseLeave={(e) => { e.stopPropagation(); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button 
                  onClick={nextImage}
                  onMouseEnter={(e) => { e.stopPropagation(); setIsZoomed(false); }}
                  onMouseLeave={(e) => { e.stopPropagation(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
            
            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {selectedImageIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Thumbnail Grid */}
          {images.length > 1 && (
            <div 
              ref={thumbnailContainerRef} 
              className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pb-2"
            >
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={cn(
                    "relative flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border-2 transition-all hover:border-primary/50",
                    selectedImageIndex === idx ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                  )}
                >
                  <Image 
                    src={img} 
                    alt={`${product.name} ${idx + 1}`} 
                    fill 
                    className="object-contain p-1" 
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {product.brand && (
              <>
                <Link href={`/all-products?brands=${product.brand.slug}`} className="hover:text-primary">
                  {product.brand.name}
                </Link>
                <span>•</span>
              </>
            )}
            {product.category && (
              <Link href={`/all-products?categories=${product.category.slug}`} className="hover:text-primary">
                {product.category.name}
              </Link>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-2">
              <Badge variant={selectedVariant.is_active ? "success" : "secondary"}>
                {selectedVariant.is_active ? "Còn hàng" : "Hết hàng"}
              </Badge>
              {discount > 0 && <Badge variant="destructive">-{discount}%</Badge>}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(selectedVariant.price)}
              </span>
              {selectedVariant.original_price && selectedVariant.original_price > selectedVariant.price && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(selectedVariant.original_price)}
                </span>
              )}
            </div>
          </div>

          {Object.entries(variantAttributes).map(([key, values]) => (
            <div key={key} className="space-y-2">
              <label className="text-sm font-medium capitalize">
                {key === "color" ? "Màu sắc" : key === "storage" ? "Bộ nhớ" : key === "memory" ? "RAM" : key}:
                <span className="ml-2 text-primary">
                  {selectedVariant.attributes?.[key] as string}
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {Array.from(values).map((value) => {
                  const variant = variants.find((v) => v.attributes?.[key] === value);
                  const isSelected = selectedVariant.attributes?.[key] === value;
                  const isAvailable = variant?.is_active;

                  return (
                    <button
                      key={value}
                      onClick={() => isAvailable && handleVariantSelect(key, value)}
                      disabled={!isAvailable}
                      className={cn(
                        "px-4 py-2 rounded-md border-2 text-sm font-medium transition-colors",
                        isSelected ? "border-primary bg-primary text-primary-foreground" : "border-input hover:border-primary",
                        !isAvailable && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="space-y-2">
            <label className="text-sm font-medium">Số lượng:</label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-md">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-muted">-</button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center border-x py-2"
                  min="1"
                  max={selectedVariant.qty}
                />
                <button onClick={() => setQuantity(Math.min(selectedVariant.qty, quantity + 1))} className="px-3 py-2 hover:bg-muted">+</button>
              </div>
              <span className="text-sm text-muted-foreground">Còn hàng: {selectedVariant.qty}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              size="lg" 
              variant="outline"
              className="w-12 h-12 p-0 bg-gray-100 hover:bg-gray-200 border-gray-300" 
              onClick={handleAddToCart} 
              disabled={!selectedVariant.is_active || isAddingToCart}
            >
              <ShoppingCart className="h-5 w-5 text-gray-600" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className={cn(
                "w-12 h-12 p-0 border-gray-300 transition-colors",
                isFavorite 
                  ? "bg-red-50 hover:bg-red-100 border-red-300" 
                  : "bg-gray-100 hover:bg-gray-200"
              )}
              onClick={handleToggleFavorite}
              disabled={isTogglingFavorite}
            >
              <Heart 
                className={cn(
                  "h-5 w-5 transition-colors",
                  isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                )} 
              />
            </Button>
            <Button
              size="lg"
              className="flex-1 bg-green-600 hover:bg-green-800/90 h-12 flex items-center justify-center"
              onClick={handleBuyNow}
              disabled={!selectedVariant.is_active || isAddingToCart}
            >
              {isAddingToCart ? 'Đang xử lý...' : 'Mua ngay'}
            </Button>
          </div>

          {product.description && (
            <div className="pt-6">
              <Separator className="mb-4" />
              <h3 className="font-semibold mb-2">Mô tả sản phẩm</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {selectedVariant.specifications && selectedVariant.specifications.length > 0 && (
        <Card className="mb-12">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6">Thông số kỹ thuật</h2>
            <div className="space-y-4">
              {selectedVariant.specifications.map((section, idx) => {
                const [sectionName, specs] = Object.entries(section)[0];
                const isCollapsed = collapsedSections[idx];
                return (
                  <div key={idx} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setCollapsedSections(prev => ({ ...prev, [idx]: !prev[idx] }))}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <h3 className="font-semibold text-lg">{sectionName}</h3>
                      <ChevronDown className={`w-5 h-5 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
                    </button>
                    {!isCollapsed && (
                      <div className="p-4 grid gap-2">
                        {Object.entries(specs).map(([key, value]) => (
                          <div key={key} className="grid grid-cols-3 gap-4 py-2 border-b last:border-0">
                            <span className="text-muted-foreground">{key}</span>
                            <span className="col-span-2">{Array.isArray(value) ? value.join(", ") : value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((relatedProduct) => {
              const variant = relatedProduct.default_variant;
              const categorySlug = relatedProduct.category?.slug || '';
              const productSlug = relatedProduct.slug || relatedProduct.id;
              return (
                <Link key={relatedProduct.id} href={`/product/${categorySlug}/${productSlug}`} className="group">
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                    <div className="relative aspect-square bg-gray-100">
                      <Image
                        src={variant?.main_image || "/placeholder.png"}
                        alt={relatedProduct.name}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <CardContent className="p-4 flex-1 flex flex-col">
                      <h3 className="font-medium text-sm mb-2 line-clamp-2 min-h-[40px]">{relatedProduct.name}</h3>
                      <p className="text-primary font-bold mt-auto">{variant ? formatPrice(variant.price) : "N/A"}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
