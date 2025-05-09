// app/all/page.tsx
import { Suspense } from 'react';
import type { Metadata } from 'next';
import ProductsClient from './ProductsClient';

// only the fields we actually use
type GenerateMetaProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export async function generateMetadata(
  { searchParams }: GenerateMetaProps
): Promise<Metadata> {
  const raw       = searchParams?.subCategory ?? [];
  const subs      = Array.isArray(raw) ? raw : [raw];
  const readable  = subs.length
    ? subs.map(s => s[0].toUpperCase() + s.slice(1)).join(', ')
    : 'All Pieces';

  return {
    title:       `${readable} Collection`,
    description: `Explore ${readable.toLowerCase()} crafted from premium fabrics by NOIR Clothing.`,
    alternates: {
      canonical:
        '/all' + (subs.length ? `?subCategory=${subs.join('&subCategory=')}` : '')
    }
  };
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsClient />
    </Suspense>
  );
}