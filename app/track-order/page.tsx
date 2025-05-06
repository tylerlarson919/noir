"use client";
import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { addToast } from "@heroui/toast";

export default function TrackOrderPage() {
  const [emailError, setEmailError] = useState(false);
  const [loadingRecaptcha, setLoadingRecaptcha] = useState(false);
  const [showRecaptcha, setShowRecaptcha] = useState(false);
  const [recaptchaSuccess, setRecaptchaSuccess] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleSubmitEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!emailRef.current?.value || !emailRef.current.value.includes('@')) {
      addToast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        color: "danger",
      });
      setEmailError(true);
      emailRef.current?.focus();
      return;
    }

    showRecaptchaVerification();
  };

  const showRecaptchaVerification = () => {
    setEmailError(false);
    setLoadingRecaptcha(true);
    setTimeout(() => {
      setLoadingRecaptcha(false);
      setShowRecaptcha(true);
    }, 3000);
  };

  const processReCaptchaSuccess = async (token: string) => {
    try {
      setLoadingRecaptcha(true);
      
      const response = await fetch('/api/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: emailRef.current?.value || '', 
          recaptchaToken: token 
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setRecaptchaSuccess(true);
        addToast({
          title: "Email Confirmed",
          description: "Tracking details have been sent to your email.",
          color: "success",
        });
      } else {
        throw new Error(data.error || 'Failed to track order');
      }
    } catch (error) {
      console.error('Error:', error);
      addToast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        color: "danger",
      });
    } finally {
      setLoadingRecaptcha(false);
      setShowRecaptcha(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto mt-20">
      <h1 className="text-lg font-bold mb-3">Track Your Order</h1>
      {!recaptchaSuccess ? (
        <form onSubmit={handleSubmitEmail}>
          <div className="mb-4">
            <input
              ref={emailRef}
              type="email"
              placeholder="Email address used for order"
              className={`w-full p-3 font-medium rounded placeholder:text-sm transition-all focus:outline-none ${emailError ? 'border-red-500' : 'border-1 border-gray-300 focus:border-gray-500 hover:border-gray-500'}`}
              onFocus={() => emailError && setEmailError(false)}
            />
          </div>
          {showRecaptcha ? (
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
              onChange={(token) => {
                if (token) {
                  processReCaptchaSuccess(token);
                }
              }}
            />
          ) : (
            <button className="bg-black text-white py-2 px-4 rounded">
              {loadingRecaptcha ? 'Loading...' : 'Track Order'}
            </button>
          )}
        </form>
      ) : (
        <p className="text-green-500">Tracking details have been sent to your email.</p>
      )}
    </div>
  );
}
