// src/app/cart/page.tsx
"use client";
import Link from "next/link";
import Image from "next/image";

import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, totalPrice, removeItem, updateQuantity, clearCart } =
    useCart();

  // Handle quantity change
  const handleQuantityChange = (
    id: string,
    size: string,
    colorName: string,
    newQuantity: number,
  ) => {
    if (newQuantity < 1) return;
    updateQuantity(id, size, colorName, newQuantity);
  };

  return (
    <div className="mx-4 relative flex flex-col justify-start items-center">
      <div className="flex flex-col w-full h-full items-center justify-start mt-28 gap-4 max-w-[1200px]">
        <h1 className="text-4xl w-full text-left pl-6">Shopping Bag</h1>
        {items.length === 0 ? (
          <div className="py-12 text-center">
            <h2 className="text-xl mb-2">Your shopping bag is empty</h2>
            <p className="text-textaccentdarker dark:text-textaccent mb-8">
              Add some products to your bag and come back here to complete your
              purchase.
            </p>
            <Link
              className="inline-flex items-center px-6 py-3 bg-dark1 dark:bg-white text-white dark:text-black button-grow-subtle  rounded-sm"
              href="/all"
            >
              <svg
                className="size-4 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clipRule="evenodd"
                  d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z"
                  fillRule="evenodd"
                />
              </svg>
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 w-full ">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className=" p-6">
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-sm font-medium">
                    YOUR SELECTION ({items.length})
                  </h2>
                  <button
                    className="text-sm text-red-600/50 hover:underline"
                    onClick={clearCart}
                  >
                    Clear All
                  </button>
                </div>

                <div className="">
                  {items.map((item, index) => (
                    <div
                      key={`${item.id}-${item.size}-${item.color.name}-${index}`}
                      className="py-4 flex flex-col sm:flex-row gap-0 sm:gap-4 border-b"
                    >
                      <Link
                        href={`/all/products/${item.id}`}
                        className="flex flex-row gap-4 flex-grow cursor-pointer"
                      >
                        <div className="relative h-32 w-32 flex-shrink-0">
                          <Image
                            fill
                            alt={item.name}
                            className="object-contain"
                            src={item.image}
                          />
                        </div>
                        <div className="flex-grow space-y-1">
                          <h3 className="font-medium text-md">{item.name}</h3>
                          <p className="text-md font-light">
                            ${item.price.toFixed(2)}
                          </p>
                          <div className="text-sm text-textaccentdarker dark:text-textaccent grid grid-cols-2 sm:grid-cols-3 gap-2">
                            <p>Size: {item.size}</p>
                            <div className="flex items-center">
                              <span>Color: </span>
                              <div
                                className="ml-1 w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color.hex }}
                              />
                              <span className="ml-1">{item.color.name}</span>
                            </div>
                          </div>
                        </div>
                      </Link>

                      <div className="flex flex-row items-center justify-between gap-3 pt-2 sm:ml-10">
                        <div className="flex items-center border rounded-sm">
                          <button
                            aria-label="Decrease quantity"
                            className="px-3 py-1 border-r hover:bg-gray-100 dark:hover:bg-white/30 transition"
                            onClick={() =>
                              handleQuantityChange(
                                item.id,
                                item.size,
                                item.color.name,
                                item.quantity - 1,
                              )
                            }
                          >
                            -
                          </button>
                          <span className="px-4 py-1">{item.quantity}</span>
                          <button
                            aria-label="Increase quantity"
                            className="px-3 py-1 border-l hover:bg-gray-100 dark:hover:bg-white/30 transition"
                            onClick={() =>
                              handleQuantityChange(
                                item.id,
                                item.size,
                                item.color.name,
                                item.quantity + 1,
                              )
                            }
                          >
                            +
                          </button>
                        </div>

                        <button
                          className="text-sm text-red-600/50 hover:underline"
                          onClick={() =>
                            removeItem(item.id, item.size, item.color.name)
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="sticky bottom-0 left-o right-0 lg:relative lg:w-1/3">
              <div className="border-1 border-gray-400 dark:border-textaccent/30 shadow-sm p-6 rounded-sm sticky top-24 text-sm bg-white/30 dark:bg-dark1/30 backdrop-blur-md">
                <h2 className="text-lg font-medium mb-4">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-black/40 dark:text-white/30">
                      Calculated at checkout
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span className="text-black/40 dark:text-white/30">
                      Calculated at checkout
                    </span>
                  </div> 
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-md mb-6">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>

                  <div className="space-y-3">
                    <Link
                      className="block w-full py-3 px-4 border border-black/30 dark:border-textaccent/30 text-center button-grow-subtle rounded-sm"
                      href="/"
                    >
                      Continue Shopping
                    </Link>
                    <Link
                      className="block w-full py-3 px-4 bg-dark1 dark:bg-white text-white dark:text-black text-center font-medium button-grow-subtle rounded-sm"
                      href="/checkout"
                    >
                      CHECKOUT
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
