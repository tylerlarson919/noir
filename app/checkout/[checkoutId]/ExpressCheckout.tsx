"use client";
import { ExpressCheckoutElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { getShippingFee } from "@/lib/shipping";


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
      onShippingAddressChange={async (event: any) => {
        const { shippingAddress, resolve, reject } = event;
        if (!shippingAddress?.country) {
          reject({ error: "Missing shipping address" });
          return;
        }
      
        /* ➊ calculate fee locally exactly once */
        const { fee: shippingFee } = getShippingFee(
          shippingAddress.country,
          shippingAddress.region ?? null,
          amount / 100 /* subtotal in major units */
        );
        const newTotal = amount + Math.round(shippingFee * 100);
      
        resolve({
          shippingOptions: [
            {
              id: "standard",
              label: "Standard Shipping",
              amount: Math.round(shippingFee * 100),
              detail:
                shippingFee === 0 ? "Free Shipping" : "5-10 business days",
            },
          ],
          total: { label: "Order total", amount: newTotal },
        });
      }}
      
      onConfirm={async (event: any) => {
        /* ➋ create / update PI with the final shipping fee */
        const payload = {
          items,
          userId,
          checkoutId,
          paymentIntentId,
          shipping: {
            country: event.shippingAddress?.country,
            region: event.shippingAddress?.region,
            postalCode: event.shippingAddress?.postalCode,
          },
        };
      
        const res = await fetch(
          `${window.location.origin}/api/create-checkout-session`, // absolute path
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        const { checkoutSessionClientSecret } = await res.json();
      
        const { error } = await stripe.confirmPayment({
          elements,
          clientSecret: checkoutSessionClientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/checkout/success?payment_intent={PAYMENT_INTENT_ID}`,
            shipping: {
              name: event.shippingAddress?.recipient ?? "",
              address: {
                line1: event.shippingAddress?.addressLine?.[0] ?? "",
                city: event.shippingAddress?.city ?? "",
                state: event.shippingAddress?.region ?? "",
                postal_code: event.shippingAddress?.postalCode ?? "",
                country: event.shippingAddress?.country ?? "",
              },
            },
          },
        });
        if (error) console.error(error);
      }}
    />
  );
}