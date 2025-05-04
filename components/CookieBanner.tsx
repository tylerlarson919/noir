// components/CookieBanner.tsx
"use client";
import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("noir_cookies_accepted")) {
      setShow(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("noir_cookies_accepted", "1");
    setShow(false);
  };
  const reject = () => {
    localStorage.setItem("noir_cookies_accepted", "2");
    setShow(false);
  };

  if (!show) return null;
  return (
    <div className="fixed bottom-4 inset-x-4 md:inset-x-20 p-4 bg-white dark:bg-noirdark1 border-1 border-gray-200 dark:border-textaccent/40 rounded-lg shadow-lg backdrop-blur-md flex flex-row gap-4 items-center justify-between space-y-0">
      <div className="flex items-center justify-start gap-3">
        <svg className="min-w-6 size-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.65692 9.41494h.01M7.27103 13h.01m7.67737 1.9156h.01M10.9999 17h.01m3.178-10.90671c-.8316.38094-1.8475.22903-2.5322-.45571-.3652-.36522-.5789-.82462-.6409-1.30001-.0574-.44-.0189-.98879.1833-1.39423-1.99351.20001-3.93304 1.06362-5.46025 2.59083-3.51472 3.51472-3.51472 9.21323 0 12.72793 3.51471 3.5147 9.21315 3.5147 12.72795 0 1.5601-1.5602 2.4278-3.5507 2.6028-5.5894-.2108.008-.6725.0223-.8328.0157-.635.0644-1.2926-.1466-1.779-.633-.3566-.3566-.5651-.8051-.6257-1.2692-.0561-.4293.0145-.87193.2117-1.26755-.1159.20735-.2619.40237-.4381.57865-1.0283 1.0282-2.6953 1.0282-3.7235 0-1.0282-1.02824-1.0282-2.69531 0-3.72352.0977-.09777.2013-.18625.3095-.26543"/>
        </svg>
        <p className="text-xs text-gray-800 dark:text-gray-200">
            By using the site, you agree to our cookie policy{" "}
            <a href="/cookie-policy" className="underline">
            Learn more
            </a>
        </p>
      </div>
      <div className="flex gap-3">
        <button
            onClick={reject}
            className="px-4 py-2 dark:bg-noirdark1 bg-white dark:text-white text-black font-medium rounded hover:opacity-70 text-sm transition-colors"
        >
            Reject
        </button>
        <button
            onClick={accept}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black font-medium rounded hover:opacity-70 text-sm transition-colors"
        >
            Accept
        </button>
      </div>
    </div>
  );
}
