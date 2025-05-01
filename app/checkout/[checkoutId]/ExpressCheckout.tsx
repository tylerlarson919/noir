"use client";
import { ExpressCheckoutElement, useElements, useStripe } from "@stripe/react-stripe-js";

interface ExpressCheckoutProps {
  clientSecret: string;
  currency: string;
  paymentIntentId: string;
}

export default function ExpressCheckout({
  clientSecret,
  currency,          // ← still here in case you want to surface it later
  paymentIntentId,
}: ExpressCheckoutProps) {
  const stripe   = useStripe();
  const elements = useElements();

  if (!stripe || !elements) return null;

  return (
    <ExpressCheckoutElement
      className="express-checkout"
      options={{
        billingAddressRequired: true,
        shippingAddressRequired: true,
        paymentMethods: {
          amazonPay: "never",
          applePay: "auto",
          googlePay: "auto",
          link: "auto",
          paypal: "auto",
        },
        paymentMethodOrder: ["googlePay", "applePay", "link", "klarna", "paypal"],

        shippingRates: [                              // <- single placeholder
          {
            id: "standard",
            amount: 900,                                // flat-rate placeholder
            displayName: "Standard Shipping",
            deliveryEstimate: {
              minimum: { unit: "business_day", value: 3 },
              maximum: { unit: "business_day", value: 5 },
            },
          },
        ],
        buttonType: { applePay: "plain" },
        layout: { maxRows: 2 },
      }}
      onConfirm={async () => {
        await stripe.confirmPayment({
          elements,
          clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/checkout/success?payment_intent=${paymentIntentId}`,
          },
        });
      }}
    />
  );
} 