// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { db } from "@/lib/firebaseConfig";
import { collection, addDoc, doc, arrayUnion, writeBatch } from "firebase/firestore";

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
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
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
      metadata: session.metadata || {},
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

    const batch = writeBatch(db);
    
    // Add to orders collection
    const orderRef = doc(collection(db, "orders"), session.id);
    batch.set(orderRef, orderData);
    
    // Add to user orders if authenticated
    if (userId === "guest-user" && userEmail) {
      // Store the order in a way we can look it up later by email
      const guestOrderRef = doc(db, `users/guest-user/orders/${session.id}`);
      batch.set(guestOrderRef, {...orderData, email: userEmail});
      
      // Also create an index by email for easy lookup during account creation
      const emailIndexRef = doc(db, `users/guest-user/email-index/${userEmail.toLowerCase()}`);
      batch.set(emailIndexRef, {
        orders: arrayUnion(session.id),
        updatedAt: new Date().toISOString()
      }, {merge: true});
    }
    
    await batch.commit();
  } catch (error) {
    console.error("Error saving order to Firestore:", error);
    throw error;
  }
}

async function handlePaymentIntentSucceeded(pi: Stripe.PaymentIntent) {
  // You can add payment intent specific logic here if needed
  console.log(`Payment intent succeeded: ${pi.id}`);
}