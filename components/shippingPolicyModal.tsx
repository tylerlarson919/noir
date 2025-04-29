// src/app/checkout/[checkoutId]/ShippingPolicyModal.tsx
import React, { useState, useEffect, useRef } from 'react';

interface ShippingPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShippingPolicyModal({ isOpen, onClose }: ShippingPolicyModalProps) {
    const [isRendered, setIsRendered] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const modalContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (isOpen && event.key === 'Escape') {
            onClose();
            }
        };
        
        window.addEventListener('keydown', handleEscKey);
        return () => window.removeEventListener('keydown', handleEscKey);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen && !isRendered) {
          setIsRendered(true);
          // Small delay to ensure DOM is updated before starting animation
          setTimeout(() => setIsAnimating(true), 10);
        } else if (!isOpen && isRendered) {
          setIsAnimating(false);
          // Wait for animation to complete before removing from DOM
          const timer = setTimeout(() => setIsRendered(false), 300);
          return () => clearTimeout(timer);
        }
      }, [isOpen, isRendered]);
      
      if (!isRendered) return null;
  
      return (
        <div 
          className={`fixed inset-0 bg-black z-50 flex items-center justify-center p-4 backdrop-blur-md transition-all duration-300 ease-in-out ${
            isAnimating ? 'bg-opacity-50 opacity-100' : 'bg-opacity-0 opacity-0 pointer-events-none'
          }`}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          onKeyDown={(e) => e.key === 'Escape' && onClose()}
          tabIndex={0}
        >
          <div 
            ref={modalContentRef}
            className={`bg-white dark:bg-darkaccent rounded-lg shadow-xl max-w-4/5 lg:max-w-3xl w-full max-h-[80vh] flex flex-col transition-transform duration-300 ${
              isAnimating ? 'scale-100' : 'scale-95'
            }`}
            onClick={(e) => e.stopPropagation()}
            role="presentation"
          >
            <div className="flex justify-between items-center p-4 border-b dark:border-textaccent/40">
              <h2 className="text-xl font-semibold">Shipping policy</h2>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
        
        <div className="overflow-y-auto p-4 flex-grow">
          <p className="mb-4">
            As soon as you make the purchase, you will receive a confirmation
            e-mail and our team will get to work so that you receive your order
            as soon as possible.
          </p>
          
          <p className="mb-4">
            If after the time indicated below for each country you have not
            received your order, please <a href="/contact" className="text-blue-600 hover:underline">contact us</a> indicating your order number
            and we will review your order history to find a solution as soon as
            possible.
          </p>
          
          <p className="mb-4 italic">
            Noir will not be responsible for delivery mistakes caused when the
            delivery address entered by the customer at the check out, does not
            correspond to the correct delivery address.
          </p>
          
          <p className="mb-4 italic font-bold">
            *During collection Drops, Black Friday and Christmas, due
            to high demand concentrated in a few days, it is possible that
            shipments may suffer some delays.
          </p>
          
          <p className="mb-4 italic">
            If you wish to cancel an order, you must notify Noir by emailing to
            support@noir-clothing.com.
            <br />
            * Cancelations are only available for unfulffiled orders
          </p>
          
          <h3 className="font-semibold mt-6 mb-2 underline">SHIPPING FEES:</h3>
          <p className="underline font-bold">United States</p>
          <ul className="list-disc pl-5 mb-6">
            <li>STANDARD 5-10 DAYS - $9 | FREE &gt; 100 USD</li>
          </ul>
          <p className="underline font-bold">Canada</p>
          <ul className="list-disc pl-5 mb-6">
            <li>STANDARD 5-10 DAYS - $7 | FREE &gt; 100 CAD</li>
          </ul>
          <p className="underline font-bold">Spain (Mainland & Balearic Islands) & Portugal</p>
          <ul className="list-disc pl-5 mb-6">
            <li>STANDARD 8-12 DAYS - $4 | FREE &gt; 100€</li>
          </ul>
          <p className="underline font-bold">Spain (Canary Islands, Ceuta & Melilla)</p>
          <ul className="list-disc pl-5 mb-6">
            <li>STANDARD 8-12 DAYS - $9.50 | FREE &gt; 100€</li>
          </ul>
          <p className="underline font-bold">European Countries (Andorra, Germany, Italy, Belgium, Denmark, France, Austria, Netherlands & Luxemburg)</p>
          <ul className="list-disc pl-5 mb-6">
            <li>STANDARD 5-10 DAYS - $5 | FREE &gt; 100€</li>
          </ul>
          <p className="underline font-bold">Switzerland</p>
          <ul className="list-disc pl-5 mb-6">
            <li>STANDARD 5-10 DAYS - $20 | FREE &gt; 200€</li>
          </ul>
          <p className="underline font-bold">United Kingdom</p>
          <ul className="list-disc pl-5 mb-6">
            <li>STANDARD 5-10 DAYS - $10 | FREE &gt; 100£</li>
          </ul>
          <p className="underline font-bold">*Rest of European Countries</p>
          <ul className="list-disc pl-5 mb-6">
            <li>STANDARD 5-10 DAYS - $8 | FREE &gt; 100€</li>
          </ul>
          <p className="underline font-bold">Rest of the World</p>
          <ul className="list-disc pl-5 mb-6">
            <li>STANDARD 5-10 DAYS - $10 | FREE &gt; 100€</li>
          </ul>
          
          <p className="mb-4">
            At all times Noir will work to offer the best service in terms of international shipments, 
            however, it may happen that for some reason or cause beyond our control, an order may be canceled, 
            in which case Noir will communicate it within a period not exceeding 24H working accompanied 
            by a refund in the method of payment used by the customer for the purchase.
          </p>
          <h3 className="font-semibold mt-6 mb-2 underline">CUSTOMS</h3>
          <p className="mb-4">
            No country is subject to potential customs charges. All taxes are covered by Noir.
          </p>
          <p className="mb-4">
            If, at any point during the delivery of your order the shipping company requests a customs fee, 
            please contact us at <a href="mailto:support@noir-clothing.com" className="text-blue-600 hover:underline">support@noir-clothing.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}