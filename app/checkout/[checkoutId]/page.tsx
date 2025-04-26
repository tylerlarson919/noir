// src/app/checkout/[checkoutId]/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import { useParams, useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
// Initialize Stripe outside of component
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function CheckoutPage() {
  const { totalPrice, items } = useCart();
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const checkoutId = params.checkoutId as string;

  useEffect(() => {
    setIsDarkMode(resolvedTheme === "dark");
  }, [resolvedTheme]);

  // Create payment intent and get client secret
  useEffect(() => {
    if (!items.length) return;

    const fetchPaymentIntent = async () => {
      try {
        const response = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            userId: user?.uid || null,
            customerEmail: user?.email || "",
            checkoutId,
          }),
        });

        const data = await response.json();
        setClientSecret(data.checkoutSessionClientSecret);
      } catch (error) {
        console.error("Error creating payment intent:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentIntent();
  }, [items, user, checkoutId]);

  // Ensure we have a checkout ID in the URL
  useEffect(() => {
    if (!checkoutId || checkoutId === "new") {
      // Generate a new checkout ID and redirect
      const newCheckoutId = uuidv4();
      router.replace(`/checkout/${newCheckoutId}`);
    }
  }, [checkoutId, router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="animate-pulse">Loading checkout...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="py-6 flex justify-between items-center border-b border-gray-200">
        <Link aria-label="Noir Home" href="/">
          <Image
            alt="Noir Logo"
            className="h-auto dark:invert transition-all duration-300"
            height={32}
            src="/noir-logo-full.svg"
            width={100}
            priority={true}
          />
        </Link>
        <Link
            aria-label="Open shopping cart"
            className="relative p-2 text-black hover:text-black/70 dark:text-white dark:hover:text-white/70 transition-colors"
            href="/cart"
          >
            <svg
              className="size-8"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 0 0 4.25 22.5h15.5a1.875 1.875 0 0 0 1.865-2.071l-1.263-12a1.875 1.875 0 0 0-1.865-1.679H16.5V6a4.5 4.5 0 1 0-9 0ZM12 3a3 3 0 0 0-3 3v.75h6V6a3 3 0 0 0-3-3Zm-3 8.25a3 3 0 1 0 6 0v-.75a.75.75 0 0 1 1.5 0v.75a4.5 4.5 0 1 1-9 0v-.75a.75.75 0 0 1 1.5 0v.75Z"
                fillRule="evenodd"
              />
            </svg>
          </Link>
      </div>
      <div className="flex flex-col lg:flex-row gap-8 py-10">
        {/* Left column */}
        <div className="lg:w-3/5">

          {/* Express checkout */}
          <div className="mb-8">
            <p className="text-center text-sm text-gray-500 mb-3">
              Express checkout
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => console.log("shopPay")}
                className="bg-[#5A31F4] text-white py-3 rounded"
              >
                Shop Pay
              </button>
              <button
                onClick={() => console.log("payPal")}
                className="bg-[#FFC439] py-3 rounded"
              >
                PayPal
              </button>
              <button
                onClick={() => console.log("googlePay")}
                className="bg-black text-white py-3 rounded"
              >
                G Pay
              </button>
            </div>
            <div className="flex items-center my-4">
              <div className="flex-grow h-px bg-gray-200" />
              <span className="px-3 text-gray-500 text-sm">OR</span>
              <div className="flex-grow h-px bg-gray-200" />
            </div>
          </div>

          {clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: isDarkMode ? "night" : "stripe",
                },
              }}
            >
              <CheckoutForm />
            </Elements>
          )}
        </div>

        {/* Right column - Summary */}
        <div className="lg:w-2/5 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <div className="max-h-80 overflow-y-auto mb-6">
            {items.map((item, i) => (
              <div
                key={`${item.id}-${i}`}
                className="flex items-center mb-4 border-b pb-4"
              >
                <div className="relative w-16 h-16 bg-gray-200 rounded mr-4">
                  <div className="absolute top-0 right-0 w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs">
                    {item.quantity}
                  </div>
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex-grow">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    {item.size} / {item.color.name}
                  </p>
                </div>
                <div className="text-right">
                  <p>${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Discount code"
                className="flex-grow p-3 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => console.log("apply discount")}
                className="px-4 py-3 bg-gray-200 dark:bg-gray-600 rounded-r hover:bg-gray-300 dark:hover:bg-gray-500 transition"
              >
                Apply
              </button>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between py-2">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Shipping</span>
              <span>Enter shipping address</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between">
              <span className="font-medium">Total</span>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-300 mr-2">USD</span>
                <span className="font-medium">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}