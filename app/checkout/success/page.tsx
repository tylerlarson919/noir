// src/app/checkout/success/page.tsx
"use client";

import { useEffect, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { doc, getDoc, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

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

  useEffect(() => {
    if (!paymentIntentId) {
      router.replace("/checkout");
      return;
    }
    
    const fetchOrderDetails = async () => {
      console.log("Fetching order details for payment intent:", paymentIntentId);
      try {
        const orderDoc = await getDoc(doc(db, "orders", paymentIntentId!));
        if (orderDoc.exists()) {
          setOrderDetails(orderDoc.data() as OrderDetails);
          console.log("order details from db:", orderDoc.data());
          setLoading(false);
        } else {
          setError("Order not found.");
        }
      } catch {
        setError("Error fetching order details.");
      }
    };

    fetchOrderDetails();
  }, [paymentIntentId]);

  if (loading) {
    return (
      <div className="mx-4 flex flex-col justify-start items-center">
        <div className="flex flex-col w-full h-full items-center justify-start mt-28 gap-4 max-w-[800px] text-center">
          <div className="animate-pulse">
            <div className="h-24 w-24 mx-auto rounded-full bg-gray-200 dark:bg-gray-700"></div>
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
      <div className="mx-4 flex flex-col justify-start items-center">
        <div className="flex flex-col w-full h-full items-center justify-start mt-28 gap-4 max-w-[800px] text-center">
          <div className="mb-6 text-red-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-24 w-24 mx-auto"
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

          <h1 className="text-3xl md:text-4xl font-semibold">
            Payment Issue
          </h1>
          <p className="text-lg my-4">
            {error || "There was a problem processing your payment."}
          </p>

          <div className="my-8 p-6 bg-white/30 dark:bg-dark1/30 backdrop-blur-md rounded-sm shadow-sm w-full">
            <h2 className="text-xl font-medium mb-4">What to do next</h2>
            <p className="mb-4">
              Please check your payment method and try again. If you believe this is an error, please contact our
              customer support team.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              If your payment was processed but you&apos;re seeing this message, please email us at 
              <a href="mailto:support@yourdomain.com" className="ml-1 underline">
                support@yourdomain.com
              </a>
              .
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.push("/checkout")}
              className="mt-6 px-8 py-3 bg-dark1 dark:bg-white text-white dark:text-black button-grow-subtle rounded-sm"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/")}
              className="mt-6 px-8 py-3 border border-dark1 dark:border-white text-dark1 dark:text-white button-grow-subtle rounded-sm"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success case
  return (
    <div className="mx-4 flex flex-col justify-start items-center">
      <div className="flex flex-col w-full h-full items-center justify-start mt-28 gap-4 max-w-[800px] text-center">
        <div className="mb-6 text-green-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-24 w-24 mx-auto"
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

        <h1 className="text-3xl md:text-4xl font-semibold">Order Confirmed!</h1>
        <p className="text-lg my-4">
          Thank you for your purchase. We&apos;ve received your order and will
          begin processing it right away.
        </p>

        {orderDetails && (
          <div className="my-4 p-4 border rounded w-full text-left">
            <h2 className="text-lg font-medium mb-2">Order Details</h2>
            <p><span className="font-medium">Order ID:</span> {paymentIntentId}</p>
            <p><span className="font-medium">Status:</span> {orderDetails.shipping?.status || "Processing"}</p>
            <p><span className="font-medium">Amount:</span> ${(orderDetails.amount?.total || 0).toFixed(2)}</p>
            {orderDetails.email && <p><span className="font-medium">Email:</span> {orderDetails.email}</p>}
            {orderDetails.items && (
              <div className="mt-2">
                <p className="font-medium">Items:</p>
                <ul className="list-disc pl-5">
                  {orderDetails.items.map((item: OrderItem, index: number) => (
                    <li key={index}>{item.name} x {item.quantity}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="my-8 p-6 bg-white/30 dark:bg-dark1/30 backdrop-blur-md rounded-sm shadow-sm w-full">
          <h2 className="text-xl font-medium mb-4">What&apos;s Next?</h2>
          <p className="mb-4">
            You will receive an email confirmation with your order details and
            tracking information once your order ships. You can also track the status of your order{" "}
            <Link href={`/track-order?id=${paymentIntentId}`} className="underline">
              here
            </Link>
            .
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            If you have any questions about your order, please contact our
            customer support team.
          </p>
        </div>

        <button
          onClick={() => router.push("/")}
          className="mt-6 px-8 py-3 bg-dark1 dark:bg-white text-white dark:text-black button-grow-subtle rounded-sm"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="mx-4 flex flex-col justify-start items-center mt-28">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-24 w-24 bg-gray-200 dark:bg-gray-700 rounded-full mb-6"></div>
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    }>
      <CheckoutResultContent />
    </Suspense>
  );
}