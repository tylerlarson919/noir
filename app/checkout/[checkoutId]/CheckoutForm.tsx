// src/app/checkout/[checkoutId]/CheckoutForm.tsx
"use client";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  PaymentElement,
  AddressElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useParams } from "next/navigation";
import "./checkout.css";
import Link from "next/link";
import { useRef } from "react";
import { debounce } from "lodash";

export default function CheckoutForm({
    onShippingChange,
    paymentIntentId,
  }: {
    paymentIntentId: string;
    onShippingChange: (addr: {
      country: string;
      region?: string;
      postalCode?: string;
      fee: number;
    }) => void;
  }) {
  // pull the current checkoutId from the URL
  const params = useParams();
  const checkoutId = params.checkoutId as string;

  // Stripe hooks & local state must live inside the component
  const elements = useElements();
  const stripe = useStripe();
  const [clientSecret, setClientSecret] = useState<string>();
  const [shippingFee, setShippingFee] = useState<number>(0);
  const debouncedOnShippingChange = useRef(
    debounce(async (addr) => {
      // 1) hit your backend to update the PI (shipping + no paymentIntentId => returns shippingFee & currency)
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipping: {
            // you may not have a name yet—Stripe only needs the address
            address: {
              country:    addr.country,
              state:      addr.region,
              postal_code: addr.postalCode,
            },
          },
          paymentIntentId, // pass your existing PI id here
        }),
      });
      const { checkoutSessionClientSecret, shippingFee: fee } = await res.json();
  
      // 2) stash the new client secret & fee in local state
      setClientSecret(checkoutSessionClientSecret);
      setShippingFee(fee);
  
      // 3) tell Elements to point at the new PI
      if (elements && checkoutSessionClientSecret) {
        ;(elements as any).update({ clientSecret: checkoutSessionClientSecret });
      }
  
      // 4) bubble up the shipping data if you need it elsewhere
      onShippingChange({ ...addr, fee });
    }, 500)
  ).current;
  const [email, setEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [billingDetailsComplete, setBillingDetailsComplete] = useState(false);
  const [receiveEmails, setReceiveEmails] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { user } = useAuth();
  const { clearCart } = useCart();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
        const result = await stripe.confirmPayment({
            elements,
            confirmParams: {
              return_url: `${window.location.origin}/checkout/success?payment_intent={PAYMENT_INTENT_ID}`,
              receipt_email: email || user?.email || undefined,
              payment_method_data: {
                billing_details: {
                  email: email || user?.email,
                },
              }
            },
          });

          if (result.error) {
            setErrorMessage(result.error.message || "Something went wrong with your payment");
          } else {
            // This shouldn't execute as confirmPayment with return_url should redirect
            clearCart();
          }
        } catch (err) {
          console.error("Payment error:", err);
          setErrorMessage("An unexpected error occurred. Please try again.");
        } finally {
          setIsProcessing(false);
        }
      };
    
      

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contact Information */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Contact</h2>
          <Link href="/accounts/login?redirect=/checkout" className={`${user ? 'hidden' : 'relative'} text-sm text-blue-600 hover:underline`}>
            Log in
          </Link>
        </div>
        <div className="mb-4">
          <label 
            htmlFor="email" 
            className="block font-regular mb-1 text-gray-700 dark:text-white text-[14.88px]"
            style={{ fontFamily: 'Apple System, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border dark:border-textaccent/40 rounded focus:outline-none focus:ring-1 focus:ring-green-500 drop-shadow-sm dark:bg-[#30313d]"
            style={{ fontFamily: 'Apple System, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
            required
          />
        </div>
        <div className="checkbox-wrapper-4 -ml-2">
          <input className="inp-cbx" id="morning" type="checkbox" checked={receiveEmails} onChange={(e) => setReceiveEmails(e.target.checked)} />
          <label className="cbx" htmlFor="morning">
            <span>
              <svg width="12px" height="10px">
                <use xlinkHref="#check-4"></use>
              </svg>
            </span>
            <span className="text-[14.88px] text-[#30313D] dark:text-textaccent"
              style={{ fontFamily: 'Apple System, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
            >
              Email me with news and offers
            </span>
          </label>
          <svg className="inline-svg">
            <symbol id="check-4" viewBox="0 0 12 10">
              <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
            </symbol>
          </svg>
        </div>
      </div>

      {/* Shipping */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Shipping</h2>
        <AddressElement 
          options={{
            mode: 'shipping',
            fields: {
              phone: 'always',
            },
            validation: {
              phone: {
                required: 'always',
              },
            },
            defaultValues: {
              address: {
                country: 'US',
              }, 
            },
          }}
          onChange={event => {
            // Still update billing completion status
            if (event.complete) {
              setBillingDetailsComplete(true);
            } else {
              setBillingDetailsComplete(false);
            }
            
            // Trigger shipping calculation when country or postal code changes,
            // even if the entire form isn't complete yet
            if (event.value?.address?.country) {
              debouncedOnShippingChange({
                country:    event.value.address.country,
                region:     event.value.address.state || undefined,
                postalCode: event.value.address.postal_code,
              });
            }
          }}
        />
      </div>

      {/* Payment */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Payment</h2>
        <p 
          className="text-gray-500 dark:text-gray-300 mb-4 text-[14.88px]" 
          style={{ fontFamily: 'Apple System, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
        >
          All transactions are secure and encrypted.
        </p>
        <div className="border rounded p-4 mb-4">
          <PaymentElement />
        </div>
      </div>

      {/* Remember me */}
      <div className="checkbox-wrapper-4 mb-6 -ml-2">
        <input
          className="inp-cbx"
          id="remember-me"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        <label className="cbx" htmlFor="remember-me">
          <span>
            <svg width="12px" height="10px">
              <use xlinkHref="#check-5"></use>
            </svg>
          </span>
          <span className="text-[14.88px] text-[#30313D] dark:text-textaccent"
            style={{ fontFamily: 'Apple System, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
          >
            Save my info for faster checkout
          </span>
        </label>
        <svg className="inline-svg">
          <symbol id="check-5" viewBox="0 0 12 10">
            <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
          </symbol>
        </svg>
      </div>

      {/* Error messages */}
      {errorMessage && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
          {errorMessage}
        </div>
      )}
      <div className="flex flex-col gap-4">
        <button
          type="submit"
          disabled={!stripe || isProcessing || !billingDetailsComplete}
          className="w-full py-3 bg-green-600 text-white rounded font-medium 
          hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? "Processing..." : "Pay now"}
        </button>
        <p 
          className="text-sm text-textaccentdarker dark:text-textaccent"
          style={{ fontFamily: 'Apple System, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
        >
          Your info will be saved to a Link account. By continuing, you agree to acknowledge their 
           <Link href="https://link.com/privacy" className="hover:text-blue-700 hover:dark:text-blue-500 transition-colors underline"> Privacy Policy.</Link>
        </p>
      </div>
    </form>
  );
}


