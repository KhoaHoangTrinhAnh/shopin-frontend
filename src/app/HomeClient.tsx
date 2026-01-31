"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product, Category, Brand } from "@/types/database";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { EmptyState } from "@/components/EmptyState";
import { Package, Sparkles } from "lucide-react";

// ============ BannerCarousel Component ============
const banners = [
  {
    id: 1,
    image: "https://cdn-imgix.headout.com/media/images/c9db3cea62133b6a6bb70597326b4a34-388-dubai-img-worlds-of-adventure-tickets-01.jpg?auto=format&w=1222.4&h=687.6&q=90&fit=crop&ar=16%3A9&crop=faces",
    alt: "Banner 1",
  },
  {
    id: 2,
    image: "https://cdn-imgix.headout.com/media/images/c9db3cea62133b6a6bb70597326b4a34-388-dubai-img-worlds-of-adventure-tickets-01.jpg?auto=format&w=1222.4&h=687.6&q=90&fit=crop&ar=16%3A9&crop=faces",
    alt: "Banner 2",
  },
  {
    id: 3,
    image: "https://cdn-imgix.headout.com/media/images/c9db3cea62133b6a6bb70597326b4a34-388-dubai-img-worlds-of-adventure-tickets-01.jpg?auto=format&w=1222.4&h=687.6&q=90&fit=crop&ar=16%3A9&crop=faces",
    alt: "Banner 3",
  },
];

function BannerCarousel() {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const slideCount = banners.length;

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slideCount);
    }, 3500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, slideCount]);

  return (
    <div>
      <div className="box-border w-full h-[400px] rounded-xl overflow-hidden bg-gray-100">
        <div className="relative w-full h-full">
          <div
            className="absolute top-0 left-0 h-full flex transition-transform duration-500 ease-in-out"
            style={{
              width: `${banners.length * 100}%`,
              transform: `translateX(-${current * (100 / banners.length)}%)`,
            }}
          >
            {banners.map((banner, idx) => (
              <div
                key={banner.id}
                className="relative"
                style={{
                  width: `${100 / banners.length}%`,
                  height: "100%",
                  flexShrink: 0,
                }}
              >
                <Image
                  src={banner.image}
                  alt={banner.alt}
                  fill
                  className="object-cover rounded-lg transition-all duration-500"
                  priority={idx === current}
                  sizes="(max-width: 1200px) 100vw, 1200px"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-3">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`mx-2 w-3 h-3 rounded-full border-2 border-green-700 transition-all duration-300 ${
              current === idx ? "bg-green-700" : "bg-white"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// ============ CategoryFilter Component ============
interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`
            border px-4 py-2 rounded-full transition
            ${selected === cat
              ? "bg-green-600 text-white border-green-600"
              : "bg-white text-gray-700 border-gray-300 hover:bg-green-100"}
          `}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

// ============ BestSellingList Component ============
interface BestSellingListProps {
  products: Product[];
  categories: Category[];
}

function BestSellingList({ products, categories: allCategories }: BestSellingListProps) {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  const categories = useMemo(() => {
    return ["Tất cả", ...allCategories.map(c => c.name).sort()];
  }, [allCategories]);

  const filteredProducts =
    selectedCategory === "Tất cả"
      ? products
      : products.filter((p) => p.category?.name === selectedCategory);

  return (
    <section>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Sản phẩm bán chạy</h2>

      {products.length > 0 && (
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      )}

      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Không có sản phẩm"
          description="Không tìm thấy sản phẩm nào trong danh mục này"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-6 gap-x-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              slug={product.slug}
              variantSlug={product.default_variant?.variant_slug || product.default_variant?.id}
              image={product.default_variant?.main_image || '/placeholder.png'}
              title={product.name}
              price={product.default_variant?.price || 0}
              oldPrice={product.default_variant?.original_price}
              sold={0}
              category={product.category?.name || ''}
              categorySlug={product.category?.slug || undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ============ FeaturedProducts Component ============
interface FeaturedProductsProps {
  products: Product[];
  categories: Category[];
}

function FeaturedProducts({ products, categories }: FeaturedProductsProps) {
  const featuredItems = products.slice(0, 3).map((product, idx) => ({
    id: product.id,
    slug: product.slug,
    title: product.name,
    description: product.description || `Khám phá ${product.name} với công nghệ tiên tiến`,
    image: product.default_variant?.main_image || '/placeholder.png',
    category: product.category?.name,
  }));

  if (featuredItems.length < 3 && categories.length > 0) {
    const remainingSlots = 3 - featuredItems.length;
    categories.slice(0, remainingSlots).forEach((category) => {
      featuredItems.push({
        id: category.id.toString(),
        slug: category.slug || '',
        title: category.name,
        description: `Khám phá bộ sưu tập ${category.name} của chúng tôi`,
        image: '/placeholder.png',
        category: category.name,
      });
    });
  }

  if (featuredItems.length === 0) {
    return (
      <section className="px-4 md:px-14">
        <EmptyState
          icon={Sparkles}
          title="Chưa có sản phẩm nổi bật"
          description="Hãy quay lại sau để khám phá những sản phẩm tuyệt vời"
        />
      </section>
    );
  }

  return (
    <section className="px-4 md:px-14">
      <div className="flex flex-col items-center">
        <p className="text-2xl text-gray-800 font-semibold">Sản phẩm nổi bật</p>
        <div className="w-28 h-0.5 bg-orange-600 mt-2" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-14 mt-12 place-items-center">
        {featuredItems.map((item) => (
          <div
            key={item.id}
            className="relative group w-full max-w-[350px] h-[440px] overflow-hidden rounded-lg shadow-md"
          >
            <div className="relative w-full h-full">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover group-hover:brightness-75 transition duration-300"
              />
            </div>
            <div className="group-hover:-translate-y-4 transition duration-300 absolute bottom-8 left-8 text-white space-y-2">
              <p className="font-medium text-xl lg:text-2xl">{item.title}</p>
              <p className="text-sm lg:text-base leading-5 max-w-60">
                {item.description?.substring(0, 80)}
                {(item.description?.length || 0) > 80 ? '...' : ''}
              </p>
              <Button asChild className="bg-orange-600 hover:bg-orange-700">
                <Link href={`/product/${item.slug}`}>
                  Xem chi tiết
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============ ShopByBrands Component ============
const FEATURED_BRANDS = ['apple', 'asus', 'dell', 'garmin', 'hp', 'huawei', 'lenovo', 'samsung'];

function ShopByBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000/api'}/brands`);
        if (!response.ok) throw new Error('Failed to fetch brands');
        
        const data = await response.json();
        const featuredBrands = FEATURED_BRANDS
          .map(slug => data.find((b: Brand) => b.slug === slug))
          .filter(Boolean) as Brand[];
        
        setBrands(featuredBrands);
      } catch (error) {
        console.error('Error fetching brands:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const handleBrandClick = (slug: string) => {
    if (slug === 'apple') {
      return '/all-products?brands=apple,iphone,macbook';
    }
    return `/all-products?brands=${slug}`;
  };

  return (
    <section className="w-full box-border mx-auto bg-[#f5f7fa] p-5 lg:p-7 rounded-md">
      <div className="flex items-center gap-5 justify-between mb-10">
        <h2 className="font-semibold text-gray-800 text-2xl">Shop By Brands</h2>
        <Link
          href="/all-products"
          className="text-sm font-semibold tracking-wide hover:text-shop_btn_dark_green hoverEffect"
        >
          View all
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="flex items-center gap-2 justify-between flex-wrap">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={handleBrandClick(brand.slug || '')}
              className="bg-white w-36 h-24 flex items-center justify-center rounded-md overflow-hidden hover:shadow-lg shadow-shop_dark_green/20 hoverEffect p-4"
            >
              {brand.logo_url ? (
                <Image
                  alt={`${brand.name} Logo`}
                  src={brand.logo_url}
                  width={100}
                  height={60}
                  className="object-contain max-w-full max-h-full"
                  loading="lazy"
                />
              ) : (
                <div className="text-gray-800 font-semibold text-sm text-center px-2">
                  {brand.name}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16 p-2 shadow-sm shadow-gray-300 py-5">
        <div className="flex items-center gap-3 group">
          <span className="inline-flex text-gray-800 transition-transform duration-300 group-hover:scale-90 group-hover:text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path>
              <path d="M15 18H9"></path>
              <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path>
              <circle cx="17" cy="18" r="2"></circle>
              <circle cx="7" cy="18" r="2"></circle>
            </svg>
          </span>
          <div className="text-sm text-gray-800">
            <p className="font-bold capitalize">Free Delivery</p>
            <p className="text-sm text-gray-500">Free shipping over $100</p>
          </div>
        </div>

        <div className="flex items-center gap-3 group">
          <span className="inline-flex text-gray-800 transition-transform duration-300 group-hover:scale-90 group-hover:text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="5" cy="6" r="3"></circle>
              <path d="M12 6h5a2 2 0 0 1 2 2v7"></path>
              <path d="m15 9-3-3 3-3"></path>
              <circle cx="19" cy="18" r="3"></circle>
              <path d="M12 18H7a2 2 0 0 1-2-2V9"></path>
              <path d="m9 15 3 3-3 3"></path>
            </svg>
          </span>
          <div className="text-sm text-gray-800">
            <p className="font-bold capitalize">Free Return</p>
            <p className="text-sm text-gray-500">Free shipping over $100</p>
          </div>
        </div>

        <div className="flex items-center gap-3 group">
          <span className="inline-flex text-gray-800 transition-transform duration-300 group-hover:scale-90 group-hover:text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z"></path>
              <path d="M21 16v2a4 4 0 0 1-4 4h-5"></path>
            </svg>
          </span>
          <div className="text-sm text-gray-800">
            <p className="font-bold capitalize">Customer Support</p>
            <p className="text-sm text-gray-500">Friendly 24/7 customer support</p>
          </div>        </div>

        <div className="flex items-center gap-3 group">
          <span className="inline-flex text-gray-800 transition-transform duration-300 group-hover:scale-90 group-hover:text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
          </span>
          <div className="text-sm text-gray-800">
            <p className="font-bold capitalize">Money Back guarantee</p>
            <p className="text-sm text-gray-500">Quality checked by our team</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ SubscribeSection Component ============
function SubscribeSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null, text: string }>({ type: null, text: "" });

  const handleSubscribe = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ type: 'error', text: 'Vui lòng nhập email hợp lệ' });
      return;
    }

    setLoading(true);
    setMessage({ type: null, text: "" });

    setTimeout(() => {
      setMessage({ type: 'success', text: 'Đăng ký thành công! Cảm ơn bạn đã đăng ký nhận tin.' });
      setEmail("");
      setLoading(false);
      
      setTimeout(() => setMessage({ type: null, text: "" }), 5000);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubscribe();
    }
  };

  return (
    <div className="flex flex-col box-border items-center justify-center text-center space-y-2 pt-8 pb-14">
      <h1 className="md:text-4xl text-2xl text-gray-800 font-medium">
        Subscribe now &amp; get 20% off
      </h1>
      <p className="md:text-base text-gray-500/80 pb-8">
        Join our newsletter to receive exclusive deals, updates, and special offers.
      </p>
      <div className="max-w-2xl w-full">
        <div className="flex items-center justify-between w-full md:h-14 h-12">
          <input
            className="border border-gray-500/30 rounded-md h-full border-r-0 outline-none w-full rounded-r-none px-3 text-gray-500"
            type="email"
            placeholder="Enter your email id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <button 
            className="md:px-12 px-8 h-full text-white bg-orange-600 rounded-md rounded-l-none hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Subscribe'}
          </button>
        </div>
        {message.type && (
          <div className={`mt-3 text-sm ${
            message.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ Main HomePage Component ============
interface HomePageProps {
  bestSellingProducts: Product[];
  featuredProducts: Product[];
  categories: Category[];
}

export default function HomePage({ bestSellingProducts, featuredProducts, categories }: HomePageProps) {
  return (
    <div className="box-border bg-white w-screen h-auto px-4 md:px-[128px] py-[24px] flex flex-col gap-[56px]">
      <BannerCarousel />
      <BestSellingList products={bestSellingProducts} categories={categories} />
      <div className="flex justify-center"> 
        <Button asChild variant="outline" size="lg">
          <Link href="/all-products">
            Xem thêm sản phẩm
          </Link>
        </Button>
      </div>
      <FeaturedProducts products={featuredProducts} categories={categories} />
      <ShopByBrands />
      <SubscribeSection />
    </div>
  );
}
