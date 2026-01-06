import React, { Suspense } from "react";
import AllProductsClient from "./AllProductsClient";
import { getProducts, getBrands, getCategories } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default async function AllProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const categories = params.categories ? (params.categories as string).split(",") : undefined;
  const brands = params.brands ? (params.brands as string).split(",") : undefined;
  const priceRange = params.priceRange as string | undefined;
  const search = params.search as string | undefined;

  // Map price range to min/max
  let minPrice: number | undefined;
  let maxPrice: number | undefined;
  if (priceRange) {
    const [min, max] = priceRange.split('-').map(Number);
    minPrice = min;
    maxPrice = max === 999999999 ? undefined : max;
  }

  // Fetch data in parallel
  const [productsData, brandsData, categoriesData] = await Promise.all([
    getProducts({ categories, brands, minPrice, maxPrice, search, isActive: true }, page, 20),
    getBrands(),
    getCategories(),
  ]);

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AllProductsClient
        initialProducts={productsData.data}
        initialPage={page}
        totalPages={productsData.pagination.totalPages}
        total={productsData.pagination.total}
        brands={brandsData}
        categories={categoriesData}
      />
    </Suspense>
  );
}

function LoadingSkeleton() {
  return (
    <div className="px-4 md:px-12 py-12">
      <Skeleton className="h-8 w-64 mb-6" />
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-1">
          <Skeleton className="h-96 w-full" />
        </div>
        <div className="col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}



