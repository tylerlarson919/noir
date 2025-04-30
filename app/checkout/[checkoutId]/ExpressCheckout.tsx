// src/app/checkout/[checkoutId]/ExpressCheckout.tsx
"use client"
import { useEffect, useState } from "react"
import { useStripe, PaymentRequestButtonElement } from "@stripe/react-stripe-js"
import type { PaymentRequest as StripePaymentRequest } from "@stripe/stripe-js"

interface Props { amount: number; currency: string; clientSecret: string; items: any[];}
// ExpressCheckout.tsx - Replace the component with this updated version
export default function ExpressCheckout({ amount, currency, clientSecret, items }: Props) {
  const stripe = useStripe()
  const [paymentRequest, setPaymentRequest] = useState<StripePaymentRequest|null>(null)
  const [canMakePayment, setCanMakePayment] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!stripe || !clientSecret) return;
    
    setIsLoading(true);
    
    const pr = stripe.paymentRequest({
      country: 'US',
      currency: currency.toLowerCase(),
      total: {
        label: 'Order Total',
        amount: amount,
      },
      requestPayerName: true,
      requestPayerEmail: true,
      requestShipping: true,
    });
    
    // Set up event handlers
    pr.on('paymentmethod', async (event) => {
      try {
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: event.paymentMethod.id },
          { handleActions: false }
        );
        
        if (confirmError) {
          event.complete('fail');
          setError(confirmError.message || 'Payment failed');
        } else {
          event.complete('success');
          
          if (paymentIntent?.status === 'requires_action') {
            const { error } = await stripe.confirmCardPayment(clientSecret);
            if (error) {
              setError(error.message || 'Payment authentication failed');
            } else if (paymentIntent?.id) {
              window.location.href = `${window.location.origin}/checkout/success?payment_intent=${paymentIntent.id}`;
            }
          } else if (paymentIntent?.id) {
            window.location.href = `${window.location.origin}/checkout/success?payment_intent=${paymentIntent.id}`;
          }
        }
      } catch (err) {
        console.error('Payment handler error:', err);
        event.complete('fail');
        setError('Payment processing error');
      }
    });
    
    pr.on('shippingaddresschange', async (event) => {
      try {
        const response = await fetch('/api/calculate-shipping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: event.shippingAddress,
            items: items,
            amount: amount
          })
        });
        
        const { shippingOptions, total } = await response.json();
        
        event.updateWith({
          status: 'success',
          shippingOptions: shippingOptions,
          total: {
            label: 'Order Total',
            amount: total
          }
        });
      } catch (error) {
        event.updateWith({ status: 'invalid_shipping_address' });
      }
    });
    
    // Check if Apple Pay or Google Pay is available
    pr.canMakePayment().then(result => {
      if (result) {
        setPaymentRequest(pr);
        setCanMakePayment(true);
      } else {
        setError('Apple Pay and Google Pay are not available on this device/browser');
      }
      setIsLoading(false);
    });
    
    return () => {
      setPaymentRequest(null);
      setCanMakePayment(false);
    };
  }, [stripe, amount, currency, clientSecret, items]);

  if (isLoading) {
    return (
      <button disabled className="bg-gray-200 dark:bg-gray-700 text-gray-500 py-3 rounded w-full">
        Loading payment options...
      </button>
    );
  }

  if (error || !canMakePayment || !paymentRequest) {
    return (
      <button disabled className="bg-gray-200 dark:bg-gray-700 text-gray-500 py-3 rounded w-full">
        Apple/Google Pay unavailable
      </button>
    );
  }

  return (
    <PaymentRequestButtonElement 
      options={{ 
        paymentRequest: paymentRequest,
        style: {
          paymentRequestButton: {
            type: 'default', // 'default', 'book', 'buy', or 'donate'
            theme: 'dark', // 'dark', 'light', or 'light-outline'
            height: '48px'
          }
        }
      }}
    />
  );
}
