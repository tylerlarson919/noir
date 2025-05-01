// /components/ReviewsClient.tsx

'use client';
import { useState } from 'react';
import { getReviews, Review, Summary } from '@/lib/reviews';

export default function ReviewsClient({
  productId,
  initialSummary
}: { productId: string; initialSummary: Summary; }) {
  const [summary, setSummary] = useState(initialSummary);
  const [reviews, setReviews] = useState<Review[]>(initialSummary.recent);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadMore = () => {
    setLoading(true);
    getReviews(productId, reviews[reviews.length - 1]?.createdAt)
      .then((more) => {
        setReviews((r) => [...r, ...more]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const submitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const form = new FormData(e.currentTarget);
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          name: form.get('name'),
          stars: Number(form.get('stars')),
          text: form.get('text'),
          photoURL: form.get('photo') || null,
        }),
      });
      window.location.reload();
    } catch {
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
      e.currentTarget.reset();
    }
  };


  return (
    <section className="mt-12">
      <h2 className="font-medium text-lg">Reviews ({summary.reviewCount})</h2>
      <div className="flex items-center gap-2">
        <span className="text-yellow-500">{'★'.repeat(Math.round(summary.avgStars))}</span>
        <span>{summary.avgStars.toFixed(1)}</span>
      </div>
      {reviews.map(r => (
        <div key={r.id} className="mt-4">
          <p className="font-semibold">{r.name} <span>({r.stars}★)</span></p>
          <p className="text-sm">{r.text}</p>
        </div>
      ))}
      {!showAll && summary.reviewCount > reviews.length && (
        <button className="underline mt-4" onClick={() => { setShowAll(true); loadMore(); }}>
          See all reviews
        </button>
      )}
      {loading && <p>Loading…</p>}

      <form onSubmit={submitReview} className="mt-8 flex flex-col gap-2">
        <input name="name" placeholder="Your name" required className="border p-2" />
        <select name="stars" required className="border p-2">
          {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
        </select>
        <textarea name="text" placeholder="Your review" required className="border p-2" />
        <input name="photo" placeholder="Image URL (optional)" className="border p-2" />
        <button 
          type="submit" 
          className="bg-black text-white py-2 mt-2 disabled:bg-gray-400"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </section>
  );
}