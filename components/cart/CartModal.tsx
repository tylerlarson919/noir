// src/components/cart/CartModal.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import {ScrollShadow} from "@heroui/scroll-shadow";
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
        className={`bg-white dark:bg-darkaccent w-full max-w-full md:max-w-lg h-full overflow-y-auto p-6 relative ${
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
            <ScrollShadow className="space-y-4 max-h-[calc(100vh-300px)] custom-scrollbar pr-2">
              {items.map((item, index) => (
                <div
                  key={`${item.id}-${item.size}-${item.color.name}-${index}`}
                  className="flex gap-4 py-3 border-b border-gray-200 dark:border-textaccent/40"
                >
                  <Link
                    href={`/all/products/${item.slug}`}
                    className="flex flex-grow cursor-pointer"
                    onClick={handleClose}
                  >
                    <div className="relative w-[80px] h-[80px] bg-black/10 dark:bg-white/10 rounded mr-4">
                      <div className="absolute top-0 right-0 w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs">
                        {item.quantity}
                      </div>
                      <Image
                        fill
                        alt={item.name}
                        className="object-contain rounded-lg p-1"
                        src={item.image}
                      />
                    </div>
                    <div className="flex-grow relative">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="font-medium">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="text-xs text-textaccentdarker dark:text-textaccent">
                        <p>{item.size} / {item.color?.name}</p>
                      </div>

                      <div className="flex justify-end items-center absolute bottom-0 right-0 left-0">
                        <button
                          className="text-sm underline hover:text-red-800 transition-colors"
                          onClick={(e) => {
                            e.preventDefault(); // Prevent the Link from being followed
                            removeItem(item.id, item.slug, item.size, item.color.name);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </ScrollShadow>
            <div className="pt-4">
              <div className="font-medium space-y-3 absolute left-6 right-6 bottom-8 text-sm text-textaccentdarker dark:text-textaccent flex flex-col items-center">
                {/* free‐shipping countdown */}
                {totalPrice < 100 ? (
                  <div className="w-full flex flex-col gap-2 mb-2">
                    <div className="flex justify-between gap-4">
                      <div className="relative w-full h-4 bg-gray-200 dark:bg-textaccent/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-700 rounded-full"
                          style={{ width: `${Math.min((totalPrice / 100) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">
                        $100
                      </span>
                    </div>
                    <div className="text-center text-sm font-medium text-textaccentdarker dark:text-textaccent">
                      You’re <span className="text-black dark:text-white">
                        ${(100 - totalPrice).toFixed(2)}
                      </span> away from free shipping!
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-sm font-medium mb-2">
                    You qualify for free shipping!
                  </div>
                )}
                <Link
                  className="block w-full py-4 px-4 border border-black/30 dark:border-textaccent/30 text-center button-grow-subtle rounded-sm"
                  href="/cart"
                  onClick={handleClose}
                >
                  VIEW SHOPPING BAG
                </Link>
                <Link
                  className="block w-full py-4 px-4 bg-dark1 dark:bg-white text-white dark:text-black text-center button-grow-subtle rounded-sm"
                  href="/checkout"
                  onClick={handleClose}
                >
                  <div className="flex justify-center items-center gap-3 font-medium">
                    <p>CHECKOUT</p>
                    <svg
                      width="4"
                      height="4"
                      viewBox="0 0 4 4"
                      className="fill-current"
                    >
                      <circle cx="2" cy="2" r="2" />
                    </svg>
                    <p>${totalPrice.toFixed(2)}</p>
                  </div>
                </Link>
                <p className="mt-2">Taxes & shipping calculated at checkout.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
