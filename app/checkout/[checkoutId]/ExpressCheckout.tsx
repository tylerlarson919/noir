// src/app/checkout/[checkoutId]/ExpressCheckout.tsx
"use client"
import { useEffect, useState } from "react"
import { useStripe, PaymentRequestButtonElement } from "@stripe/react-stripe-js"
import type { PaymentRequest as StripePaymentRequest } from "@stripe/stripe-js"

interface Props { amount: number; currency: string }
export default function ExpressCheckout({ amount, currency }: Props) {
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
    paymentRequest.canMakePayment().then(res => {
      if (res) {
        setPr(paymentRequest)
        setReady(true)
      }
    })
  }, [stripe, amount, currency])

  if (!ready || !pr) return null
  return <PaymentRequestButtonElement options={{ paymentRequest: pr }} />
}
