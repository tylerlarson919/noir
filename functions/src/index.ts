/**
 * Firebase functions/src/index.ts file
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// Alternative version using Firebase Functions v2
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';

admin.initializeApp();
const db = admin.firestore();

exports.onNewReview = onDocumentCreated("reviews/{pid}/{rid}", async (event) => {
  const pid = event.params.pid;
  const colRef = db.collection(`reviews/${pid}`);
  
  const [querySnapshot, summaryDoc] = await Promise.all([
    colRef.get(),
    db.doc(`summaries/${pid}`).get()
  ]);

  let count = querySnapshot.size;
  let total = 0;
  let recent: any[] = [];
  
  querySnapshot.docs
    .sort((a, b) => b.data().createdAt.toMillis() - a.data().createdAt.toMillis())
    .forEach((d, i) => {
      const dt = d.data(); 
      total += dt.stars;
      if (i < 3) recent.push({ ...dt, id: d.id });
    });

  const avg = Math.round((total/count)*10)/10;
  await db.doc(`summaries/${pid}`).set({ reviewCount: count, avgStars: avg, recent });

  // trigger Next.js rebuild
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/revalidate?secret=${process.env.REVALIDATE_SECRET}&path=/product/${pid}`;
  await fetch(url);
});