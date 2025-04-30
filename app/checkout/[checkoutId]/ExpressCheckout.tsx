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
        try {
          const { address: addr, resolve, reject } = event;
          
          if (!addr || !addr.country || !addr.postal_code) {
            console.log("Rejecting due to incomplete shipping address");
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
          
          // Update state with new total amount
          setCurrentAmount(newTotal);
          
          // Create a properly formatted payload for Stripe
          const payload = {
            shippingRates: [
              {
                id: "standard",
                amount: shippingAmount,
                displayName: shippingFee === 0 ? "Free Shipping" : "Standard Shipping",
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
          
          // Call resolve with the payload
          resolve(payload);
        } catch (error) {
          console.error("Error in shipping address change handler:", error);
          // Reject on error to ensure the flow continues
          event.reject();
        }
      }}
      
      
      
      onConfirm={async (event: any) => { // Use explicit any for now, or create a proper interface
        try {
          // Type assertion for the event properties we need
          const eventData = event as { 
            shipping?: { 
              address?: any,
              name?: string 
            }
          };
          
          // Extract the data safely with optional chaining
          const shippingAddress = eventData.shipping?.address;
          const recipient = eventData.shipping?.name || "Customer";
          
          // Check if address exists before proceeding
          if (!shippingAddress || !shippingAddress.country) {
            console.error("Missing shipping address in confirmation event");
            return;
          }
          
          // Calculate shipping fee
          const { fee: shippingFee } = getShippingFee(
            shippingAddress.country,
            shippingAddress.state ?? null,
            amount / 100
          );
          
          // Convert shipping fee to cents for consistency
          const shippingAmount = Math.round(shippingFee * 100);
          
          // Use the updated total amount with shipping
          const finalAmount = currentAmount;
          
          const payload = {
            items,
            userId,
            checkoutId,
            paymentIntentId,
            shippingFee,
            totalAmount: finalAmount,
            shipping: {
              name: recipient,
              address: {
                line1: shippingAddress.addressLine?.[0] ?? "",
                city: shippingAddress.city,
                state: shippingAddress.state,
                postal_code: shippingAddress.postal_code,
                country: shippingAddress.country,
              },
            },
          };
          
          // Create/update payment intent with the server
          const res = await fetch(
            `${window.location.origin}/api/create-checkout-session`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }
          );
          
          if (!res.ok) {
            const errorData = await res.text();
            throw new Error(`Error creating checkout session: ${errorData}`);
          }
          
          const data = await res.json();
          
          // Make sure we have a client secret
          if (!data.checkoutSessionClientSecret) {
            throw new Error('Missing client secret in response');
          }
          
          // Confirm the payment with clear return URL
          const confirmResult = await stripe.confirmPayment({
            elements,
            clientSecret: data.checkoutSessionClientSecret,
            confirmParams: {
              return_url: `${window.location.origin}/checkout/success?payment_intent=${paymentIntentId}`,
              payment_method_data: {
                billing_details: {
                  name: recipient
                }
              },
              shipping: {
                name: recipient,
                address: {
                  line1: shippingAddress.addressLine?.[0] ?? "",
                  city: shippingAddress.city,
                  state: shippingAddress.state,
                  postal_code: shippingAddress.postal_code,
                  country: shippingAddress.country,
                },
              },
            },
          });
          
        } catch (err) {
          console.error('Express checkout error:', err);
        }
      }}
    />
  );
}