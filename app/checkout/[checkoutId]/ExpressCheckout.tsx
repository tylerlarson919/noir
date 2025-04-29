// src/app/checkout/[checkoutId]/ExpressCheckout.tsx
"use client"
import { useEffect, useState } from "react"
import { useStripe, PaymentRequestButtonElement } from "@stripe/react-stripe-js"
import type { PaymentRequest as StripePaymentRequest, PaymentRequestUpdateOptions } from "@stripe/stripe-js"

interface Props { amount: number; currency: string; clientSecret: string; items: any[];}
export default function ExpressCheckout({ amount, currency, clientSecret, items }: Props) {
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
    setReady(false);
    setPr(null);
    setError(null);
    
    try {
        // Create payment request with the current options
        const paymentRequest = stripe.paymentRequest(paymentRequestOptions);
        
        // Add a cancel event handler to clear state when popup is closed
        paymentRequest.on('cancel', () => {
          console.log('Payment request cancelled by user');
          // Force reset of the payment request
          setPr(null);
          setReady(false);
          
          // Small delay before allowing to create a new payment request
          setTimeout(() => {
            setReady(true);
            setPr(paymentRequest);
          }, 100);
        });

        paymentRequest.on('shippingaddresschange', async (event) => {
            try {
              console.log('Shipping address changed:', event.shippingAddress);
              
              // Call your backend to calculate shipping options based on the address
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
              
              // Update the payment request with shipping options and total
              event.updateWith({
                status: 'success',
                shippingOptions: shippingOptions,
                total: {
                  label: 'Order Total',
                  amount: total
                }
              });
            } catch (error) {
              console.error('Error calculating shipping:', error);
              // If there's an error, update with a failure status
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
              const { error } = await stripe.confirmCardPayment(clientSecret);
              if (error) {
                console.error('Payment authentication failed:', error);
                setError(error.message || 'Payment authentication failed');
              } else if (paymentIntent?.id) {
                // Successful authentication, redirect to success page
                window.location.href = `${window.location.origin}/checkout/success?payment_intent=${paymentIntent.id}`;
              }
            } else if (paymentIntent?.id) {
              // Immediate success without authentication, redirect to success page
              window.location.href = `${window.location.origin}/checkout/success?payment_intent=${paymentIntent.id}`;
            }
            
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
        setError(null);
      };
  }, [stripe, amount, currency, clientSecret, paymentRequestOptions, items]);

  if (error) {
    return (
      <button disabled className="bg-gray-200 dark:bg-gray-700 text-gray-500 py-3 rounded w-full">
        Apple/Google Pay unavailable
      </button>
    );
  }

  if (!ready || !pr) return null;

  return (
    <div key={`pr-${clientSecret.substring(0, 8)}`}> {/* Add a key to force re-render */}
      <PaymentRequestButtonElement 
        options={{ 
          paymentRequest: pr,
          style: {
            paymentRequestButton: {
              height: '48px'
            }
          }
        }}
      />
    </div>
  );
}
