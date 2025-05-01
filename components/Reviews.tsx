// /components/Reviews.tsx

// Server wrapper: fetches summary & injects JSON-LD
import ReviewsClient from './ReviewsClient';
import { getSummary } from '@/lib/reviews';

export default async function Reviews({ productId }: {productId: string}) {
    try {
      const summary = await getSummary(productId);
    
      // Only create JSON-LD if there are reviews
      const ld = summary.reviewCount > 0 ? {
        "@context": "https://schema.org",
        "@type": "Product",
        "aggregateRating": {
          "@type": "AggregateRating",
          ratingValue: summary.avgStars,
          reviewCount: summary.reviewCount
        }
      } : null;
    
      return (
        <>
          {ld && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
            />
          )}
          <ReviewsClient productId={productId} initialSummary={summary} />
        </>
      );
    } catch (error) {
      console.error("Error loading reviews:", error);
      // Return a fallback UI
      return <ReviewsClient productId={productId} initialSummary={{reviewCount: 0, avgStars: 0, recent: []}} />;
    }
  }