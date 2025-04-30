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
      
        // Calculate shipping fee based on the product amount (not including previous shipping)
        const { fee: shippingFee } = getShippingFee(
          addr.country,
          addr.state ?? null,
          amount / 100 // Convert cents to dollars for fee calculation
        );
        
        // Convert shipping fee to cents and add to base amount
        const shippingAmount = Math.round(shippingFee * 100);
        const newTotal = amount + shippingAmount;
        
        // Update component state
        setCurrentAmount(newTotal);
        
        console.log(`Base amount: ${amount}, Shipping: ${shippingAmount}, New total: ${newTotal}`);
        
        // Provide the correct payload structure to Stripe
        resolve({
          shippingRates: [
            {
              id: "standard",
              amount: shippingAmount,
              displayName: shippingFee === 0 ? "Free Shipping" : "Standard Shipping",
              selected: true,
              deliveryEstimate: {
                minimum: { unit: "business_day", value: 5 },
                maximum: { unit: "business_day", value: 10 },
              },
            },
          ],
          total: { 
            label: "Order total", 
            amount: newTotal,
            breakdown: {
              discounts: [],
              taxes: [],
              shipping: {
                amount: shippingAmount,
                label: "Shipping"
              }
            }
          },
        });
      }}
      
      onConfirm={async (event: any) => {
        const { address: addr, name: recipient, shippingOption } = event;
        console.log("Confirm event →", event);
      
        // Get the shipping fee - but ensure we're using the rate that was selected
        const shippingAmount = shippingOption?.amount || 0;
        const shippingFee = shippingAmount / 100; // Convert cents to dollars
        
        console.log(`Confirming payment with total: ${currentAmount} (includes shipping: ${shippingAmount})`);
      
        const payload = {
          items,
          userId,
          checkoutId,
          paymentIntentId,
          shippingFee,
          totalAmount: currentAmount, // This is our state that includes the shipping
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
      
        console.log("Sending payload:", payload);
      
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