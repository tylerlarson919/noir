"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import Image from "next/image";

// Load stripe outside of component render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const { totalPrice, items } = useCart();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { resolvedTheme } = useTheme();
  
  // Form state
  const [email, setEmail] = useState(user?.email || "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    setIsDarkMode(resolvedTheme === "dark");
  }, [resolvedTheme]);

  const handleCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          userId: user?.uid || null,
          customerEmail: email || user?.email,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }
      
      const { sessionId } = await res.json();
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Failed to load Stripe");
      }
      
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw new Error(error.message);
      }
    } catch (err: unknown) {
      console.error("Checkout error:", err);
      // Safely access error message
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      alert(`Checkout error: ${errorMessage}`);
      setLoading(false);
    }
  };

  return (
    <div className="mx-4 flex flex-col justify-start items-center">
      <div className="flex flex-col w-full h-full items-center justify-start mt-28 gap-4 max-w-[1200px]">
        <h1 className="text-4xl w-full text-left pl-6 font-medium">Checkout</h1>

        {items.length === 0 ? (
          <div className="py-12 text-center">
            <h2 className="text-xl mb-2">Your shopping bag is empty</h2>
            <p className="mb-4">Add items to your cart before checking out</p>
            <a
              href="/all"
              className="inline-flex items-center px-6 py-3 bg-dark1 dark:bg-white text-white dark:text-black button-grow-subtle rounded-sm"
            >
              Continue Shopping
            </a>
          </div>
        ) : loading ? (
          <div className="py-12 text-center">
            <p>Processing your order...</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row w-full gap-4">
            {/* Customer Information Form */}
            <div className="lg:w-1/2 p-6 bg-white/30 dark:bg-darkaccent backdrop-blur-md rounded-sm shadow-sm">
              <form onSubmit={handleCheckout}>
                <h2 className="text-xl font-medium mb-6">Your Information</h2>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label htmlFor="email" className="block mb-1 text-sm font-medium">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2 border rounded-sm focus:ring-1 focus:ring-dark1 dark:bg-dark1/30"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="name" className="block mb-1 text-sm font-medium">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2 border rounded-sm focus:ring-1 focus:ring-dark1 dark:bg-dark1/30"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block mb-1 text-sm font-medium">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2 border rounded-sm focus:ring-1 focus:ring-dark1 dark:bg-dark1/30"
                      required
                    />
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                  You&apos;ll complete your shipping and payment details in the next step.
                </p>
                
                <button
                  type="submit"
                  disabled={loading || items.length === 0}
                  className="w-full py-3 bg-dark1 dark:bg-white text-white dark:text-black rounded-sm disabled:opacity-50"
                >
                  {loading ? "Processing…" : "Continue to Payment"}
                </button>
              </form>
            </div>
            
            {/* Order Summary */}
            <div className="lg:w-1/2 p-6">
              <h2 className="text-xl font-medium mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {items.map((item, index) => (
                  <div
                    key={`${item.id}-${item.size}-${item.color.name}-${index}`}
                    className="flex justify-start border-b pb-2 gap-4"
                  >
                    <div className="relative w-20 h-20">
                      <Image 
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex flex-col gap-1 w-full justify-start">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Size: {item.size} • Color: {item.color.name} • Qty:{" "}
                        {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="pt-4">
                <div className="flex justify-between font-semibold text-lg mb-2">
                  <span>Total</span>
                  <div className="flex gap-2 h-full items-end">
                    <span className="text-sm font-normal">USD</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}