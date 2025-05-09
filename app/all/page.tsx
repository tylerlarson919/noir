// app/all/page.tsx
import { Suspense } from 'react';
import type { Metadata } from 'next';
import ProductsClient from './ProductsClient';

// Type the props for generateMetadata directly inline.
// Next.js passes an object with `params` and `searchParams` to this function.
// For a static route like '/all', `params` would be an empty object.
// `searchParams` will always be an object (possibly empty).
export async function generateMetadata(
  { searchParams }: {
    // params: { [key: string]: string | string[] }; // Route parameters, uncomment if used. For '/all', it's {}.
    searchParams: { [key: string]: string | string[] | undefined }; // URL search parameters
  }
): Promise<Metadata> {
  // `searchParams` is guaranteed to be an object by Next.js.
  // If `subCategory` is not in the URL, `searchParams.subCategory` will be undefined.
  const raw = searchParams.subCategory ?? [];
  const subs = Array.isArray(raw) ? raw : [raw];
  const readable = subs.length
    ? subs.map(s => s[0].toUpperCase() + s.slice(1)).join(', ')
    : 'All Pieces';

  return {
    title: `${readable} Collection`,
    description: `Explore ${readable.toLowerCase()} crafted from premium fabrics by NOIR Clothing.`,
    alternates: {
      canonical:
        `/all` + (subs.length ? `?subCategory=${subs.join('&subCategory=')}` : '')
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