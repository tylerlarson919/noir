"use client";
import { ExpressCheckoutElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { getShippingFee } from "@/lib/shipping";
import { SelectItem } from "@heroui/select";
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

export default function ExpressCheckout({ amount, currency, clientSecret, items, userId, checkoutId, paymentIntentId }: ExpressCheckoutProps) {
  const [currentAmount, setCurrentAmount] = useState(amount);
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
      onShippingAddressChange={async (event: any) => {
        const { address: addr, resolve, reject } = event;
        console.log("shipping address change →", addr);
        
        if (!addr.country || !addr.postal_code) {
          reject({ error: "Invalid shipping address" });
          return;
        }
      
        const { fee: shippingFee } = getShippingFee(
          addr.country,
          addr.state ?? null,
          amount / 100
        );
        const newTotal = amount + Math.round(shippingFee * 100);
        setCurrentAmount(newTotal); // This updates the state but needs to be used in onConfirm
      
        resolve({
          shippingRates: [
            {
              id: "standard",
              amount: Math.round(shippingFee * 100),
              displayName:
                shippingFee === 0 ? "Free Shipping" : "Standard Shipping",
              selected: true,
              deliveryEstimate: {
                minimum: { unit: "business_day", value: 5 },
                maximum: { unit: "business_day", value: 10 },
              },
            },
          ],
          total: { label: "Order total", amount: newTotal }, // Make sure total includes shipping
        });
      }}
      
      onShippingRateChange={async (event: any) => {
        // when user picks another rate, recalc the total
        const { shippingOption, resolve } = event;
        const newTotal = amount + shippingOption.amount;
        setCurrentAmount(newTotal);
        resolve({
          total: { label: "Order total", amount: newTotal },
        });
      }}

      onConfirm={async (event: any) => {
        const { address: addr, name: recipient } = event;
        const { fee: shippingFee } = getShippingFee(
          addr.country,
          addr.state ?? null,
          amount / 100
        );
      
        // Use currentAmount which includes shipping fee instead of just amount
        const payload = {
          items,
          userId,
          checkoutId,
          paymentIntentId,
          shippingFee, // Pass the shipping fee explicitly
          totalAmount: currentAmount, // Include the updated total with shipping
          shipping: {
            name: recipient,
            address: {
              line1: addr.addressLine?.[0] ?? "",
              city: addr.city,
              state: addr.state,
              postal_code: addr.postal_code,
              country: addr.country,
            },
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
              name: recipient,
              address: {
                line1: addr.addressLine?.[0] ?? "",
                city:   addr.city,
                state:  addr.state,
                postal_code: addr.postal_code,
                country: addr.country,
              },
            },
          },
        });
        if (error) console.error(error);
      }}
    />
  );
}