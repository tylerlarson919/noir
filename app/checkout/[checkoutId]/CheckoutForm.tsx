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
              return_url: `${window.location.origin}/checkout/success?session_id={PAYMENT_INTENT_ID}`,
              receipt_email: email || user?.email || undefined,
              payment_method_data: {
                billing_details: {
                  email: email || user?.email,
                },
              }
              // Remove the metadata and redirect options - they're not supported in this API
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
        <h2 className="text-lg font-medium mb-4">Contact Information</h2>
        <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="youremail@example.com"
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            />
        </div>

        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="receiveEmails"
            checked={receiveEmails}
            onChange={(e) => setReceiveEmails(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="receiveEmails" className="text-sm text-gray-600 dark:text-gray-300">
            Email me with news and offers
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="receiveTexts"
            checked={receiveTexts}
            onChange={(e) => setReceiveTexts(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="receiveTexts" className="text-sm text-gray-600 dark:text-gray-300">
            Text me with news and offers
          </label>
        </div>
      </div>

      {/* Shipping */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-4">Shipping Address</h2>
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
        <h2 className="text-lg font-medium mb-4">Payment</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          All transactions are secure and encrypted.
        </p>
        <div className="border rounded p-4 mb-4">
          <PaymentElement />
        </div>
      </div>

      {/* Remember me */}
      <div className="mb-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="rememberMe" className="text-sm text-gray-600 dark:text-gray-300">
            Save my info for faster checkout
          </label>
        </div>
      </div>

      {/* Error messages */}
      {errorMessage && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing || !billingDetailsComplete}
        className="w-full py-3 bg-green-600 text-white rounded font-medium 
        hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isProcessing ? "Processing..." : "Pay now"}
      </button>
    </form>
  );
}