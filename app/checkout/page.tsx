"use client";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import {
  CheckoutProvider,
  PaymentElement,
  useCheckout,
} from "@stripe/react-stripe-js";

// loadStripe outside render
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function CheckoutPage() {
  const { totalPrice, items } = useCart();
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Virginia");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("United States");
  const [receiveEmails, setReceiveEmails] = useState(false);
  const [receiveTexts, setReceiveTexts] = useState(false);
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [discountCode, setDiscountCode] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setIsDarkMode(resolvedTheme === "dark");
  }, [resolvedTheme]);

  // must return client secret from your API
  const fetchClientSecret = () =>
    fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        userId: user?.uid || null,
        customerEmail: email,
      }),
    })
      .then((res) => res.json())
      .then((json) => json.checkoutSessionClientSecret);

  return (
    <CheckoutProvider
      stripe={stripePromise}
      options={{ fetchClientSecret }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 py-10">
          {/* Left column */}
          <div className="lg:w-3/5">
            <h1 className="text-2xl font-medium mb-6 hidden lg:block">
              Checkout
            </h1>

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

            <CheckoutFormInner
              totalPrice={totalPrice}
              items={items}
              email={email}
              setEmail={setEmail}
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              phone={phone}
              setPhone={setPhone}
              address={address}
              setAddress={setAddress}
              apartment={apartment}
              setApartment={setApartment}
              city={city}
              setCity={setCity}
              state={state}
              setState={setState}
              zipCode={zipCode}
              setZipCode={setZipCode}
              country={country}
              setCountry={setCountry}
              receiveEmails={receiveEmails}
              setReceiveEmails={setReceiveEmails}
              receiveTexts={receiveTexts}
              setReceiveTexts={setReceiveTexts}
              useSameAddress={useSameAddress}
              setUseSameAddress={setUseSameAddress}
              discountCode={discountCode}
              setDiscountCode={setDiscountCode}
              rememberMe={rememberMe}
              setRememberMe={setRememberMe}
            />
          </div>

          {/* Right column - Summary */}
          <div className="lg:w-2/5 bg-gray-50 p-6 rounded">
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
                    <p className="text-sm text-gray-500">
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
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="flex-grow p-3 border rounded-l"
                />
                <button
                  onClick={() => console.log("apply", discountCode)}
                  className="px-4 py-3 bg-gray-200 rounded-r"
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
                  <span className="text-xs text-gray-500 mr-2">USD</span>
                  <span className="font-medium">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CheckoutProvider>
  );
}

function CheckoutFormInner(props: any) {
  const checkout = useCheckout();
  const [loading, setLoading] = useState(false);
  const {
    email,
    setEmail,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    phone,
    setPhone,
    address,
    setAddress,
    apartment,
    setApartment,
    city,
    setCity,
    state,
    setState,
    zipCode,
    setZipCode,
    country,
    setCountry,
    receiveEmails,
    setReceiveEmails,
    receiveTexts,
    setReceiveTexts,
    useSameAddress,
    setUseSameAddress,
    rememberMe,
    setRememberMe,
  } = props;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await checkout!.confirm();
    if (result.type === "error") {
      alert(result.error.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Contact & Delivery fields (same as before) */}
      {/* ... your existing inputs for email, name, address, etc. ... */}

      {/* Payment */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-4">Payment</h2>
        <p className="text-sm text-gray-600 mb-4">
          All transactions are secure and encrypted.
        </p>
        <div className="border rounded p-4 mb-4">
          <PaymentElement />
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="sameAddress"
              checked={useSameAddress}
              onChange={(e) => setUseSameAddress(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="sameAddress" className="text-sm text-gray-600">
              Use shipping address as billing address
            </label>
          </div>
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
          <label htmlFor="rememberMe" className="text-sm text-gray-600">
            Save my info for faster checkout
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-green-600 text-white rounded font-medium"
      >
        {loading ? "Processing…" : "Pay now"}
      </button>
    </form>
  );
}
