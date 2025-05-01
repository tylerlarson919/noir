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
    price: number; // in cents
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

    // Compute subtotal in cents
// Helper – force each price into cents as an integer
   const cents = (n: number) =>
       Number.isInteger(n) ? n : Math.round(n * 100);

// Compute subtotal in cents
    const subtotal = items.reduce(
        (sum, i) => sum + cents(i.price) * i.quantity,
        0,
      );

      // Flat-rate shipping fee ($9)
      const SHIPPING_FEE_CENTS = 900;

      // Total = items + shipping
      const total = subtotal + SHIPPING_FEE_CENTS;
    // Create a new PaymentIntent with subtotal only
    const params: Stripe.PaymentIntentCreateParams = {
      amount: total, // Subtotal in cents, shipping added later
      currency: "usd", // Adjust if your app uses a different currency
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: userId || "guest",
        checkoutId: checkoutId || "unknown",
        itemCount: items.length.toString(),
        subtotal: (subtotal / 100).toString(),
        shippingFee: (SHIPPING_FEE_CENTS / 100).toString(),
        cartItems: JSON.stringify(
          items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color.name,
            image: item.image,
          }))
        ),
        ...(customerEmail ? { userEmail: customerEmail } : {}),
      },
      ...(customerEmail ? { receipt_email: customerEmail } : {}),
    };
    const paymentIntent = await stripe.paymentIntents.create(params);

    return NextResponse.json({
      checkoutSessionClientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      shippingFee: SHIPPING_FEE_CENTS / 100,
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
}