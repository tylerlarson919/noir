// src/app/checkout/[checkoutId]/page.tsx
"use client";
import { useState, useEffect, useRef } from "react";
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
import ShippingPolicyModal from "@/components/shippingPolicyModal";
import ExpressCheckout from "./ExpressCheckout";



// Initialize Stripe outside of component
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function CheckoutPage() {
  const { totalPrice, items } = useCart();
  const [currency, setCurrency] = useState("usd");
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const checkoutId = params.checkoutId as string;
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const [isShippingPolicyOpen, setIsShippingPolicyOpen] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<{
    country: string;
    region?: string;
    postalCode?: string
  } | null>(null);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [orderTotal, setOrderTotal] = useState<number>(totalPrice || 0);
  const addressRef = useRef<{
    country: string;
    region?: string;
    postalCode?: string
  } | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [isShippingCalculated, setIsShippingCalculated] = useState(false);
  const [expressReady, setExpressReady] = useState(false);
  const [formReady, setFormReady] = useState(false);


  useEffect(() => {
    setIsDarkMode(resolvedTheme === "dark");
  }, [resolvedTheme]);

  // Create payment intent and get client secret
  // 1) create PI immediately on items (no shipping)
  useEffect(() => {
    if (!items.length) return;
    const createIntent = async () => {
      const payload: any = {
        items,
        userId: user?.uid || "guest-user",
        ...(user?.email && { customerEmail: user.email }),
        checkoutId
      };
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const { checkoutSessionClientSecret, paymentIntentId: piId, currency: respCurrency } = await res.json();
      setClientSecret(checkoutSessionClientSecret);
      setPaymentIntentId(piId || ""); // Store the payment intent ID
      setCurrency(respCurrency);
      setLoading(false);
    };
    createIntent();
  }, [items, user, checkoutId]);

  useEffect(() => {
    /* guard against undefined → NaN */
    const price   = typeof totalPrice   === 'number' ? totalPrice   : 0;
    const shipfee = typeof shippingFee  === 'number' ? shippingFee  : 0;
    setOrderTotal(price + shipfee);
  }, [totalPrice, shippingFee]);

  // Update when shipping changes and API returns
  useEffect(() => {
    if (shippingAddress === null) return;
    
    // React to a change of *country* only
    if (addressRef.current?.country !== shippingAddress.country) {
      
      addressRef.current = shippingAddress;
      
      const updateShippingOnly = async () => {
        const payload = {
          items,
          userId: user?.uid || "guest-user",
          ...(user?.email && { customerEmail: user.email }),
          checkoutId,
          shipping: shippingAddress,
          paymentIntentId 
        };
        
        try {
          const res = await fetch("/api/create-checkout-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          
          const { shippingFee: newFee, currency: respCurrency } = await res.json();
          if (typeof newFee === 'number') {
            setShippingFee(newFee);
            setCurrency(respCurrency);
            setIsShippingCalculated(true);
          }
        } catch (error) {
          console.error("Error updating shipping:", error);
        }
      };
      
      updateShippingOnly();
    } else {
      // If it's the same address, don't reload
      setLoading(false);
    }
  }, [shippingAddress, items, user, checkoutId, paymentIntentId]);

  // Ensure we have a checkout ID in the URL
  useEffect(() => {
    if (!checkoutId || checkoutId === "new") {
      // Generate a new checkout ID and redirect
      const newCheckoutId = uuidv4();
      router.replace(`/checkout/${newCheckoutId}`);
    }
  }, [checkoutId, router]);

  const openShippingPolicy = () => {
    setIsShippingPolicyOpen(true);
  };
  
  const closeShippingPolicy = () => {
    setIsShippingPolicyOpen(false);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="animate-pulse">Loading checkout...</div>
      </div>
    );
  }

  // Transform items to match ExpressCheckoutProps
  const transformedItems = items.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    size: item.size,
    color: {
      name: item.color.name,
      value: item.color.hex, // Use hex as value
    },
    image: item.image,
  }));

  return (
    <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10 relative">
      <ShippingPolicyModal 
        isOpen={isShippingPolicyOpen} 
        onClose={closeShippingPolicy} 
      />
      <div className="py-6 flex justify-between items-center border-b dark:border-textaccent/40">
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
      <div className="flex flex-col-reverse lg:flex-row gap-8 pb-10 relative">
        {/* Left column */}
        <div className="lg:w-3/5 pt-0 lg:pt-10">

          {/* Express checkout */}
          {clientSecret && (
            <Elements
              stripe={stripePromise}
              options={({
                clientSecret,
                appearance: { theme: isDarkMode ? "night" : "stripe" },
              } as any)}
            >
              {/* Express checkout */}
              <div className="mb-8">
                <p className="text-center text-sm text-gray-500 dark:text-textaccent mb-3">
                  Express checkout
                </p>
                  {/* Skeleton while Stripe mounts */}
                  {!expressReady && (
                    <div className="h-[56px] w-full bg-gray-200 dark:bg-textaccent/20 animate-pulse rounded-sm mb-4">
                    </div>
                  )}
                  <div className={`fade-in ${expressReady ? 'show' : ''}`}>
                    <ExpressCheckout
                      clientSecret={clientSecret}
                      currency={currency}
                      paymentIntentId={paymentIntentId}
                      onReady={() => setExpressReady(true)}
                    />
                  </div>
                <div className="flex items-center my-4">
                  <div className="flex-grow h-px bg-gray-200 dark:bg-textaccent/40 " />
                  <span className="px-3 text-gray-500 dark:text-textaccent text-sm">OR</span>
                  <div className="flex-grow h-px bg-gray-200 dark:bg-textaccent/40" />
                </div>
              </div>

              {!formReady && (
                <div className="h-[420px] w-full bg-gray-200 dark:bg-textaccent/20 animate-pulse rounded-sm">
                </div>
              )}
              <div className={`fade-in ${formReady ? 'show' : ''}`}>
                <CheckoutForm
                  paymentIntentId={paymentIntentId}
                  onReady={() => setFormReady(true)}
                  onShippingChange={({ country, region, postalCode, fee }) => {
                    setShippingAddress({ country, region, postalCode });
                    setShippingFee(fee);
                  }}
                />
              </div>
            </Elements>
          )}
        </div>

        {/* Right column - Summary */}
        <div 
          className="w-full lg:w-2/5 bg-[#f5f5f5] dark:bg-darkaccent p-6 lg:px-6 lg:pt-10 rounded-sm"
          style={{ fontFamily: 'Apple System, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}

        >
          {/* Toggle button for mobile */}
          <div className="lg:hidden">
            <button 
              onClick={() => setIsSummaryVisible(!isSummaryVisible)}
              className="flex justify-between w-full items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <div className="flex flex-row gap-3 items-center">
                <span className="font-medium">Order Summary</span>
                <svg 
                  className={`w-5 h-5 transition-transform ${isSummaryVisible ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <p className="text-xl font-medium">${(totalPrice ?? 0).toFixed(2)}</p>
            </button>
          </div>
          <div className={`${isSummaryVisible ? 'max-h-[1000px] mt-4' : 'max-h-0'} lg:max-h-[1000px] overflow-hidden transition-all duration-300 ease-in-out lg:overflow-visible`}>
            <div className="max-h-80 overflow-y-auto mb-6">

              {items.map((item, i) => (
                <div
                  key={`${item.id}-${i}`}
                  className="flex items-center mb-4 border-b pb-4 dark:border-textaccent/40"
                >
                  <div className="relative w-[72px] h-[72px] bg-white rounded mr-4">
                    <div className="absolute top-0 right-0 w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs">
                      {item.quantity}
                    </div>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain rounded-lg p-1"
                    />
                  </div>
                  <div className="flex-grow">
                    <p className="">{item.name}</p>
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
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Discount code"
                  className="flex-grow p-3 border dark:border-textaccent/40 rounded-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                <button
                  onClick={() => console.log("apply discount")}
                  className="px-4 py-3 bg-white dark:bg-black rounded-sm hover:bg-gray-300 dark:hover:bg-black/80 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between py-2">
                <span className="text-sm">
                  Subtotal • {items.reduce((total, item) => total + item.quantity, 0)} {items.reduce((total, item) => total + item.quantity, 0) === 1 ? 'item' : 'items'}
                </span>
                <span>${(totalPrice ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <div className="flex flex-row items-center gap-2">
                <span className="text-sm">Shipping</span>
                  <button onClick={openShippingPolicy}>
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.529 9.988a2.502 2.502 0 1 1 5 .191A2.441 2.441 0 0 1 12 12.582V14m-.01 3.008H12M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                    </svg>
                  </button>
                </div>
                {isShippingCalculated ? (
                  <span>${(shippingFee ?? 0).toFixed(2)}</span>
                ) : (
                  <span className="text-gray-500 dark:text-gray-300 text-sm">Enter shipping address</span>
                )}
              </div>
            </div>
            <div className="border-t pt-4 dark:border-textaccent/40">
              <div className="flex justify-between">
                <span className="font-medium text-lg">Total</span>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-300 mr-2">
                    {currency?.toUpperCase() || 'USD'}
                  </span>
                  <span className="font-medium text-lg">
                    ${(orderTotal || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}