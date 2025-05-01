"use client";
import { ExpressCheckoutElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type { StripeExpressCheckoutElementOptions } from "@stripe/stripe-js";

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
  const stripe   = useStripe();
  const elements = useElements();
  const paymentMethods: StripeExpressCheckoutElementOptions['paymentMethods'] = type === 'productPage'
   ? {
       amazonPay: 'never',
       applePay: 'auto',
       googlePay: 'auto',
       link:     'never',
       paypal:   'never',
     }
   : {
       amazonPay: 'never',
       applePay: 'auto',
       googlePay: 'auto',
       link:     'auto',
       paypal:   'auto',
     };



  if (!stripe || !elements) return null;

  return (
    <ExpressCheckoutElement
      className="express-checkout"
      onReady={onReady}
      options={{
        billingAddressRequired: true,
        shippingAddressRequired: true,
        paymentMethods,
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