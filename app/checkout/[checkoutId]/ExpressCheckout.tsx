"use client";
import { ExpressCheckoutElement, useElements, useStripe } from "@stripe/react-stripe-js";

interface ExpressCheckoutProps {
  amount: number;
  currency: string;
  clientSecret: string;
  items: any[];
}

export default function ExpressCheckout({ amount, currency, clientSecret, items }: ExpressCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  if (!stripe || !elements) return null;

  return (
    <ExpressCheckoutElement
      options={{
        billingAddressRequired: true,
        shippingAddressRequired: true,
        buttonType: {
          applePay: "plain" // try "buy" also
        },
        paymentMethods: {
          amazonPay: "never",
          applePay: "auto",
          googlePay: "auto",
          link: "auto", 
          paypal: "auto",
        }
      }}
      onShippingAddressChange={async (event: any) => {
        // call your shipping‐calc API
        const addr = (event as any).shippingAddress;
        const { shippingOptions, total } = await fetch("/api/calculate-shipping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: addr, items, amount }),
        }).then(r => r.json());
        (event as any).updateWith({
          shippingOptions: shippingOptions.map((o: any) => ({
           id: o.id,
           displayName: o.label,
           detail: o.detail,
           amount: o.amount,
         })),
         total: { label: "Order total", amount: total },
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