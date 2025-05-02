// /components/ReviewsClient.tsx

'use client';
import { useState } from 'react';
import { getReviews, Review, Summary } from '@/lib/reviews';

export default function ReviewsClient({ productId, initialSummary }: { productId: string; initialSummary: Summary; }) {
  const [summary] = useState(initialSummary);
  const [reviews, setReviews] = useState<Review[]>(initialSummary.recent);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadMore = async () => {
    setLoading(true);
    try {
      const more = await getReviews(productId, reviews[reviews.length - 1]?.createdAt);
      setReviews(prev => [...prev, ...more]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
    <section className="max-w-xl mx-auto px-4 py-8 space-y-6">
      {/* Rating Summary */}
      <div className="text-center space-y-1">
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <svg
              key={star}
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 24 24"
              className={
                star <= Math.round(summary.avgStars)
                  ? 'text-yellow-500'
                  : 'text-gray-400 dark:text-gray-600'
              }
            >
              <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
            </svg>
          ))}
        </div>
        <p className="text-xl font-semibold">{summary.avgStars.toFixed(1)} / 5</p>
        <p className="text-sm text-gray-500">{summary.reviewCount} reviews</p>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map(r => (
          <div key={r.id} className="border p-4 rounded">
            <div className="flex justify-between items-center">
              <p className="font-medium">{r.name}</p>
              <p className="text-sm text-gray-500">{r.stars}★</p>
            </div>
            <p className="mt-2 text-gray-700">{r.text}</p>
          </div>
        ))}
      </div>

      {/* Load More */}
      {summary.reviewCount > reviews.length && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="text-blue-500 hover:underline disabled:text-gray-400"
          >
            {loading ? 'Loading...' : 'Load more reviews'}
          </button>
        </div>
      )}

      {/* Submit Form */}
      <form onSubmit={submitReview} className="space-y-4">
        <input
          name="name"
          placeholder="Your name"
          required
          className="w-full border-b border-gray-300 py-2 focus:outline-none placeholder-gray-400"
        />
        <select
          name="stars"
          required
          className="w-full border-b border-gray-300 py-2 focus:outline-none"
        >
          {[5, 4, 3, 2, 1].map(n => (
            <option key={n} value={n}>{n} Stars</option>
          ))}
        </select>
        <textarea
          name="text"
          placeholder="Your review"
          required
          rows={3}
          className="w-full border-b border-gray-300 py-2 focus:outline-none placeholder-gray-400"
        />
        <input
          name="photo"
          placeholder="Image URL (optional)"
          className="w-full border-b border-gray-300 py-2 focus:outline-none placeholder-gray-400"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="bg-black text-white py-2 px-4 rounded disabled:bg-gray-400"
          >
            {submitting ? 'Submitting...' : 'Submit review'}
          </button>
        </div>
      </form>
    </section>
  );
}