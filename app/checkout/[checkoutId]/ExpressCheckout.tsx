// src/app/checkout/[checkoutId]/ExpressCheckout.tsx
"use client"
import { useEffect, useState } from "react"
import { useStripe, PaymentRequestButtonElement } from "@stripe/react-stripe-js"
import type { PaymentRequest as StripePaymentRequest, PaymentRequestUpdateOptions } from "@stripe/stripe-js"

interface Props { amount: number; currency: string; clientSecret: string }
export default function ExpressCheckout({ amount, currency, clientSecret }: Props) {
  const stripe = useStripe()
  const [pr, setPr] = useState<StripePaymentRequest|null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null);
  const [paymentRequestOptions, setPaymentRequestOptions] = useState({
    country: "US",
    currency: currency.toLowerCase(),
    total: { label: "Order Total", amount },
    requestPayerName: true,
    requestPayerEmail: true,
    requestShipping: true,
  });
  

  useEffect(() => {
    if (!stripe || !clientSecret) return;
    
    try {
      // Create payment request with the current options
      const paymentRequest = stripe.paymentRequest(paymentRequestOptions);
      
      // Add shipping address change handler
      paymentRequest.on('shippingaddresschange', async (event) => {
        try {
          // In a real app, you would calculate shipping based on the address
          const update: PaymentRequestUpdateOptions = {
            total: { label: 'Order Total', amount },
            displayItems: [
              { label: 'Subtotal', amount: amount - 1000 },
              { label: 'Shipping', amount: 1000 }
            ]
          };
          event.updateWith(update);
        } catch (err) {
          console.error('Shipping address update error:', err);
          event.updateWith({ status: 'invalid_shipping_address' });
        }
      });
      
      // Improve the payment method handler
      paymentRequest.on('paymentmethod', async (event) => {
        try {
          console.log('Payment method received:', event.paymentMethod.id);
          
          const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
            clientSecret,
            { payment_method: event.paymentMethod.id },
            { handleActions: false }
          );
          
          if (confirmError) {
            console.error('Express checkout error:', confirmError);
            event.complete('fail');
            setError(confirmError.message || 'Payment failed');
          } else {
            event.complete('success');
            
            // Let Stripe handle redirects for auth if needed
            if (paymentIntent?.status === 'requires_action') {
              console.log('Payment requires authentication');
              // Stripe will handle the redirect flow automatically
              const { error } = await stripe.confirmCardPayment(clientSecret);
              if (error) {
                console.error('Payment authentication failed:', error);
                setError(error.message || 'Payment authentication failed');
              }
            }
            
            // Success is handled by Stripe redirect
            console.log('Payment successful!');
          }
        } catch (err) {
          console.error('Payment handler error:', err);
          event.complete('fail');
          setError('Payment processing error');
        }
      });
      
      // Check if the browser supports this payment method
      paymentRequest.canMakePayment()
        .then(result => {
          if (result) {
            console.log('Can make payment:', result);
            setPr(paymentRequest);
            setReady(true);
          } else {
            console.log('Cannot make payment - methods not available');
            setReady(false);
          }
        })
        .catch(err => {
          console.error('canMakePayment error:', err);
          setError('Could not initialize express checkout');
        });
    } catch (err) {
      console.error('Express checkout setup error:', err);
      setError('Express checkout initialization failed');
    }
    
    // Cleanup function remains the same
    return () => {
      setReady(false);
      setPr(null);
    };
  }, [stripe, amount, currency, clientSecret, paymentRequestOptions]);

  if (error) {
    return (
      <button disabled className="bg-gray-200 dark:bg-gray-700 text-gray-500 py-3 rounded w-full">
        Apple/Google Pay unavailable
      </button>
    );
  }

  if (!ready || !pr) return null
  return <PaymentRequestButtonElement options={{ paymentRequest: pr }} />
}
