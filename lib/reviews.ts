// /lib/reviews.ts
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc, query, collection, orderBy, limit, getDocs, startAfter } from 'firebase/firestore';

export type Review = { id: string; name: string; stars: number; text: string; photoURL?: string; createdAt: any; };
export type Summary = { reviewCount: number; avgStars: number; recent: Review[] };

export async function getSummary(productId: string): Promise<Summary> {
    const snap = await getDoc(doc(db, 'summaries', productId));
    
    // Return a default summary if no document exists
    if (!snap.exists()) {
      return {
        reviewCount: 0,
        avgStars: 0,
        recent: []
      };
    }
    
    return snap.data() as Summary;
  }

export async function getReviews(productId: string, lastCreatedAt?: any): Promise<Review[]> {
  let q = query(
    collection(db, 'reviews', productId),
    orderBy('createdAt', 'desc'),
    limit(10)
  );
  if (lastCreatedAt) q = query(q, startAfter(lastCreatedAt));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}
