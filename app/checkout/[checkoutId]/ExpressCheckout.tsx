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
      
      onShippingAddressChange={async (event) => {
        const { address: addr, resolve, reject } = event;
        
        if (!addr.country || !addr.postal_code) {
          reject();
          return;
        }
      
        // Calculate shipping fee
        const { fee: shippingFee } = getShippingFee(
          addr.country,
          addr.state ?? null,
          amount / 100
        );
        
        // Convert shipping fee to cents and add to base amount
        const shippingAmount = Math.round(shippingFee * 100);
        const newTotal = amount + shippingAmount;
        setCurrentAmount(newTotal);
        
        // Update the payload with proper types for deliveryEstimate
        const payload = {
          shippingRates: [
            {
              id: "standard",
              amount: shippingAmount,
              displayName: shippingFee === 0 ? "Free Shipping" : "Standard Shipping",
              // Format deliveryEstimate according to Stripe's expected type
              deliveryEstimate: {
                minimum: {
                  unit: "business_day" as const, // Use 'as const' to ensure correct type
                  value: 5
                },
                maximum: {
                  unit: "business_day" as const,
                  value: 10
                }
              }
            }
          ],
          // Optional: include line items
          lineItems: items.map(item => ({
            name: item.name,
            amount: Math.round(item.price * item.quantity * 100)
          }))
        };
        
        resolve(payload);
      }}
      
      
      onConfirm={async (event: any) => {
        const { address: addr, name: recipient, shippingOption } = event;
        
        // Get shipping fee directly from event or recalculate it
        const { fee: shippingFee } = getShippingFee(
          addr.country,
          addr.state ?? null,
          amount / 100
        );
        
        // Create a new payment intent with the correct total amount
        const payload = {
          items,
          userId,
          checkoutId,
          paymentIntentId,
          shippingFee,
          totalAmount: currentAmount,
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
        
        try {
          const res = await fetch(
            `${window.location.origin}/api/create-checkout-session`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }
          );
          
          if (!res.ok) throw new Error('Error creating checkout session');
          
          const data = await res.json();
          const { checkoutSessionClientSecret } = data;
          
          const { error } = await stripe.confirmPayment({
            elements,
            clientSecret: checkoutSessionClientSecret,
            confirmParams: {
              return_url: `${window.location.origin}/checkout/success?payment_intent=${paymentIntentId}`,
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