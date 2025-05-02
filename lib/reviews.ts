// /lib/reviews.ts
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc, query, collection, orderBy, limit, getDocs, startAfter } from 'firebase/firestore';

export type Review = { id: string; name: string; stars: number; text: string; photoURL?: string; createdAt: any; };
export type Summary = { reviewCount: number; avgStars: number; recent: Review[]; };

export async function getSummary(productId: string): Promise<Summary> {
    const snap = await getDoc(doc(db, 'summaries', productId));
    if (!snap.exists()) {
      return {
        reviewCount: 0,
        avgStars:   0,
        recent:     [],
      };
    }
    const data = snap.data();
    // grab the Firestore‐returned map (keys are strings)
    const raw: Record<string, number> = (data.starCounts as any) || {};
    const recent = (data.recent as any[]).map(r => ({
      ...r,
      createdAt: r.createdAt?.toMillis() ?? null
    }));
    return {
      reviewCount: data.reviewCount,
      avgStars:    data.avgStars,
      recent,
    };
  }

    export async function getReviews(productId: string, lastCreatedAt?: any): Promise<Review[]> {
        try {
          let q = query(
            collection(db, 'reviews', productId, 'reviews'),
            orderBy('createdAt', 'desc'),
            limit(10)
          );
          if (lastCreatedAt) q = query(q, startAfter(lastCreatedAt));
          const snap = await getDocs(q);
          return snap.docs.map(d => {
            const data = d.data() as Omit<Review, 'id'>;
            return {
              id: d.id,
              name: data.name,
              stars: data.stars,
              text: data.text,
              photoURL: data.photoURL,
              createdAt: data.createdAt ? data.createdAt.toMillis() : null
            };
          });
        } catch (error) {
          console.error("Error fetching reviews:", error);
          return [];
        }
      }