// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { adminDb } from "@/lib/firebaseAdmin";
import * as admin from 'firebase-admin';

function sanitizeData(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeData(item));
  }
  
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    // Skip undefined or function values
    if (value === undefined || typeof value === 'function') continue;
    
    // Convert Date objects to ISO strings
    if (value instanceof Date) {
      sanitized[key] = value.toISOString();
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      // For primitive values
      sanitized[key] = value;
    }
  }
  return sanitized;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature") as string;

  console.log("Webhook received, verifying signature...");

  if (!signature) {
    console.error("Missing Stripe signature header");
    return NextResponse.json({ error: "Missing signature header" }, { status: 400 });
  }
  
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("Missing STRIPE_WEBHOOK_SECRET environment variable");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
    console.log(`✅ Webhook verified: ${event.type}`);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout session completed event received:", session.id);
        await handleCheckoutCompleted(session);
        break;
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment intent succeeded event received:", paymentIntent.id);
        // Add this line to process payment intents as well
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      case "payment_intent.payment_failed":
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed: ${failedPaymentIntent.id}, reason: ${failedPaymentIntent.last_payment_error?.message || 'Unknown'}`);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: error.message || "Error processing webhook" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log("Processing checkout session:", session.id);
    
    // Make sure session.id is valid
    if (!session.id) {
      throw new Error("Missing session ID for order");
    }
    
    // Retrieve line items to get complete order details
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    
    // Get expanded product data if needed
    const orderItems = await Promise.all(
      lineItems.data.map(async (item) => {
        // If you need more product details
        if (item.price?.product) {
          const productId = typeof item.price.product === 'string' 
            ? item.price.product 
            : item.price.product.id;
            
          const product = await stripe.products.retrieve(productId);
          
          return {
            productId: product.metadata.productId || product.id,
            name: product.name,
            price: (item.price.unit_amount || 0) / 100,
            quantity: item.quantity,
            size: product.metadata.size,
            color: {
              name: product.metadata.colorName,
              value: product.metadata.colorValue
            },
            image: product.images?.[0] || '',
          };
        }
        
        return {
          price: (item.price?.unit_amount || 0) / 100,
          quantity: item.quantity,
          description: item.description
        };
      })
    );

    const userEmail = session.customer_details?.email || '';
    const userId = session.metadata?.userId || "guest-user";
    const shippingAddress = (session as any).shipping_details?.address || 
                            session.customer_details?.address || {};
    console.log("session data (look for shipping addy): ", JSON.stringify(session, null, 2));
    
    const orderData = {
      orderId: session.id,
      customerId: session.customer?.toString() || null,
      userId,
      orderDate: new Date().toISOString(),
      amount: { 
        total: (session.amount_total || 0) / 100,
        subtotal: (session.amount_subtotal || 0) / 100,
      },
      currency: session.currency,
      paymentStatus: session.payment_status,
      items: orderItems,
      paymentMethod: session.payment_method_types,
      billingDetails: session.customer_details || null,
      metadata: Object.entries(session.metadata || {}).reduce((acc, [key, value]) => {
        // Only include string values and convert other types to strings
        acc[key] = typeof value === 'string' ? value : String(value);
        return acc;
      }, {} as Record<string, string>),
      email: session.customer_details?.email || '',
      createdAt: new Date().toISOString(),
      status: "pending",
      shippingAddress: {
        line1: shippingAddress.line1 || '',
        line2: shippingAddress.line2 || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        postal_code: shippingAddress.postal_code || '',
        country: shippingAddress.country || '',
      },
      shipping: {
        status: "preparing", // pending, preparing, shipped, delivered
        trackingNumber: null,
        carrier: null,
        updatedAt: new Date().toISOString(),
      },
    };
    const sanitizedOrderData = sanitizeData(orderData);

    // Improve error handling and logging for Firebase operations
    try {
      console.log("📝 Preparing order data for Firestore:", JSON.stringify(orderData, null, 2));
      
      // Use a batch with adminDb instead
      const batch = adminDb.batch();
      
      // Add to orders collection with explicit ID
      const orderRef = adminDb.collection('orders').doc(session.id);
      batch.set(orderRef, sanitizedOrderData);
      
      // Add to user orders if authenticated or has email
      if (userId !== "guest-user" || userEmail) {
        if (userId === "guest-user" && userEmail) {
          // Store the order in a way we can look it up later by email
          const guestOrderRef = adminDb.collection('users').doc('guest-user').collection('orders').doc(session.id);
  batch.set(guestOrderRef, sanitizedOrderData); 
          
          // Also create an index by email for easy lookup during account creation
          const emailIndexRef = adminDb.collection('users').doc('guest-user').collection('email-index').doc(userEmail.toLowerCase());
          batch.set(emailIndexRef, {
            orders: admin.firestore.FieldValue.arrayUnion(session.id),
            updatedAt: new Date().toISOString()
          }, {merge: true});
        } else if (userId !== "guest-user") {
          // If user is authenticated, add to their orders collection
          const userOrderRef = adminDb.collection('users').doc(userId).collection('orders').doc(session.id);
          batch.set(userOrderRef, {
            orderId: session.id,
            createdAt: new Date().toISOString()
          });
        }
      }

      // Commit with additional logging
      console.log("Committing order batch to Firestore:", session.id);
      await batch.commit();
      console.log("Successfully saved order to Firestore:", session.id);
    } catch (dbError) {
      console.error("Firebase write failed:", dbError);
      throw dbError;
    }
  } catch (error) {
    console.error("Error processing checkout completion:", error);
    throw error;
  }
}

async function handlePaymentIntentSucceeded(pi: Stripe.PaymentIntent) {
  try {
    console.log(`Processing payment intent: ${pi.id}`);
    
    if (!pi.id) {
      throw new Error("Missing payment intent ID");
    }
    
    const metadata = pi.metadata || {};
    const userId = metadata.userId || "guest-user";
    const userEmail = metadata.userEmail || pi.receipt_email || '';
    
    // Define a properly typed address object with defaults
    const shippingAddress: Record<string, string> = {};
    
    // Get shipping details (safely) if available
    if (pi.shipping && pi.shipping.address) {
      // Type assertion to overcome TypeScript limitation
      const address = pi.shipping.address as {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
      };
      
      // Now we can safely access these properties
      shippingAddress.line1 = address.line1 || '';
      shippingAddress.line2 = address.line2 || '';
      shippingAddress.city = address.city || '';
      shippingAddress.state = address.state || '';
      shippingAddress.postal_code = address.postal_code || '';
      shippingAddress.country = address.country || '';
    }
    
    console.log("Payment intent data:", JSON.stringify(pi, null, 2));
    
    const orderData = {
      orderId: pi.id,
      customerId: pi.customer?.toString() || null,
      userId,
      orderDate: new Date().toISOString(),
      amount: { 
        total: (pi.amount || 0) / 100,
        subtotal: (pi.amount || 0) / 100,
      },
      currency: pi.currency,
      paymentStatus: pi.status,
      paymentMethod: [pi.payment_method_types?.[0] || 'card'],
      billingDetails: null,
      metadata: Object.entries(pi.metadata || {}).reduce((acc, [key, value]) => {
        // Only include string values and convert other types to strings
        acc[key] = typeof value === 'string' ? value : String(value);
        return acc;
      }, {} as Record<string, string>),
      email: userEmail,
      createdAt: new Date().toISOString(),
      status: "pending",
      shippingAddress: {
        line1: shippingAddress.line1 || '',
        line2: shippingAddress.line2 || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        postal_code: shippingAddress.postal_code || '',
        country: shippingAddress.country || '',
      },
      shipping: {
        status: "preparing",
        trackingNumber: null,
        carrier: null,
        updatedAt: new Date().toISOString(),
      },
    };
    const sanitizedOrderData = sanitizeData(orderData);

    // Write to Firestore
    const batch = adminDb.batch();
    
    // Add to orders collection with explicit ID
    const orderRef = adminDb.collection('orders').doc(pi.id);
    batch.set(orderRef, sanitizedOrderData);
    
    // Add to user orders if authenticated or has email
    if (userId !== "guest-user" || userEmail) {
      if (userId === "guest-user" && userEmail) {
        const guestOrderRef = adminDb.collection('users').doc('guest-user').collection('orders').doc(pi.id);
        batch.set(guestOrderRef, sanitizedOrderData);
        
        // In handlePaymentIntentSucceeded function
        const emailIndexRef = adminDb.collection('users').doc('guest-user').collection('email-index').doc(userEmail.toLowerCase());
        batch.set(emailIndexRef, {
          orders: admin.firestore.FieldValue.arrayUnion(pi.id),
          updatedAt: new Date().toISOString()
        }, {merge: true});
      } else if (userId !== "guest-user") {
        const userOrderRef = adminDb.collection('users').doc(userId).collection('orders').doc(pi.id);
        batch.set(userOrderRef, {
          orderId: pi.id,
          createdAt: new Date().toISOString()
        });
      }
    }

    console.log("Committing payment intent order to Firestore:", pi.id);
    await batch.commit();
    console.log("Successfully saved payment intent order to Firestore:", pi.id);
  } catch (error) {
    console.error("Error processing payment intent:", error);
    throw error;
  }
}