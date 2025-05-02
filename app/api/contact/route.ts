// /api/contact/route.ts

import { NextResponse } from "next/server";
import { db } from '@/lib/firebaseAdmin';
// Remove the client SDK imports and use Admin SDK methods

export async function POST(req: Request) {
  const { name, email, message, recaptchaToken } = await req.json();
  const secret = process.env.RECAPTCHA_SECRET_KEY!;
  const res = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${secret}&response=${recaptchaToken}`,
    }
  );
  const data = await res.json();
  if (!data.success) {
    return NextResponse.json({ error: "Recaptcha failed" }, { status: 400 });
  }
  
  try {
    // Use the Admin SDK methods to add a document
    await db.collection('contacts').add({
      name,
      email,
      message,
      createdAt: new Date(), // or use admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }
  return NextResponse.json({ success: true });
}