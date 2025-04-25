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
    color: string;
  }[];
  userId: string | null;
  cartItems: string;
  customerEmail?: string;
};

export async function POST(req: NextRequest) {
  try {
    const { items, userId, cartItems, customerEmail }: RequestBody = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: items.map((i) => ({
        price_data: {
          currency: "usd",
          unit_amount: Math.round(i.price * 100),
          product_data: {
            name: i.name,
            metadata: { id: i.id, size: i.size, color: i.color },
          },
        },
        quantity: i.quantity,
      })),
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
      metadata: { userId: userId || "guest-user", cartItems },
      customer_email: customerEmail,                    // ← have Stripe collect/confirm email
      billing_address_collection: "required",           // ← require billing address
      shipping_address_collection: { allowed_countries: ["US"] }, // ← require shipping address
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}