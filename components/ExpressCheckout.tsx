"use client";
// @ts-ignore
import { useState } from "react";
import { ExpressCheckoutElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useCart } from "@/context/CartContext";

interface ExpressCheckoutProps {
  clientSecret: string;
  currency: string;
  paymentIntentId: string;
  onReady?: () => void;
  type: 'productPage' | 'checkoutPage';
}

export default function ExpressCheckout({
  clientSecret,
  currency,          // ← still here in case you want to surface it later
  paymentIntentId,
  onReady,
  type,
}: ExpressCheckoutProps) {
  const [expressEmail, setExpressEmail] = useState("");
  const stripe   = useStripe();
  const elements = useElements();
  const { totalPrice } = useCart()
  const standardRate = totalPrice > 100 ? 0 : 900;
  const paymentMethods = type === 'productPage'
   ? {
       amazonPay: 'never',
       applePay: 'auto',
       googlePay: 'auto',
       link:     'never',
       paypal:   'never',
       klarna: 'never',
     } as any
   : {
       amazonPay: 'never',
       applePay: 'auto',
       googlePay: 'auto',
       link:     'auto',
       paypal:   'auto',
     } as any;

  if (!stripe || !elements) return null;

  return (
    <ExpressCheckoutElement
      className="express-checkout"
      onReady={onReady}
      options={{
        billingAddressRequired: true,
        shippingAddressRequired: true,
        emailRequired: true,
        paymentMethods,
        paymentMethodOrder: ["googlePay", "applePay", "link", "klarna", "paypal"],

        shippingRates: [                              // <- single placeholder
          {
            id: "standard",
            amount: standardRate,                                // flat-rate placeholder
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
        // 1) push to your PI API
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