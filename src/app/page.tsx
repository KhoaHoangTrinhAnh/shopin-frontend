import React from "react";
import HomeClient from "./HomeClient";
import { getBestSellingProducts, getFeaturedProducts, getCategories } from "@/lib/api";

export default async function Home() {
  // Fetch data in parallel
  const [bestSellingProducts, featuredProducts, categories] = await Promise.all([
    getBestSellingProducts(8),
    getFeaturedProducts(8),
    getCategories(),
  ]);

  return (
    <HomeClient 
      bestSellingProducts={bestSellingProducts}
      featuredProducts={featuredProducts}
      categories={categories}
    />
  );
}
