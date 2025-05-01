/* -----------------------------------------------------------
   Stripe – create / update PaymentIntent (Edge Runtime)
----------------------------------------------------------- */

/* 1.  Tell Next.js to run this route on the Edge and never cache */
export const runtime = "edge";
export const dynamic = "force-dynamic";

/* 2.  Imports -------------------------------------------------- */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

/* 3.  Stripe client ------------------------------------------- */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

/* 4.  Expected request body ----------------------------------- */
type RequestBody = {
  items?: {
    id: string;
    name: string;
    price: number;      // dollars or cents – will convert to cents below
    quantity: number;
    size: string;
    color: { name: string; value: string };
    image: string;
  }[];
  userId: string | null;
  customerEmail?: string;
  checkoutId?: string;
  paymentIntentId?: string;
  shipping?: {
    name?: string;
    address: {
      country: string;
      postal_code?: string;
      state?: string;
    };
  };
};

/* 5.  Route handler ------------------------------------------- */
export async function POST(req: NextRequest) {
  try {
    const {
      items = [],
      userId,
      customerEmail,
      checkoutId,
      paymentIntentId,
      shipping,
    }: RequestBody = await req.json();

    /* ----- totals -------------------------------------------- */
    const cents = (n: number) =>
      Number.isInteger(n) ? n : Math.round(n * 100);

    const subtotal = items.reduce(
      (sum, i) => sum + cents(i.price) * i.quantity,
      0
    );

    const SHIPPING_FEE_CENTS = 900;          // $9 flat rate
    const total = subtotal + SHIPPING_FEE_CENTS;

    /* ----- 1) UPDATE existing PaymentIntent ------------------ */
    if (paymentIntentId) {
      const updateParams: Stripe.PaymentIntentUpdateParams = {
        amount: total,
      };

      if (shipping) {
        updateParams.shipping = {
          name: shipping.name ?? "Recipient",
          address: shipping.address,
        };
      }

      const pi = await stripe.paymentIntents.update(
        paymentIntentId,
        { ...updateParams, expand: ['client_secret'] }
      );
      
      return NextResponse.json({
        shippingFee: SHIPPING_FEE_CENTS / 100,  // dollars
        clientSecret: pi.client_secret,
      });
    }

    /* ----- 2) CREATE new PaymentIntent ----------------------- */
    const params: Stripe.PaymentIntentCreateParams = {
      amount: total,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: userId || "guest",
        checkoutId: checkoutId || "unknown",
        itemCount: items.length.toString(),
        subtotal: (subtotal / 100).toString(),
        shippingFee: (SHIPPING_FEE_CENTS / 100).toString(),
        cartItems: JSON.stringify(
          items.map((i) => ({
            id: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            size: i.size,
            color: i.color.name,
            image: i.image,
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
      shippingFee: SHIPPING_FEE_CENTS / 100, // dollars
    });
  } catch (error: any) {
    console.error("Error creating / updating payment intent:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
}