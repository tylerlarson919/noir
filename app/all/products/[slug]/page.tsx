// /all/products/[slug]/page.tsx

import { notFound }      from 'next/navigation';
import type { Metadata } from 'next';
import ProductDetails    from '@/components/ProductDetails';
import {
  getProductBySlug,
  getProductsBySubCategory,
} from '@/lib/products';

/* -------- <head> data -------- */
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product not found' };

  const shareImage = product.images[0];

  return {
    title      : product.name,
    description: product.description,
    keywords   : [
      product.name,
      product.category,
      'noir clothing',
      'luxury streetwear',
    ],
    alternates : { canonical: `/all/products/${slug}` },
    twitter    : {
      card : 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [shareImage],
    },
  };
}

/* -------- page component -------- */
type PageProps = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: PageProps) {
  // ✅ Wait for the slug first
  const { slug } = await params;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const featuredProducts = (await getProductsBySubCategory(product.subCategory))
    .filter(p => p.slug !== product.slug)
    .slice(0, 4);

  return (
    <>
      <ProductDetails
        product={product}
        featuredProducts={featuredProducts}
      />

      {/* JSON-LD schema for rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type'   : 'Product',
            name        : product.name,
            description : product.description,
            image       : product.images,
            sku         : product.sku,
            brand       : { '@type': 'Brand', name: 'NOIR Clothing' },
            offers      : {
              '@type'       : 'Offer',
              url           : `https://noir-clothing.com/all/products/${product.slug}`,
              priceCurrency : 'USD',
              price         : product.price,
            },
          }),
        }}
      />
    </>
  );
}