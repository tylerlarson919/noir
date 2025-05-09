// /all/page.tsx
import { Suspense } from "react";
import ProductsClient from "./ProductsClient";
import type { Metadata } from 'next';

type GenerateMetaProps = {
  searchParams: Record<string, string | string[]>;
};

export async function generateMetadata(
  { searchParams }: GenerateMetaProps
): Promise<Metadata> {

 /* normalise ?subCategory=… (could be string OR string[]) */
  const raw      = searchParams.subCategory ?? [];
  const subs     = Array.isArray(raw) ? raw : [raw];
  const readable = subs.length
    ? subs.map(s => s[0].toUpperCase() + s.slice(1)).join(', ')
    : 'All Pieces';

  return {
    title:       `${readable} Collection`,
    description: `Explore ${readable.toLowerCase()} crafted from premium fabrics by NOIR Clothing.`,
    alternates:  {
      canonical:
        '/all' + (subs.length ? `?subCategory=${subs.join('&subCategory=')}` : '')
    },
  };
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsClient />
    </Suspense>
  );
}
