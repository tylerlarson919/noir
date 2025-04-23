// src/app/checkout/success/page.tsx
"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();
  
  // Clear the cart when the success page loads
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="mx-4 flex flex-col justify-start items-center">
      <div className="flex flex-col w-full h-full items-center justify-start mt-28 gap-4 max-w-[800px] text-center">
        <div className="mb-6 text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-semibold">Order Confirmed!</h1>
        <p className="text-lg my-4">Thank you for your purchase. We've received your order and will begin processing it right away.</p>
        
        <div className="my-8 p-6 bg-white/30 dark:bg-dark1/30 backdrop-blur-md rounded-sm shadow-sm w-full">
          <h2 className="text-xl font-medium mb-4">What's Next?</h2>
          <p className="mb-4">You will receive an email confirmation with your order details and tracking information once your order ships.</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            If you have any questions about your order, please contact our customer support team.
          </p>
        </div>
        
        <Link
          href="/all"
          className="mt-6 px-8 py-3 bg-dark1 dark:bg-white text-white dark:text-black button-grow-subtle rounded-sm inline-block"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}