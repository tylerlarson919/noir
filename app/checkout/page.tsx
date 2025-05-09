// src/app/checkout/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import Loader from "@/components/loading-screen/Loader";
export default function CheckoutRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Generate a new checkout ID and redirect
    const checkoutId = uuidv4();
    router.replace(`/checkout/${checkoutId}`);
  }, [router]);

  return (
    <Loader/>
  );
}