import { notFound } from 'next/navigation';
import { getProduct, getProducts } from '@/lib/api';
import ProductDetailClient from './ProductDetailClient';

interface ProductPageProps {
  params: Promise<{ category: string; slug: string }>;
}

export default async function ProductPage(props: ProductPageProps) {
  const params = await props.params;
  
  // Try to get product by slug (handles both product slug and variant slug)
  const product = await getProduct(params.slug);
  
  if (!product || !product.is_active) {
    notFound();
  }

  // Verify category matches (optional but good for SEO)
  if (product.category?.slug !== params.category) {
    notFound();
  }

  // Check if the slug is a variant_slug to pre-select that variant
  let initialVariantSlug: string | undefined = undefined;
  if (product.variants) {
    const matchingVariant = product.variants.find(v => v.variant_slug === params.slug);
    if (matchingVariant) {
      initialVariantSlug = matchingVariant.variant_slug;
    }
  }

  // Get related products from same category
  const relatedProductsData = product.category_id
    ? await getProducts({ category: product.category_id.toString() }, 1, 4)
    : { data: [] };

  return (
    <ProductDetailClient 
      product={product}
      relatedProducts={relatedProductsData.data}
      initialVariantSlug={initialVariantSlug}
    />
  );
}

// Generate metadata for SEO
export async function generateMetadata(props: ProductPageProps) {
  const params = await props.params;
  const product = await getProduct(params.slug);
  
  if (!product) {
    return {
      title: 'Không tìm thấy sản phẩm - Shopin',
    };
  }

  const meta = product.meta || {};
  
  return {
    title: meta.meta_title || `${product.name} - Shopin`,
    description: meta.meta_description || product.description || `Mua ${product.name} chính hãng, giá tốt nhất tại Shopin`,
    keywords: meta.meta_keywords,
    openGraph: {
      title: product.name,
      description: product.description || '',
      images: product.default_variant?.main_image ? [product.default_variant.main_image] : [],
    },
  };
}
