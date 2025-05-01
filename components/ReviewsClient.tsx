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
    <section className="mt-12 py-4">
      <h2 className="font-medium text-lg">Reviews ({summary.reviewCount ?? 0})</h2>
      <div className="flex items-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
            <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                fill="currentColor" 
                viewBox="0 0 24 24" 
                key={i}
                className={`size-6
                ${i < Math.round(summary.avgStars)
                    ? 'text-yellow-500'
                    : 'text-gray-200'}
                `}
            >
                <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z"/>
            </svg> 
        ))}
        <span>{summary.avgStars.toFixed(1) ?? 0}</span>
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