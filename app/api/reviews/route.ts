// /app/api/reviews/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    const { productId, name, stars, text, photoURL } = await request.json();
    
    // Validate the input
    if (!productId || !name || !stars || !text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Add the review
    const reviewData = {
      name,
      stars: Number(stars),
      text,
      photoURL: photoURL || null,
      createdAt: FieldValue.serverTimestamp()
    };
    
    // Add the review to Firestore using Admin SDK methods (not client SDK)
    const reviewsRef = db.collection('reviews').doc(productId).collection('reviews');
    await reviewsRef.add(reviewData);
    
    // Calculate summary using Admin SDK methods
    const querySnapshot = await reviewsRef.orderBy('createdAt', 'desc').get();

    const count = querySnapshot.size;
    let total = 0;
    const recent: any[] = [];

    querySnapshot.docs.forEach((d, i) => {
      const dt = d.data();
      total += dt.stars;
      if (i < 3) recent.push({...dt, id: d.id});
    });

    const avg = Math.round((total/count)*10)/10;
    
    // Update summary document using Admin SDK methods
    await db.collection('summaries').doc(productId).set({
      reviewCount: count,
      avgStars: avg,
      recent,
    });

    // Revalidate the product page
    revalidatePath(`/product/${productId}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding review:', error);
    return NextResponse.json({ error: 'Failed to add review' }, { status: 500 });
  }
}