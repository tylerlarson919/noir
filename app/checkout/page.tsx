"use client";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import Image from "next/image";

// Load stripe outside of component render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const { totalPrice, items } = useCart();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { resolvedTheme } = useTheme();
  
  // Form state
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
  
  useEffect(() => {
    setIsDarkMode(resolvedTheme === "dark");
  }, [resolvedTheme]);

  const handleExpressCheckout = async (provider: string) => {
    // Placeholder for express checkout integration
    console.log(`${provider} express checkout clicked`);
  };

  const handleApplyDiscount = () => {
    // Placeholder for discount code logic
    console.log(`Applied discount: ${discountCode}`);
  };

  const handleCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          userId: user?.uid || null,
          customerEmail: email || user?.email,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }
      
      const { sessionId } = await res.json();
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Failed to load Stripe");
      }
      
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      alert(`Checkout error: ${errorMessage}`);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8 py-10">
        {/* Left column - Checkout form */}
        <div className="lg:w-3/5">
          <h1 className="text-2xl font-medium mb-6 hidden lg:block">Checkout</h1>
          
          {/* Express checkout */}
          <div className="mb-8">
            <p className="text-center text-sm text-gray-500 mb-3">Express checkout</p>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => handleExpressCheckout('shopPay')}
                className="bg-[#5A31F4] text-white py-3 rounded flex items-center justify-center"
              >
                <span>Shop Pay</span>
              </button>
              <button 
                onClick={() => handleExpressCheckout('payPal')}
                className="bg-[#FFC439] py-3 rounded flex items-center justify-center"
              >
                <span>PayPal</span>
              </button>
              <button 
                onClick={() => handleExpressCheckout('googlePay')}
                className="bg-black text-white py-3 rounded flex items-center justify-center"
              >
                <span>G Pay</span>
              </button>
            </div>
            <div className="flex items-center my-4">
              <div className="flex-grow h-px bg-gray-200"></div>
              <span className="px-3 text-gray-500 text-sm">OR</span>
              <div className="flex-grow h-px bg-gray-200"></div>
            </div>
          </div>

          <form onSubmit={handleCheckout}>
            {/* Contact section */}
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-4">Contact</h2>
              <div className="mb-4">
                <input
                  type="email"
                  id="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border rounded focus:ring-1 focus:ring-gray-400"
                  required
                />
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="receiveEmails"
                    checked={receiveEmails}
                    onChange={(e) => setReceiveEmails(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="receiveEmails" className="text-sm text-gray-600">
                    Email me with news and offers
                  </label>
                </div>
              </div>
            </div>

            {/* Delivery section */}
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-4">Delivery</h2>
              
              <div className="mb-4">
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full p-3 border rounded focus:ring-1 focus:ring-gray-400"
                >
                  <option value="United States">United States</option>
                  {/* Add more countries as needed */}
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="p-3 border rounded focus:ring-1 focus:ring-gray-400"
                  required
                />
                <input
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="p-3 border rounded focus:ring-1 focus:ring-gray-400"
                  required
                />
              </div>
              
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3 border rounded focus:ring-1 focus:ring-gray-400"
                  required
                />
              </div>
              
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Apartment, suite, etc. (optional)"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  className="w-full p-3 border rounded focus:ring-1 focus:ring-gray-400"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="p-3 border rounded focus:ring-1 focus:ring-gray-400"
                  required
                />
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="p-3 border rounded focus:ring-1 focus:ring-gray-400"
                >
                  <option value="Virginia">Virginia</option>
                  {/* Add more states as needed */}
                </select>
                <input
                  type="text"
                  placeholder="ZIP code"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="p-3 border rounded focus:ring-1 focus:ring-gray-400"
                  required
                />
              </div>
              
              <div className="mb-4">
                <input
                  type="tel"
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 border rounded focus:ring-1 focus:ring-gray-400"
                  required
                />
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="receiveTexts"
                    checked={receiveTexts}
                    onChange={(e) => setReceiveTexts(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="receiveTexts" className="text-sm text-gray-600">
                    Text me with news and offers
                  </label>
                </div>
              </div>
            </div>

            {/* Shipping method */}
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-4">Shipping method</h2>
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Enter your shipping address to view available shipping methods.</p>
              </div>
            </div>

            {/* Payment section */}
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-4">Payment</h2>
              <p className="text-sm text-gray-600 mb-4">All transactions are secure and encrypted.</p>
              
              <div className="border rounded p-4 mb-4">
                <div className="flex justify-between mb-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="creditCard"
                      name="paymentMethod"
                      checked={true}
                      className="mr-2"
                    />
                    <label htmlFor="creditCard">Credit card</label>
                  </div>
                  <div className="flex gap-2">
                    <span>VISA</span>
                    <span>MC</span>
                    <span>AMEX</span>
                    <span>+1</span>
                  </div>
                </div>
                
                {/* Credit card form fields would go here */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Card number"
                    className="w-full p-3 border rounded focus:ring-1 focus:ring-gray-400"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Expiration date (MM/YY)"
                    className="p-3 border rounded focus:ring-1 focus:ring-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Security code"
                    className="p-3 border rounded focus:ring-1 focus:ring-gray-400"
                  />
                </div>
                
                <div className="flex items-center">
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
              
              {/* Other payment methods */}
              <div className="border-t py-3">
                <div className="flex justify-between items-center">
                  <label htmlFor="paypal">PayPal</label>
                  <span>PayPal</span>
                </div>
              </div>
              
              <div className="border-t py-3">
                <div className="flex justify-between items-center">
                  <label htmlFor="klarna">Klarna - Flexible payments</label>
                  <span>Klarna</span>
                </div>
              </div>
            </div>

            {/* Remember me section */}
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
                  Save my information for a faster checkout with a Shop account
                </label>
              </div>
            </div>

            {/* Pay now button */}
            <div className="mb-4">
              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full py-3 bg-green-600 text-white rounded font-medium"
              >
                {loading ? "Processing…" : "Pay now"}
              </button>
            </div>
            
            <div className="text-xs text-gray-500">
              <p>Your info will be saved to a Shop account. By continuing, you agree to Shop's Terms of Service and acknowledge the Privacy Policy.</p>
            </div>
          </form>
        </div>

        {/* Right column - Order summary */}
        <div className="lg:w-2/5 bg-gray-50 p-6 rounded">
          <div className="max-h-80 overflow-y-auto mb-6">
            {items.map((item, index) => (
              <div
                key={`${item.id}-${item.size}-${item.color.name}-${index}`}
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
                placeholder="Discount code or gift card"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="flex-grow p-3 border rounded-l focus:ring-1 focus:ring-gray-400"
              />
              <button
                type="button"
                onClick={handleApplyDiscount}
                className="px-4 py-3 bg-gray-200 rounded-r border border-l-0"
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
                <span className="font-medium">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}