// src/app/api/update-payment-intent/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId, amount, shipping, shippingFee } = await req.json();

    if (!paymentIntentId || !amount) {
      return NextResponse.json(
        { error: "Missing paymentIntentId or amount" },
        { status: 400 }
      );
    }

    const updatedIntent = await stripe.paymentIntents.update(paymentIntentId, {
      amount, // New total in cents (subtotal + shipping fee)
      ...(shipping
        ? {
            shipping: {
              name: shipping.name,
              address: shipping.address,
            },
          }
        : {}),
      metadata: {
        shippingFee: shippingFee ? shippingFee.toString() : "0",
      },
    });

    return NextResponse.json({
      success: true,
      clientSecret: updatedIntent.client_secret,
    });
  } catch (error: any) {
    console.error("Error updating PaymentIntent:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update PaymentIntent" },
      { status: 500 }
    );
  }
}