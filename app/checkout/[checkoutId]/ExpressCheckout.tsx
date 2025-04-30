"use client";
import { ExpressCheckoutElement, useElements, useStripe } from "@stripe/react-stripe-js";

interface ExpressCheckoutProps {
  amount: number;
  currency: string;
  clientSecret: string;
}

export default function ExpressCheckout({ amount, currency, clientSecret }: ExpressCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  if (!stripe || !elements) return null;

  return (
    <ExpressCheckoutElement
      options={{
        billingAddressRequired: true,
      }}
      onConfirm={async (event) => {
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
          },
        });
        if (error) console.error(error);
      }}
    />
  );
}