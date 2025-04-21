// src/components/cart/CartModal.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";

import { useCart } from "@/context/CartContext";

export default function CartModal() {
  const { items, isOpen, totalPrice, closeCart, removeItem } = useCart();
  const [isClosing, setIsClosing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Small delay to trigger fade-in animation
      setTimeout(() => setIsVisible(true), 10);
    } else {
      document.body.style.overflow = "auto";
      setIsVisible(false);
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      closeCart();
    }, 300); // Same duration as the animation
  };

  if (!isOpen) return null;

  return (
    <div
      aria-label="Shopping cart"
      className={`fixed inset-0 bg-black z-[100] flex justify-end transition-opacity duration-300 ease-in-out ${
        isVisible ? "bg-opacity-50 opacity-100" : "bg-opacity-0 opacity-0"
      }`}
      role="dialog"
    >
      <button
        aria-label="Close shopping cart"
        className="fixed inset-0 w-full h-full cursor-default bg-transparent border-none"
        onClick={handleClose}
        onKeyDown={(e) => e.key === "Escape" && handleClose()}
      />
      <div
        aria-modal="true"
        className={`bg-white dark:bg-darkaccent w-full max-w-md h-full overflow-y-auto p-6 relative ${
          isClosing ? "drawer-right-animation-exit" : "drawer-right-animation"
        }`}
        ref={menuRef}
        role="dialog"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Shopping Bag ({items.length})</h2>
          <button
            className="text-gray-600 dark:text-textaccent hover:text-black dark:hover:text-white button-grow transition-colors duration-300"
            onClick={handleClose}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <p className="py-8 text-center text-textaccentdarker dark:text-textaccent">
            Your shopping bag is empty.
          </p>
        ) : (
          <>
            <div className="space-y-4 max-h-[calc(100vh-240px)] overflow-y-auto">
              {items.map((item, index) => (
                <div
                  key={`${item.id}-${item.size}-${item.color.name}-${index}`}
                  className="flex gap-4 py-3 border-b"
                >
                  <Link 
                    href={`/all/products/${item.id}`}
                    className="flex gap-4 flex-grow cursor-pointer"
                  >
                    <div className="relative h-20 w-20 flex-shrink-0">
                      <Image
                        fill
                        alt={item.name}
                        className="object-contain"
                        src={item.image}
                      />
                    </div>
                    <div className="flex-grow relative">
                      <h3 className="font-medium uppercase">{item.name}</h3>
                      <p className="text-sm">${item.price.toFixed(2)}</p>
                      <div className="text-xs text-textaccentdarker dark:text-textaccent">
                        <p>Size: {item.size}</p>
                        <div className="flex items-center">
                          <span>Color: </span>
                          <div
                            className="ml-1 w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color.hex }}
                          />
                          <span className="ml-1">{item.color.name}</span>
                        </div>
                        <p>Quantity: {item.quantity}</p>
                      </div>

                      <div className="flex justify-end items-center absolute bottom-0 right-0 left-0">
                        <button
                          className="text-sm underline"
                          onClick={(e) => {
                            e.preventDefault(); // Prevent the Link from being followed
                            removeItem(item.id, item.size, item.color.name);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
            <div className="pt-4">
              <div className="font-medium space-y-3 absolute left-6 right-6 bottom-8 text-sm text-textaccentdarker dark:text-textaccent flex flex-col items-center">
                Taxes & shipping calculated at checkout.
                <Link
                  className="block w-full py-2 px-4 mt-2 border border-black/30 dark:border-textaccent/30 text-center button-grow-subtle rounded-sm"
                  href="/cart"
                  onClick={handleClose}
                >
                  VIEW SHOPPING BAG
                </Link>
                <Link
                  className="block w-full py-2 px-4 bg-dark1 dark:bg-white text-white dark:text-black text-center button-grow-subtle rounded-sm"
                  href="/checkout"
                  onClick={handleClose}
                >
                  <div className="flex justify-center items-center gap-3 font-medium">
                    <p>CHECKOUT</p>
                    <svg width="4" height="4" viewBox="0 0 4 4" className="fill-current">
                      <circle cx="2" cy="2" r="2" />
                    </svg>
                    <p>${totalPrice.toFixed(2)}</p>
                  </div>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
