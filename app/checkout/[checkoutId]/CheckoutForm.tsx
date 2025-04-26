// src/app/checkout/[checkoutId]/CheckoutForm.tsx
"use client";
import { useState } from "react";
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
export default function CheckoutForm() {
  const [email, setEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [billingDetailsComplete, setBillingDetailsComplete] = useState(false);
  const [receiveEmails, setReceiveEmails] = useState(false);
  const [receiveTexts, setReceiveTexts] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { user } = useAuth();
  const { clearCart } = useCart();
  const router = useRouter();
  const { items } = useCart();
  const params = useParams();
  const checkoutId = params.checkoutId as string;
  const stripe = useStripe();
  const elements = useElements();
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
          <Link href="/login?redirect=/checkout" className="text-sm text-blue-600 hover:underline">
            Log in
          </Link>
        </div>
        <div className="mb-4">
          <label 
            htmlFor="email" 
            className="block font-regular mb-1 text-gray-700 text-[14.88px]"
            style={{ fontFamily: 'Apple System, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 drop-shadow-sm"
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
            <span className="text-[14.88px] text-[#30313D]"
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
          onChange={(event) => {
            if (event.complete) {
              setBillingDetailsComplete(true);
            } else {
              setBillingDetailsComplete(false);
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
          <span className="text-[14.88px] text-[#30313D]"
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
          className="text-sm"
          style={{ fontFamily: 'Apple System, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
        >
          Your info will be saved to a Link account. By continuing, you agree to acknowledge their
           <Link href="https://link.com/privacy" className="text-gray-500 dark:text-gray-300 hover:text-blue-700 hover:dark:text-blue-500 transition-colors underline"> Privacy Policy</Link>.
        </p>
      </div>
    </form>
  );
}