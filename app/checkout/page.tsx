// src/app/checkout/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
  AddressElement,
} from "@stripe/react-stripe-js";
import { useAuth } from "@/context/AuthContext";
// Load stripe outside of component render to avoid recreating the Stripe object on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const { totalPrice, items } = useCart();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Get current user

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    if (items.length > 0) {
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color.name
          })),
          amount: totalPrice,
          userId: user?.uid || null,
          cartItems: JSON.stringify(items),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
            setClientSecret(data.clientSecret);
            setLoading(false);
        })
        .catch((error) => {
            console.error("Error:", error);
            setLoading(false);
        });
        } else {
        setLoading(false);
        }
    }, [items, totalPrice, user]);

  return (
    <div className="mx-4 flex flex-col justify-start items-center">
      <div className="flex flex-col w-full h-full items-center justify-start mt-28 gap-4 max-w-[1200px]">
        <h1 className="text-4xl w-full text-left pl-6">Checkout</h1>
        
        {items.length === 0 ? (
          <div className="py-12 text-center">
            <h2 className="text-xl mb-2">Your shopping bag is empty</h2>
            <p className="mb-4">Add items to your cart before checking out</p>
            <a href="/all" className="inline-flex items-center px-6 py-3 bg-dark1 dark:bg-white text-white dark:text-black button-grow-subtle rounded-sm">
              Continue Shopping
            </a>
          </div>
        ) : loading ? (
          <div className="py-12 text-center">
            <p>Loading checkout...</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 w-full">
            <div className="lg:w-1/2 p-6">
              <h2 className="text-xl font-medium mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {items.map((item, index) => (
                  <div key={`${item.id}-${item.size}-${item.color.name}-${index}`} className="flex justify-between border-b pb-3">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Size: {item.size} • Color: {item.color.name} • Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold text-lg mb-2">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 p-6 bg-white/30 dark:bg-dark1/30 backdrop-blur-md rounded-sm shadow-sm">
              <h2 className="text-xl font-medium mb-6">Payment Details</h2>
              {clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm />
                </Elements>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { clearCart } = useCart();

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formComplete, setFormComplete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message || "An unexpected error occurred.");
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      setMessage("Payment successful!");
      clearCart(); // Clear cart immediately
      // Navigate to success page
      setTimeout(() => {
        router.push("/checkout/success");
      }, 1000);
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };
  
  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <AddressElement options={{
        mode: 'shipping',
        allowedCountries: ['US', 'CA', 'GB'],
      }} />
      
      <div className="my-6">
        <PaymentElement id="payment-element" onChange={(e) => setFormComplete(e.complete)} />
      </div>
      
      <button
        disabled={isLoading || !stripe || !elements || !formComplete}
        className="w-full py-3 px-4 bg-dark1 dark:bg-white text-white dark:text-black text-center font-medium button-grow-subtle rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Processing..." : "Pay Now"}
      </button>
      
      {message && <div className="mt-4 text-center text-red-600">{message}</div>}
    </form>
  );
}