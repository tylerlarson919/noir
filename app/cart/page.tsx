// src/app/cart/page.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { loadStripe } from "@stripe/stripe-js";

 // load stripe outside render
 const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function CartPage() {
  const { items, totalPrice, removeItem, updateQuantity, clearCart } =
    useCart();
  const router = useRouter();

  // Handle quantity change
  const handleQuantityChange = (
    id: string,
    slug: string, 
    size: string,
    colorName: string,
    newQuantity: number,
  ) => {
    if (newQuantity < 1) return;
    updateQuantity(id, slug, size, colorName, newQuantity);
  };

    const handleCheckout = () => {
        if (!items.length) return;
        router.push("/checkout");
      };

  return (
    <div className="mx-4 relative flex flex-col justify-start items-center">
      <div className="flex flex-col w-full h-full items-center justify-start mt-24 gap-4 max-w-[1200px] stagger-fadein">
        <h1 className="text-4xl w-full text-left pl-6">Cart</h1>
        {items.length === 0 ? (
          <div className="py-12 text-center">
            <h2 className="text-xl mb-2">Your cart is empty</h2>
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
          <>
          
          <div className="flex flex-col lg:flex-row gap-8 w-full h-full relative">
            {/* Cart Items */}
            <div className="lg:w-2/3 z-[1] relative">
              <div className="p-6">
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-sm font-medium">
                    YOUR SELECTION ({items.length})
                  </h2>
                  <button
                    className="text-sm text-red-600/50 hover:underline hover:text-red-600/70 transition-colors"
                    onClick={clearCart}
                  >
                    Clear All
                  </button>
                </div>

                <div className="">
                  {items.map((item, index) => (
                    <div
                      key={`${item.id}-${item.size}-${item.color.name}-${index}`}
                      className="py-4 flex flex-row gap-2 sm:gap-4 border-b"
                    >
                        <Link href={`/all/products/${item.slug}`} >
                          <div className="relative h-28 w-28 sm:h-32 sm:w-32 flex-shrink-0">
                            <Image
                              fill
                              alt={item.name}
                              className="object-contain"
                              src={item.image}
                            />
                          </div>
                        </Link>
                        <div className="flex-grow space-y-1">
                          <Link className="space-y-1" href={`/all/products/${item.slug}`}>
                            <div className="flex justify-between items-top gap-2">
                              <h3 className="font-medium text-md">{item.name}</h3>
                                <p className="font-medium text-md">
                                  ${item.price.toFixed(2)}
                                </p>
                            </div>
                            <div className="text-xs text-textaccentdarker dark:text-textaccent">
                              <p>{item.size} / {item.color?.name}</p>
                            </div>
                          </Link>
                          <div className="flex flex-row items-center justify-between gap-4 pt-2">
                            <div className="flex items-center border rounded-sm">
                              <button
                                aria-label="Decrease quantity"
                                className="px-2 py-1 border-r hover:bg-gray-100 dark:hover:bg-white/30 transition rounded-sm"
                                onClick={(e) =>
                                  handleQuantityChange(
                                    item.id,
                                    item.slug, 
                                    item.size,
                                    item.color.name,
                                    item.quantity - 1,
                                  )
                                }
                              >
                                -
                              </button>
                              <span className="px-3 py-1">{item.quantity}</span>
                              <button
                                aria-label="Increase quantity"
                                className="px-2 py-1 border-l hover:bg-gray-100 dark:hover:bg-white/30 transition rounded-sm"
                                onClick={() => 
                                  handleQuantityChange(
                                    item.id,
                                    item.slug, 
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
                              className="text-sm text-red-600/40 hover:text-red-600/60 transition-colors"
                              onClick={(e) => 
                                removeItem(item.id, item.slug, item.size, item.color?.name)
                              }
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                                <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>                      
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="z-10 sticky bottom-0 left-o right-0 lg:relative lg:w-1/3">
              <div className="border-1 border-gray-400 dark:border-textaccent/30 shadow-sm p-6 rounded-sm sticky top-24 text-sm bg-white/70 dark:bg-dark1/70 backdrop-blur-md w-full">
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
                  <div className="flex justify-between font-semibold text-lg mb-6">
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
                    <button
                      className="block w-full py-3 px-4 bg-dark1 dark:bg-white text-white dark:text-black text-center font-medium button-grow-subtle rounded-sm"
                      onClick={handleCheckout}
                      disabled={!items.length}
                    >
                      Checkout
                    </button>
                    {/* free‐shipping countdown */}
                    {totalPrice < 100 ? (
                      <div className="w-full flex flex-col md:flex-col gap-2 pt-1">
                        <div className="flex justify-between gap-4">
                          <div className="relative w-full h-4 bg-gray-200 dark:bg-textaccent/30 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-700 rounded-full"
                              style={{ width: `${Math.min((totalPrice / 100) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
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
                      <div className="w-full flex flex-col md:flex-row gap-2 pt-1">
                        <div className="flex justify-between gap-4">
                          <div className="relative w-full h-4 bg-gray-200 dark:bg-textaccent/30 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-700 rounded-full"
                              style={{ width: `100%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            $100
                          </span>
                        </div>
                        <div className="text-center text-sm font-medium text-textaccentdarker dark:text-textaccent">
                          You qualify for free shipping!
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
}
