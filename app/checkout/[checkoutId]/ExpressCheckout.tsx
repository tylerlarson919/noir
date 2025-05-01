"use client";
import { ExpressCheckoutElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { getShippingFee } from "@/lib/shipping";
import { useState } from "react";

interface ExpressCheckoutProps {
  amount: number;
  currency: string;
  clientSecret: string;
  items: { id: string; name: string; price: number; quantity: number; size: string; color: { name: string; value: string }; image: string }[];
  userId: string;
  checkoutId: string;
  paymentIntentId: string;
}

export default function ExpressCheckout({ 
  amount, 
  currency, 
  clientSecret, 
  items, 
  userId, 
  checkoutId, 
  paymentIntentId
}: ExpressCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [shippingAddress, setShippingAddress] = useState<any>(null); // Store shipping address

  if (!stripe || !elements) return null;return (
    <ExpressCheckoutElement
      options={{
        billingAddressRequired: true,
        shippingAddressRequired: true,
        buttonType: { applePay: "plain" },
        paymentMethods: {
          amazonPay: "never",
          applePay: "auto",
          googlePay: "auto",
          link: "auto", 
          paypal: "auto",
        },
        layout: { maxColumns: 3 },
      }}
      onShippingAddressChange={async (event) => {
        try {
          const { address: addr } = event;
          if (!addr || !addr.country || !addr.postal_code) {
            console.log("Rejecting due to incomplete shipping address");
            event.reject();
            return;
          }
          setShippingAddress(addr); // Store the shipping address
          const { fee } = getShippingFee(addr.country, addr.state ?? null, amount / 100);
          const shippingAmount = Math.round(fee * 100); // Convert dollars to cents
          const payload = {
            shippingRates: [
              {
                id: "standard",
                amount: shippingAmount,
                displayName: fee === 0 ? "Free Shipping" : "Standard Shipping",
                deliveryEstimate: {
                  minimum: { unit: "business_day" as const, value: 5 },
                  maximum: { unit: "business_day" as const, value: 10 },
                },
              },
            ],
          };
          event.resolve(payload);
        } catch (error) {
          console.error("Error in shipping address change handler:", error);
          event.reject();
        }
      }}
      onShippingRateChange={async (event) => {
        try {
          const { shippingRate } = event;
          const selectedShippingFee = shippingRate.amount; // Already in cents
          // Calculate subtotal in cents (assuming items.price is in cents)
          const subtotalCents = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
          const newTotalAmount = subtotalCents + selectedShippingFee;

          // Update PaymentIntent via API
          const response = await fetch('/api/update-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentIntentId,
              amount: newTotalAmount,
              shippingFee: selectedShippingFee, // Pass shipping fee explicitly
              shipping: shippingAddress ? {
                name: shippingAddress.name || "Customer", // Fallback if name is missing
                address: {
                  line1: shippingAddress.line1 || "",
                  city: shippingAddress.city || "",
                  state: shippingAddress.state || "",
                  postal_code: shippingAddress.postal_code || "",
                  country: shippingAddress.country || "",
                },
              } : undefined,
            }),
          });

          if (response.ok) {
            event.resolve();
          } else {
            const errorData = await response.json();
            console.error("Failed to update PaymentIntent:", errorData);
            event.reject();
          }
        } catch (error) {
          console.error("Error in shipping rate change handler:", error);
          event.reject();
        }
      }}
      onConfirm={async (event) => {
        try {
          const { error } = await stripe.confirmPayment({
            elements,
            clientSecret,
            confirmParams: {
              return_url: `${window.location.origin}/checkout/success?payment_intent=${paymentIntentId}`,
            },
          });
          if (error) {
            console.error('Payment confirmation error:', error);
          }
        } catch (err) {
          console.error('Express checkout error:', err);
        }
      }}
    />
  );
}