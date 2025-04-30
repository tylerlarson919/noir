// src/app/checkout/[checkoutId]/WalletPayButton.tsx
"use client";
import { useState, useEffect } from "react";
import { PaymentRequestButtonElement, useStripe } from "@stripe/react-stripe-js";

interface WalletPayButtonProps {
  amount: number;
  currency: string;
  clientSecret: string;
  items: any[];
}

export default function WalletPayButton({ amount, currency, clientSecret, items }: WalletPayButtonProps) {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState<any>(null);

  useEffect(() => {
    if (!stripe || !amount) return;

    const pr = stripe.paymentRequest({
      country: 'US',
      currency: currency.toLowerCase(),
      total: {
        label: 'Noir Order',
        amount: amount,
      },
      requestPayerName: true,
      requestPayerEmail: true,
      requestShipping: true,
    });

    // Check if the Payment Request is available
    pr.canMakePayment().then(result => {
      if (result) {
        setPaymentRequest(pr);
      }
    });

    pr.on('paymentmethod', async (e) => {
      if (!clientSecret) return;

      const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: e.paymentMethod.id },
        { handleActions: false }
      );

      if (confirmError) {
        e.complete('fail');
        return;
      }

      e.complete('success');

      if (paymentIntent.status === 'requires_action') {
        const { error } = await stripe.confirmCardPayment(clientSecret);
        if (error) {
          // Payment failed
          console.error('Payment failed:', error);
        } else {
          // Payment succeeded
          window.location.href = `/checkout/success?payment_intent=${paymentIntent.id}`;
        }
      } else {
        // Payment succeeded
        window.location.href = `/checkout/success?payment_intent=${paymentIntent.id}`;
      }
    });

  }, [stripe, amount, currency, clientSecret, items]);

  if (!paymentRequest) {
    return (
      <button
        disabled
        className="bg-gray-300 text-gray-500 py-3 rounded cursor-not-available"
      >
        Apple / Google Pay Unavailable
      </button>
    );
  }

  return (
    <PaymentRequestButtonElement 
      options={{ 
        paymentRequest,
        style: {
          paymentRequestButton: {
            theme: 'dark',
            height: '48px',
          },
        } 
      }} 
    />
  );
}