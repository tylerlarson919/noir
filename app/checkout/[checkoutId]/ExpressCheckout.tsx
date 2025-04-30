"use client";
import { ExpressCheckoutElement, useElements, useStripe } from "@stripe/react-stripe-js";


interface ExpressCheckoutProps {
  amount: number;
  currency: string;
  clientSecret: string;
  items: any[];
  userId: string;
  checkoutId: string;
  paymentIntentId: string;
}

export default function ExpressCheckout({ amount, currency, clientSecret, items, userId, checkoutId, paymentIntentId }: ExpressCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  if (!stripe || !elements) return null;

  return (
    <ExpressCheckoutElement
      options={{
        billingAddressRequired: true,
        shippingAddressRequired: true,
        buttonType: {
          applePay: "plain"
        },
        paymentMethods: {
          amazonPay: "never",
          applePay: "auto",
          googlePay: "auto",
          link: "auto", 
          paypal: "auto",
        },
        layout: {
          maxColumns: 3,
        }
      }}
      onShippingAddressChange={async ({ shippingAddress, updateWith }: any) => {
        if (!shippingAddress) return;
        const res = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            userId,
            checkoutId,
            paymentIntentId,
            shipping: {
              country:    shippingAddress.country,
              region:     shippingAddress.region,
              postalCode: shippingAddress.postalCode,
            }
          })
        });
        const { shippingFee, totalAmount } = await res.json();
        updateWith({
          shippingOptions: [{
            id:     "standard",
            label:  "Standard Shipping",
            detail: shippingFee === 0 ? "Free Shipping" : "3-5 business days",
            amount: Math.round(shippingFee * 100),
          }],
          total: { label: "Order total", amount: totalAmount },
        });
      }}
      onConfirm={async (event: any) => {
        // 1) hit your API to (re)create/update the PI and get back clientSecret
        const res = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ /* same payload you already have */ }),
        });
        const { checkoutSessionClientSecret } = await res.json();

        // 2) confirm it
        const { error } = await stripe.confirmPayment({
          elements,
          clientSecret: checkoutSessionClientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/checkout/success?payment_intent={PAYMENT_INTENT_ID}`,
            shipping: {
             name: (event as any).shippingAddress?.recipient || "",
             address: {
               line1: (event as any).shippingAddress?.addressLine?.[0] || "",
               city: (event as any).shippingAddress?.city || "",
               state: (event as any).shippingAddress?.region || "",
               postal_code: (event as any).shippingAddress?.postalCode || "",
               country: (event as any).shippingAddress?.country || "",
             },
           },
          },
        });
        if (error) console.error(error);
      }}
    />
  );
}