// src/app/api/create-checkout-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

type RequestBody = {
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    size: string;
    color: { name: string; value: string };
    image: string;
  }[];
  userId: string | null;
  customerEmail?: string;
  checkoutId?: string;
};

export async function POST(req: NextRequest) {
  try {
    const { items, userId, customerEmail, checkoutId }: RequestBody = await req.json();

    // Calculate total
    const amount = items
      .reduce((sum, item) => sum + item.price * item.quantity, 0) * 100; // in cents

    // Create PaymentIntent with automatic methods (PaymentElement)
    const params: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(amount),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: userId || "guest",
        checkoutId: checkoutId || "unknown",
        itemCount: items.length.toString(),
        totalAmount: (amount / 100).toString(),
        cartItems: JSON.stringify(items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color.name,
          image: item.image
        }))),
        // only include if set
        ...(customerEmail ? { userEmail: customerEmail } : {}),
      },
      // only send receipt_email if we actually got one
      ...(customerEmail ? { receipt_email: customerEmail } : {}),
    };
    const paymentIntent = await stripe.paymentIntents.create(params);

    return NextResponse.json({
      checkoutSessionClientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
}