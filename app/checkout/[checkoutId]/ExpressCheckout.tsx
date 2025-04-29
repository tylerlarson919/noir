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
    const paymentRequest = stripe.paymentRequest({
      country: "US",
      currency,
      total: { label: "Order Total", amount },
      requestPayerName: true,
      requestPayerEmail: true,
    })
    paymentRequest.on('paymentmethod', async ev => {
        // confirm the PI with the paymentMethod from the request
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
         // if additional actions needed (3DS), let Stripe handle them
         if (paymentIntent?.status === 'requires_action') {
           await stripe.confirmCardPayment(clientSecret)
         }
       }
     })

    paymentRequest.canMakePayment().then(res => {
      if (res) {
        setPr(paymentRequest)
        setReady(true)
      }
    })
  }, [stripe, amount, currency, clientSecret])

  if (!ready || !pr) return null
  return <PaymentRequestButtonElement options={{ paymentRequest: pr }} />
}
