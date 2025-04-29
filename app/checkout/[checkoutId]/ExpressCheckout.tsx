// src/app/checkout/[checkoutId]/ExpressCheckout.tsx
"use client"
import { useEffect, useState } from "react"
import { useStripe, PaymentRequestButtonElement } from "@stripe/react-stripe-js"
import type { PaymentRequest as StripePaymentRequest } from "@stripe/stripe-js"

interface Props { amount: number; currency: string; clientSecret: string }
export default function ExpressCheckout({ amount, currency, clientSecret }: Props) {
  const stripe = useStripe()
  const [pr, setPr] = useState<StripePaymentRequest|null>(null)
  const [ready, setReady] = useState(false)

  

  useEffect(() => {
    if (!stripe) return
    
    // Create a new payment request
    const paymentRequest = stripe.paymentRequest({
      country: "US",
      currency: currency.toLowerCase(),
      total: { label: "Order Total", amount },
      requestPayerName: true,
      requestPayerEmail: true,
      requestShipping: true,
    })
    
    // Set up payment method handler
    const paymentMethodHandler = async (ev: any) => {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: ev.paymentMethod.id },
        { handleActions: false }
      )
      
      if (error) {
        ev.complete('fail')
        console.error('Express checkout error:', error)
      } else {
        ev.complete('success')
        if (paymentIntent?.status === 'requires_action') {
          await stripe.confirmCardPayment(clientSecret)
        }
      }
    }
    
    paymentRequest.on('paymentmethod', paymentMethodHandler)
    
    paymentRequest.canMakePayment().then(res => {
      if (res) {
        setPr(paymentRequest)
        setReady(true)
      } else {
        setReady(false)
      }
    })
    
    // Cleanup function
    return () => {
      setReady(false)
      setPr(null)
    }
  }, [stripe, amount, currency, clientSecret])

  if (!ready || !pr) return null
  return <PaymentRequestButtonElement options={{ paymentRequest: pr }} />
}
