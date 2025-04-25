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
};

export async function POST(req: NextRequest) {
  try {
    const { items, userId, customerEmail }: RequestBody = await req.json();

    // Instead of storing entire cart in metadata, store essential info in line items
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        unit_amount: Math.round(item.price * 100),
        product_data: {
          name: item.name,
          description: `Size: ${item.size}, Color: ${item.color.name}`,
          images: [item.image],
          metadata: {
            productId: item.id,
            size: item.size,
            colorName: item.color.name,
            colorValue: item.color.value,
          },
        },
      },
      quantity: item.quantity,
    }));

    // Store order summary information instead of full cart
    const orderSummary = {
      itemCount: items.length,
      totalAmount: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
      metadata: { 
        userId: userId || "guest-user", 
        orderSummary: JSON.stringify(orderSummary),
      },
      customer_email: customerEmail,
      billing_address_collection: "required",
      shipping_address_collection: { allowed_countries: ["US"] },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" }, 
      { status: 500 }
    );
  }
}