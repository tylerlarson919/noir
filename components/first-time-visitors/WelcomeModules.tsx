// components/WelcomeModules.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import {Spinner} from "@heroui/spinner";
import ReCAPTCHA from "react-google-recaptcha";
import { addToast } from "@heroui/toast";

export default function WelcomeModules() {
  const [showCookies, setShowCookies] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [loadingRecaptcha, setLoadingRecaptcha] = useState(false);
  const [showRecaptcha, setShowRecaptcha] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [emailError, setEmailError] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const [recaptchaSuccess, setRecaptchaSuccess] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("noir_cookies_accepted")) {
      setShowCookies(true);
    }
    
    // Check if welcome modal has been seen
    const welcomeSeen = localStorage.getItem("noir_welcome_model_seen");
    
    // Set a timer to show welcome modal after 10 seconds
    let timerId: number;
    if (!welcomeSeen && typeof window !== 'undefined') {
      timerId = window.setTimeout(() => {
        setShowWelcome(true);
      }, 10000); // 10 seconds delay
    }
    
    // Clean up timer
    return () => {
      if (timerId) window.clearTimeout(timerId);
    };
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("noir_cookies_accepted", "1");
    setShowCookies(false);
  };
  
  const rejectCookies = () => {
    localStorage.setItem("noir_cookies_accepted", "2");
    setShowCookies(false);
  };

  const setWelcomeSeen = () => {
    localStorage.setItem("noir_welcome_model_seen", "1");
    setShowWelcome(false);
  };
  
  const handleSubmitEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!emailRef.current?.value || !emailRef.current.value.includes('@')) {
      addToast({
        title: "Invalid Email",
        description: "Try entering a valid email.",
        color: "danger",
      });
      setEmailError(true);
      emailRef.current?.focus();
      return;
    }
    
    handleSendDiscount();
  };

const handleSendDiscount = () => {
   const email = emailRef.current?.value.trim() || "";
   if (!email || !email.includes("@")) {
     addToast({
       title: "Invalid Email",
       description: "Try entering a valid email.",
       color: "danger",
     });
     setEmailError(true);
     emailRef.current?.focus();
     return;
   }
   setEmailError(false);
   setLoadingRecaptcha(true);
   setTimeout(() => {
     setLoadingRecaptcha(false);
     setShowRecaptcha(true);
   }, 3000);
};

const processReCaptchaSuccess = async (token: string) => {
  try {
    // Show loading state
    setLoadingRecaptcha(true);
    
    // Call API to send the discount code
    const response = await fetch('/api/send-discount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: emailRef.current?.value || '', 
        recaptchaToken: token 
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log("Email sent successfully");
      setRecaptchaSuccess(true);
    } else {
      throw new Error(data.error || 'Failed to send discount code');
    }
  } catch (error) {
    console.error('Error:', error);
    addToast({
      title: "Error",
      description: "Failed to send discount code. Please try again.",
      color: "danger",
    });
    // Reset states to allow retry
    setShowRecaptcha(false);
  } finally {
    setLoadingRecaptcha(false);
  }
};

  return (
    <>
      {showCookies && (
        <div className="fixed bottom-4 inset-x-4 p-4 bg-white/60 dark:bg-noirdark1 border border-gray-300 dark:border-textaccent/40 rounded-lg shadow-lg backdrop-blur-md flex flex-col sm:flex-row gap-4 z-40">
          <div className="w-full sm:w-2/3 flex items-center gap-3">
            <svg className="min-w-6 size-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.65692 9.41494h.01M7.27103 13h.01m7.67737 1.9156h.01M10.9999 17h.01m3.178-10.90671c-.8316.38094-1.8475.22903-2.5322-.45571-.3652-.36522-.5789-.82462-.6409-1.30001-.0574-.44-.0189-.98879.1833-1.39423-1.99351.20001-3.93304 1.06362-5.46025 2.59083-3.51472 3.51472-3.51472 9.21323 0 12.72793 3.51471 3.5147 9.21315 3.5147 12.72795 0 1.5601-1.5602 2.4278-3.5507 2.6028-5.5894-.2108.008-.6725.0223-.8328.0157-.635.0644-1.2926-.1466-1.779-.633-.3566-.3566-.5651-.8051-.6257-1.2692-.0561-.4293.0145-.87193.2117-1.26755-.1159.20735-.2619.40237-.4381.57865-1.0283 1.0282-2.6953 1.0282-3.7235 0-1.0282-1.02824-1.0282-2.69531 0-3.72352.0977-.09777.2013-.18625.3095-.26543"/>
            </svg>
            <p className="text-sm text-gray-800 dark:text-gray-200 w-full">
              We use cookies to enhance your experience.
              <a href="/cookie-policy" className="underline ml-1">
                Learn more
              </a>
            </p>
          </div>
          <div className="w-full sm:w-1/3 flex items-center justify-end gap-3">
            <button
              onClick={rejectCookies}
              className="px-4 py-2 dark:bg-noirdark1 bg-white dark:text-white text-black font-medium rounded hover:opacity-70 text-sm transition-colors"
            >
              Reject
            </button>
            <button
              onClick={acceptCookies}
              className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black font-medium rounded hover:opacity-70 text-sm transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
      )}
    {showWelcome && (
      <div 
      className="relative bg-white flex flex-col-reverse sm:flex-row overflow-hidden rounded w-full max-w-2xl" 
      onClick={setWelcomeSeen}
      role="presentation" 
    >
      <div 
        className="relative bg-white flex flex-col-reverse sm:flex-row overflow-hidden rounded w-full max-w-2xl" 
        onClick={(e) => e.stopPropagation()}  
        role="dialog" 
        aria-modal="true" 
        aria-label="Welcome discount modal"
      >
      {/* Close Button */}
      <button 
        onClick={setWelcomeSeen} 
        className="absolute top-3 right-3 z-10 bg-white/20 hover:bg-white/50 transition-colors backdrop-blur-sm rounded-full p-1"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      {/* Left Content Column */}
      <div className="px-6 py-10 sm:px-8 sm:py-20 w-full sm:w-1/2 flex flex-col justify-center">
        {recaptchaSuccess ? (
          // Thank you message when reCAPTCHA is successful
          <div className="text-center">
            <h2 className="text-xl font-bold mb-6">
              THANK YOU!
            </h2>
            <p className="text-sm mb-6 font-medium">
              Your discount code has been sent! Please check your email for your 10% off coupon.
            </p>
            <button
              onClick={setWelcomeSeen}
              className="w-full py-2 px-6 bg-dark1 dark:bg-white button-grow-subtle text-white dark:text-black transition-color duration-300 rounded-sm"
            >
              CLOSE
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-3 sm:mb-6">
              WANT A <span className="text-blue-800">10%</span> DISCOUNT?
            </h2>
            <p className="text-xs mb-2 font-medium">
              Sign up to get exclusive discounts, early access to collections, and much more.
            </p>
            <p className="text-xs mb-4 italic font-medium">Where would you like to receive your code?</p>
            
            {/* WRAPPER */}
            <div className="relative">
              {/* EMAIL FORM */}
              <div className={`transition-opacity duration-500 ${showRecaptcha ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                <form onSubmit={handleSubmitEmail}>
                  <div className="relative mb-4">
                    <input
                      ref={emailRef}
                      type="email"
                      name="email"
                      placeholder="Enter your email address"
                      className={`
                        w-full p-3 font-medium rounded placeholder:text-sm transition-all
                        border ${emailError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-500 hover:border-gray-500'}
                      `}
                      onFocus={() => emailError && setEmailError(false)}
                    />
                  </div>                    
                  <button
                    type="button"
                    onClick={handleSendDiscount}
                    className="w-full py-2 px-6 bg-dark1 dark:bg-white button-grow-subtle text-white dark:text-black transition-color duration-300 rounded-sm flex items-center justify-center"
                  >
                    {loadingRecaptcha
                      ? <Spinner variant="wave" size="lg" className="-translate-y-3 -my-3" color="default"/>
                      : "SEND 10% OFF"}
                  </button>
                  <button
                    type="button"
                    onClick={setWelcomeSeen}
                    className="w-full text-center text-[10px] mt-3 text-black font-medium italic hover:underline"
                  >
                    No thanks, I hate discounts
                  </button>
                </form>
              </div>

              {/* RECAPTCHA */}
              {showRecaptcha && (
                <div className="absolute inset-0 flex justify-center items-center transition-opacity duration-500 opacity-100">
                  <div className="scale-90 sm:scale-100 transform-origin-center">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                      onChange={(token) => {
                        if (token) {
                          processReCaptchaSuccess(token);
                          setRecaptchaSuccess(true); // Set success state instead of closing modal
                        } else {
                          console.log("failed reCAPTCHA");
                        }
                      }}
                      size="normal"
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Right Image Column */}
      <div className="w-full h-60 sm:h-auto sm:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://res.cloudinary.com/dyujm1mtq/image/upload/v1746487407/welcome-discount_nv3aef.webp')",
          }}
        />
      </div>
    </div>
  </div>
)}
    </>
  );
}