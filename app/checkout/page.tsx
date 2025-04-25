// src/app/checkout/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function CheckoutRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Generate a new checkout ID and redirect
    const checkoutId = uuidv4();
    router.replace(`/checkout/${checkoutId}`);
  }, [router]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="animate-pulse">Preparing checkout...</div>
    </div>
  );
}