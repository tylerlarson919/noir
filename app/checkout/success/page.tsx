// src/app/checkout/success/page.tsx
"use client";

import { useEffect, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useCart } from "@/context/CartContext";          
import Image from "next/image";
// Define types for order details
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  size?: string;
  color?: { name: string; value: string };
  image?: string;
}

interface OrderDetails {
  orderId?: string;
  paymentStatus?: string;
  shipping?: {
    status: string;
    trackingNumber?: string;
    carrier?: string;
    updatedAt?: string;
  };
  amount?: {
    total: number;
    subtotal: number;
    shipping?: number;
  };
  email?: string;
  items?: OrderItem[];
  [key: string]: any; 
}

function CheckoutResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get("payment_intent");
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { clearCart } = useCart();
  
  useEffect(() => {
    if (!paymentIntentId) {
      router.replace("/checkout");
      return;
    }
    
    // Create a flag to track if we've already fetched data successfully
    let hasFetched = false;
    
    const fetchOrderDetails = async () => {
      // Skip if we've already successfully fetched
      if (hasFetched) return;
      
      console.log("Fetching order details for payment intent:", paymentIntentId);
      
      try {
        const orderDoc = await getDoc(doc(db, "orders", paymentIntentId));
        if (orderDoc.exists()) {
          const data = orderDoc.data() as OrderDetails;
          setOrderDetails(data);
          console.log("order details set");
          clearCart();
          setLoading(false);
          hasFetched = true; // Mark as fetched successfully
        } else {
          setError("Order not found. Please refresh or contact customer support.");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Error fetching order details. Please try again.");
        setLoading(false);
      }
    };
    
    // Better delay using window.setTimeout for cross‑device support
  let timerId: number;
    if (typeof window !== 'undefined') {
      timerId = window.setTimeout(fetchOrderDetails, 2000);
    }
    // clean up
    return () => {
      if (timerId) window.clearTimeout(timerId);
    };
  }, [paymentIntentId]);

  if (loading) {
    return (
      <div className="mx-4 flex flex-col justify-start items-center">
        <div className="flex flex-col w-full h-full items-center justify-start mt-28 gap-4 max-w-[800px] text-center">
          <div className="animate-pulse">
            <div className="h-24 w-24 mx-auto rounded-full bg-gray-200 dark:bg-white/10"></div>
          </div>
          <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mt-4"></div>
          <div className="h-40 w-full bg-gray-200 dark:bg-gray-700 rounded mt-8"></div>
        </div>
      </div>
    );
  }

  // If there's an error or payment failed
  if (error || (orderDetails && orderDetails.paymentStatus === "failed")) {
    return (
      <div className="mx-auto flex flex-col items-center max-w-[800px] px-4 py-10 stagger-fadein">
        <div className="text-red-600 mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
  
        <h1 className="text-4xl font-bold mb-4">
          Payment Issue
        </h1>
        <p className="text-lg mb-8">
          {error || "There was a problem processing your payment."}
        </p>
  
        <div className="my-4 p-6 ordber border-gray-200 dark:border-textaccent/40 rounded-lg w-full">
          <h2 className="text-2xl font-bold mb-4">What to do next</h2>
          <p className="mb-4">
            Please check your payment method and try again. If you believe this is an error, please contact our
            customer support team.
          </p>
          <p className="text-center text-gray-600 dark:text-textaccent text-sm">
            If your payment was processed but you&apos;re seeing this message, please email us at 
            <a href="mailto:support@yourdomain.com" className="ml-1 underline">
              support@noir-clothing.com
            </a>
            .
          </p>
        </div>
  
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => router.push("/cart")}
            className="px-8 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition"
          >
            Back to Cart
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-8 py-3 border border-gray-200 dark:border-textaccent/40 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Success case
  return (
    <div className="mx-auto flex flex-col items-center max-w-[800px] px-4 py-10 stagger-fadein">
      <div className="text-green-600 mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
  
      <h1 className="text-4xl font-bold mb-4">Order Confirmed!</h1>
      <p className="text-lg mb-8">
        Thank you for your order! You will receive email confirmation shortly.
      </p>
  
      {orderDetails && (
        <div className="my-4 p-6 border border-gray-200 dark:border-textaccent/40 rounded-lg w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Order #{paymentIntentId?.substring(3, 9)}</h2>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm capitalize">
              {orderDetails.shipping?.status || "Preparing"}
            </span>
          </div>
          
          <div className="divide-y">
            {orderDetails.items && orderDetails.items.map((item, index) => (
              <div key={index} className="py-4 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-16 h-16 mr-4 bg-gray-100 rounded-md overflow-hidden">
                    <Image
                      src={item.image || "/placeholder.png"}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-textaccent">
                      {item.size} / {item.color ? JSON.stringify(item.color) : ""}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-textaccent">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-medium">${item.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4 mt-4 border-gray-200 dark:border-textaccent/40">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md">Subtotal</h3>
              <p>${(orderDetails.amount?.subtotal || 0).toFixed(2)}</p>
            </div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md">Shipping</h3>
              <p>
                ${orderDetails.amount?.shipping !== undefined 
                  ? orderDetails.amount.shipping.toFixed(2) 
                  : ((orderDetails.amount?.total || 0) - (orderDetails.amount?.subtotal || 0)).toFixed(2)}</p>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-textaccent/40">
              <h3 className="text-lg font-bold">Total</h3>
              <p className="text-lg font-bold">${(orderDetails.amount?.total || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
  
      <div className="my-8 w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">What&apos;s Next?</h2>
        <p className="text-center mb-2">
          You will receive an email confirmation shortly. You can track the status of your order{" "}
          <Link href="/account" className="underline font-medium">
            here
          </Link>.
        </p>
        <p className="text-center text-gray-600 dark:text-textaccent text-sm">
          If you have any questions about your order, please contact our customer support team.
        </p>
      </div>
  
      <button
        onClick={() => router.push("/")}
        className="mt-4 px-8 py-3 bg-black text-white font-medium rounded-md hover:bg-black/60 transition"
      >
        Continue Shopping
      </button>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="mx-4 flex flex-col justify-start items-center mt-28">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-24 w-24 bg-gray-200 dark:bg-white/10 rounded-full mb-6"></div>
          <div className="h-8 w-64 bg-gray-200 dark:bg-white/10 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 dark:bg-white/10 rounded"></div>
        </div>
      </div>
    }>
      <CheckoutResultContent />
    </Suspense>
  );
}
