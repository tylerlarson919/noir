// app/all/page.tsx
import { Suspense } from 'react';
import type { Metadata } from 'next';
import ProductsClient from './ProductsClient';

/* -------------------------------------------------------------------------- */
/* 1. Make our local type compatible with what Next.js now expects.           */
/*    `searchParams` can be either the object itself *or* a Promise of it.    */
/* -------------------------------------------------------------------------- */
type SearchParams =
  | Record<string, string | string[] | undefined>
  | Promise<Record<string, string | string[] | undefined>>;

  type GenerateMetaProps = {
    // matches what Next.js’ PageProps expects: a *promise* of the record
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
  };
/* -------------------------------------------------------------------------- */
/* 2. Handle both the plain-object and Promise cases with a single `await`.   */
/* -------------------------------------------------------------------------- */
export async function generateMetadata(
  { searchParams }: GenerateMetaProps
): Promise<Metadata> {
  const params =
    searchParams ? await searchParams : ({} as Record<string, string | string[] | undefined>);

  const raw  = params.subCategory ?? [];
  const subs = Array.isArray(raw) ? raw : [raw];

  const readable = subs.length
    ? subs.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')
    : 'All Pieces';

  return {
    title: `${readable} Collection`,
    description: `Explore ${readable.toLowerCase()} crafted from premium fabrics by NOIR Clothing.`,
    alternates: {
      canonical:
        '/all' + (subs.length ? `?subCategory=${subs.join('&subCategory=')}` : '')
    }
  };
}

/* -------------------------------------------------------------------------- */
/* 3. Page component – unchanged.                                             */
/* -------------------------------------------------------------------------- */
export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsClient />
    </Suspense>
  );
}