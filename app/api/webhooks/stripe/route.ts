// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { db } from "@/lib/firebaseConfig";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";

// Initialize Stripe with the API version specified in your Stripe dashboard
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    // Handle the event
    switch (event.type) {
        case "payment_intent.succeeded":
            const pi = event.data.object as Stripe.PaymentIntent;
            await handlePaymentIntentSucceeded(pi);
            break;
        case "payment_intent.payment_failed":
            const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
            // Log failure and potentially store in database for analytics
            console.log(`Payment failed: ${failedPaymentIntent.id}, reason: ${failedPaymentIntent.last_payment_error?.message || 'Unknown'}`);
            break;
        case "payment_intent.requires_action":
            // Handle cases requiring additional authentication
            const actionRequiredPI = event.data.object as Stripe.PaymentIntent;
            console.log(`Payment requires action: ${actionRequiredPI.id}`);
            break;
        default:
            console.log(`Unhandled event type: ${event.type}`);
        }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentIntentSucceeded(pi: Stripe.PaymentIntent) {
  try {
    const userId = pi.metadata.userId || "guest-user";
    const items = pi.metadata.cartItems ? JSON.parse(pi.metadata.cartItems) : [];
    const orderItems = pi.metadata.orderItems ? JSON.parse(pi.metadata.orderItems) : [];
    
    const orderData = {
      orderId: pi.id,
      customerId: pi.customer?.toString() || null,
      userId,
      orderDate: new Date().toISOString(),
      amount: { 
        total: pi.amount / 100,
        captured: (pi.amount_received || 0) / 100 
      },
      currency: pi.currency,
      paymentStatus: pi.status,
      items: items.length > 0 ? items : orderItems,
      paymentMethod: pi.payment_method_types,
      shippingDetails: pi.shipping || null,
      metadata: pi.metadata,
      createdAt: new Date().toISOString(),
    };
    
    // Save to appropriate location based on user status
    if (userId !== "guest-user") {
      // If user is logged in, save to their data/orders collection
      await setDoc(
        doc(db, `users/${userId}/data/orders/${pi.id}`),
        orderData
      );
      console.log(`Order saved to user's collection: ${pi.id}`);
    } else {
      // If no user (guest checkout), save to noUser data/orders collection
      await setDoc(
        doc(db, `users/noUser/data/orders/${pi.id}`),
        orderData
      );
      console.log(`Order saved to guest collection: ${pi.id}`);
    }
    
    // Still maintain a global orders collection for easier lookup
    await addDoc(collection(db, "orders"), orderData);
    
    console.log(`Order saved successfully: ${pi.id}`);
  } catch (error) {
    console.error("Error saving order to Firestore:", error);
    throw error;
  }
}