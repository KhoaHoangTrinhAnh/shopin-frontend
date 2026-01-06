"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { Product, Brand, Category } from "@/types/database";
import { EmptyState } from "@/components/EmptyState";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface AllProductsClientProps {
  initialProducts: Product[];
  initialPage: number;
  totalPages: number;
  total: number;
  brands: Brand[];
  categories: Category[];
}

// ============ CategorySidebar Component (inlined) ============
interface CategorySidebarProps {
  categories: Category[];
  brands: Brand[];
  selectedCategories: string[];
  selectedBrands: string[];
  selectedPrice: string;
  onCategoryChange: (categories: string[]) => void;
  onBrandChange: (brands: string[]) => void;
  onPriceChange: (price: string) => void;
  onClearFilters?: () => void;
}

function CategorySidebar({
  categories,
  brands,
  selectedCategories,
  selectedBrands,
  selectedPrice,
  onCategoryChange,
  onBrandChange,
  onPriceChange,
  onClearFilters,
}: CategorySidebarProps) {
  const priceRanges = [
    { label: 'Dưới 5 triệu', value: '0-5000000' },
    { label: '5 - 10 triệu', value: '5000000-10000000' },
    { label: '10 - 20 triệu', value: '10000000-20000000' },
    { label: '20 - 30 triệu', value: '20000000-30000000' },
    { label: 'Trên 30 triệu', value: '30000000-999999999' },
  ];

  const hasActiveFilters = selectedCategories.length > 0 || selectedBrands.length > 0 || selectedPrice !== '';

  const toggleCategory = (categorySlug: string) => {
    if (selectedCategories.includes(categorySlug)) {
      onCategoryChange(selectedCategories.filter(c => c !== categorySlug));
    } else {
      onCategoryChange([...selectedCategories, categorySlug]);
    }
  };

  const toggleBrand = (brandSlug: string) => {
    if (selectedBrands.includes(brandSlug)) {
      onBrandChange(selectedBrands.filter(b => b !== brandSlug));
    } else {
      onBrandChange([...selectedBrands, brandSlug]);
    }
  };

  return (
    <aside className="bg-white rounded-2xl shadow p-4 w-full sticky top-4">
      {hasActiveFilters && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="w-full mb-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
        >
          Xóa tất cả bộ lọc
        </button>
      )}

      {categories.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg text-gray-800 font-semibold mb-3">Danh mục</h2>
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`cat-${category.id}`}
                  checked={selectedCategories.includes(category.slug || '')}
                  onChange={() => toggleCategory(category.slug || '')}
                  className="accent-green-600 w-4 h-4 cursor-pointer"
                />
                <label htmlFor={`cat-${category.id}`} className="text-gray-700 cursor-pointer">
                  {category.name}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {categories.length > 0 && brands.length > 0 && <Separator className="my-4" />}

      {brands.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg text-gray-800 font-semibold mb-3">Thương hiệu</h2>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {brands.map((brand) => (
              <li key={brand.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`brand-${brand.id}`}
                  checked={selectedBrands.includes(brand.slug || '')}
                  onChange={() => toggleBrand(brand.slug || '')}
                  className="accent-green-600 w-4 h-4 cursor-pointer"
                />
                <label htmlFor={`brand-${brand.id}`} className="text-gray-700 cursor-pointer">
                  {brand.name}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {brands.length > 0 && <Separator className="my-4" />}

      <div>
        <h2 className="text-lg text-gray-800 font-semibold mb-3">Giá cả</h2>
        <ul className="space-y-2">
          {priceRanges.map((range) => (
            <li key={range.value} className="flex items-center gap-2">
              <input
                type="radio"
                name="price"
                id={`price-${range.value}`}
                value={range.value}
                checked={selectedPrice === range.value}
                onChange={() => onPriceChange(range.value)}
                className="accent-green-600 w-4 h-4 cursor-pointer"
              />
              <label htmlFor={`price-${range.value}`} className="text-gray-700 cursor-pointer">
                {range.label}
              </label>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

// ============ Main AllProductsClient Component ============

export default function AllProductsClient({
  initialProducts,
  initialPage,
  totalPages,
  total,
  brands,
  categories,
}: AllProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("categories")?.split(",").filter(Boolean) || []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get("brands")?.split(",").filter(Boolean) || []
  );
  const [selectedPrice, setSelectedPrice] = useState<string>(
    searchParams.get("priceRange") || ""
  );

  const updateFilters = (
    cats: string[],
    brandsFilter: string[],
    price: string
  ) => {
    const params = new URLSearchParams();
    
    if (cats.length > 0) params.set("categories", cats.join(","));
    if (brandsFilter.length > 0) params.set("brands", brandsFilter.join(","));
    if (price) params.set("priceRange", price);
    
    router.push(`/all-products?${params.toString()}`);
  };

  const handleCategoryChange = (cats: string[]) => {
    setSelectedCategories(cats);
    updateFilters(cats, selectedBrands, selectedPrice);
  };

  const handleBrandChange = (brandsFilter: string[]) => {
    setSelectedBrands(brandsFilter);
    updateFilters(selectedCategories, brandsFilter, selectedPrice);
  };

  const handlePriceChange = (price: string) => {
    setSelectedPrice(price);
    updateFilters(selectedCategories, selectedBrands, price);
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedPrice('');
    router.push('/all-products');
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/all-products?${params.toString()}`);
  };

  return (
    <div className="px-4 md:px-12 py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Tất cả sản phẩm
          {total > 0 && <span className="text-gray-500 text-lg ml-2">({total})</span>}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Sidebar */}
        <div className="col-span-1">
          <CategorySidebar
            categories={categories}
            brands={brands}
            selectedCategories={selectedCategories}
            selectedBrands={selectedBrands}
            selectedPrice={selectedPrice}
            onCategoryChange={handleCategoryChange}
            onBrandChange={handleBrandChange}
            onPriceChange={handlePriceChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Products Grid */}
        <div className="col-span-1 md:col-span-4">
          {initialProducts.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Không tìm thấy sản phẩm"
              description="Không có sản phẩm nào khớp với bộ lọc của bạn. Hãy thử điều chỉnh bộ lọc."
              action={
                <Button onClick={() => router.push("/all-products")}>
                  Xóa bộ lọc
                </Button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {initialProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    slug={product.slug}
                    variantSlug={product.default_variant?.variant_slug}
                    image={product.default_variant?.main_image || "/placeholder.png"}
                    title={product.name}
                    price={product.default_variant?.price || 0}
                    oldPrice={product.default_variant?.original_price}
                    sold={0}
                    category={product.category?.name}
                    categorySlug={product.category?.slug || undefined}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(initialPage - 1)}
                    disabled={initialPage <= 1}
                  >
                    Trước
                  </Button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={page === initialPage ? "default" : "outline"}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(initialPage + 1)}
                    disabled={initialPage >= totalPages}
                  >
                    Sau
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
