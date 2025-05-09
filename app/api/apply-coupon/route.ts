import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { couponCode, items = [], paymentIntentId, shipping } = await req.json();
  // 1) look up promo
  const promos = await stripe.promotionCodes.list({ code: couponCode, active: true, limit: 1 });
  if (!promos.data.length) {
    return NextResponse.json({ valid: false, message: "Invalid code" });
  }
  const coupon = promos.data[0].coupon;
  // 2) calc subtotal+shipping in cents
  const cents = (n: number) => Number.isInteger(n) ? n : Math.round(n * 100);
  const subtotal = items.reduce((sum: number, i: { price: number; quantity: number }) => {
    return sum + cents(i.price) * i.quantity;
  }, 0);

  const shippingCents = shipping ? 900 : 0; // your flat rate logic
  let discount = coupon.amount_off
    ? coupon.amount_off
    : Math.round((subtotal + shippingCents) * (coupon.percent_off! / 100));
  // cap discount
  if (discount > subtotal + shippingCents) discount = subtotal + shippingCents;
  const newAmount = subtotal + shippingCents - discount;
  // 3) update PI
  await stripe.paymentIntents.update(paymentIntentId, { amount: newAmount });
  return NextResponse.json({
    valid: true,
    amount_off: discount,
  });
}
