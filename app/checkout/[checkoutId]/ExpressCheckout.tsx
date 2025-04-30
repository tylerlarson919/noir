"use client";
import { ExpressCheckoutElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { getShippingFee } from "@/lib/shipping";
import { useState } from "react";

interface ExpressCheckoutProps {
  amount: number;
  currency: string;
  clientSecret: string;
  items: any[];
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
        },
      }}
      onShippingAddressChange={async (event) => {
        try {
          const { address: addr, resolve, reject } = event;
          
          if (!addr || !addr.country || !addr.postal_code) {
            console.log("Rejecting due to incomplete shipping address");
            reject();
            return;
          }
        
          // Calculate shipping fee
          const { fee } = getShippingFee(
            addr.country,
            addr.state ?? null,
            amount / 100
          );
          
          // Convert shipping fee to cents
          const shippingAmount = Math.round(fee * 100);
          
          // Create payload for Stripe
          const payload = {
            shippingRates: [
              {
                id: "standard",
                amount: shippingAmount,
                displayName: fee === 0 ? "Free Shipping" : "Standard Shipping",
                deliveryEstimate: {
                  minimum: {
                    unit: "business_day" as const,
                    value: 5
                  },
                  maximum: {
                    unit: "business_day" as const,
                    value: 10
                  }
                }
              }
            ]
          };
          
          resolve(payload);
        } catch (error) {
          console.error("Error in shipping address change handler:", error);
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