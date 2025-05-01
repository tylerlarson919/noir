// /components/Reviews.tsx

// Server wrapper: fetches summary & injects JSON-LD
import ReviewsClient from './ReviewsClient';
import { getSummary, Summary } from '@/lib/reviews';
import { Metadata } from 'next';

export default async function Reviews({ productId }: {productId: string}) {
  const summary = await getSummary(productId);

  // JSON-LD for Google
  const ld = {
    "@context":"https://schema.org",
    "@type":"Product",
    "aggregateRating": {
      "@type":"AggregateRating",
      ratingValue: summary.avgStars,
      reviewCount: summary.reviewCount
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <ReviewsClient productId={productId} initialSummary={summary} />
    </>
  )
}
