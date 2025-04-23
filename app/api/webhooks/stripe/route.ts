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
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    // Handle the event
    switch (event.type) {
      case "checkout.session.async_payment_succeeded":
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        await handleSuccessfulCheckout(session);
        break;
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment succeeded: ${paymentIntent.id}`);
        break;
      case "payment_intent.payment_failed":
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed: ${failedPaymentIntent.id}`);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

async function handleSuccessfulCheckout(session: Stripe.Checkout.Session) {
    try {
      // Get customer ID and metadata from the session
      const customerId = session.customer as string;
      const userId = session.metadata?.userId; // You'll need to pass userId in metadata when creating checkout session
      const cartItems = session.metadata?.cartItems ? JSON.parse(session.metadata.cartItems) : [];
  
      // Fetch line items to get detailed product information
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      
      // Use type assertion to access properties that might not be in the TypeScript definitions
      const sessionData = session as any;
  
      // Create order data
      const orderData = {
        orderId: session.id,
        customerId,
        userId: userId || 'guest-user', // Fallback for guests
        orderDate: new Date().toISOString(),
        amount: {
          total: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents to dollars
          subtotal: session.amount_subtotal ? session.amount_subtotal / 100 : 0,
          details: sessionData.total_details || {
            amount_discount: 0,
            amount_shipping: 0,
            amount_tax: 0
          }
        },
        currency: session.currency,
        paymentStatus: session.payment_status,
        sessionStatus: session.status,
        paymentMethodTypes: session.payment_method_types,
        items: cartItems,
        lineItems: lineItems.data,
        // Use the type assertion to access the shipping_details property
        shippingDetails: sessionData.shipping_details || null,
        billingDetails: session.customer_details,
        createdAt: new Date().toISOString(),
        stripeUrl: sessionData.url,
        expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
        metadata: session.metadata || {}
      };
  
      // Save order to Firestore if we have a userId
      if (userId) {
        await setDoc(
          doc(db, `users/${userId}/data/orders/${session.id}`),
          orderData
        );
        console.log(`Order saved to Firestore for user ${userId}`);
      } else {
        // For guest checkouts, store in a general orders collection
        await addDoc(collection(db, 'orders'), orderData);
        console.log('Guest order saved to Firestore');
      }
  
      return true;
    } catch (error) {
      console.error('Error saving order to Firestore:', error);
      throw error;
    }
  }