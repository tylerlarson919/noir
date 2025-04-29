// src/app/api/webhooks/stripe/route.ts
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { Firestore, FieldValue } from "@google-cloud/firestore";

const adminDb = new Firestore({
    projectId: process.env.FIREBASE_PROJECT_ID,
    credentials: {
      client_email: process.env.FIREBASE_CLIENT_EMAIL!,
      private_key: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    },
    fallback: "rest",  // force HTTP/1.1 REST instead of gRPC
  });

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
    const shippingAddress = (session as any).shipping_details?.address || session.customer_details?.address || {};
    
    const shippingFee = session.metadata?.shippingFee 
      ? parseFloat(session.metadata.shippingFee) 
      : ((session.amount_total || 0) - (session.amount_subtotal || 0)) / 100;
    const orderData = {
      orderId: session.id,
      userId,
      orderDate: new Date().toISOString(),
      amount: { 
        total: (session.amount_total || 0) / 100,
        subtotal: (session.amount_subtotal || 0) / 100,
        shipping: shippingFee
      },
      currency: session.currency,
      paymentStatus: session.payment_status,
      items: orderItems,
      paymentMethod: session.payment_method_types,
      metadata: Object.entries(session.metadata || {}).reduce((acc, [key, value]) => {
        // Only include string values and convert other types to strings
        acc[key] = typeof value === 'string' ? value : String(value);
        return acc;
      }, {} as Record<string, string>),
      email: session.customer_details?.email || '',
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
      const orderRef = adminDb.collection('orders').doc(session.id);
      await orderRef.set(sanitizedOrderData);
      
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

    // Extract cart items from metadata if available
    let orderItems = [];
    try {
      if (metadata.cartItems) {
        orderItems = JSON.parse(metadata.cartItems);
      }
    } catch (e) {
      console.error("Error parsing cart items from metadata:", e);
    }
    
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
    
    const shippingFee = parseFloat(metadata.shippingFee || '0');
    const subtotal = (pi.amount / 100) - shippingFee;

    const orderData = {
      orderId: pi.id,
      userId,
      orderDate: new Date().toISOString(),
      amount: { 
        total: (pi.amount || 0) / 100,
        subtotal: subtotal,
        shipping: shippingFee,
      },
      currency: pi.currency,
      paymentStatus: pi.status,
      paymentMethod: [pi.payment_method_types?.[0] || 'card'],
      items: orderItems,
      metadata: Object.entries(pi.metadata || {}).reduce((acc, [key, value]) => {
        // Only include string values and convert other types to strings
        if (key === 'cartItems') return acc;
        acc[key] = typeof value === 'string' ? value : String(value);
        return acc;
      }, {} as Record<string, string>),
      email: userEmail,
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
    const orderRef = adminDb.collection('orders').doc(pi.id);
    await orderRef.set(sanitizedOrderData);
    
    console.log("Successfully saved payment intent order to Firestore:", pi.id);
  } catch (error) {
    console.error("Error processing payment intent:", error);
    throw error;
  }
}