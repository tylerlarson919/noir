// src/components/cart/CartModal.tsx
"use client";
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';

export default function CartModal() {
  const { items, isOpen, totalPrice, closeCart, removeItem, updateQuantity } = useCart();
  const [isClosing, setIsClosing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);



  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      closeCart();
    }, 300); // Same duration as the animation
  };
  

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black z-[100] flex justify-end transition-opacity duration-500 ease-in-out bg-opacity-50"
      onClick={handleClose}
    >
      {/* Modal Content */}
      <div 
        ref={menuRef}
        className={`bg-white dark:bg-darkaccent w-full max-w-md h-full overflow-y-auto p-6 relative ${
          isClosing ? 'drawer-right-animation-exit' : 'drawer-right-animation'
        }`}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Shopping Bag ({items.length})</h2>
          <button onClick={handleClose} className="text-gray-600 dark:text-textaccent hover:text-black dark:hover:text-white button-grow transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                <div key={`${item.id}-${item.size}-${item.color.name}-${index}`} className="flex gap-4 py-3 border-b">
                  <div className="relative h-20 w-20 flex-shrink-0">
                    <Image 
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-grow relative">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className='text-sm'>${item.price.toFixed(2)}</p>
                    <div className="text-sm text-textaccentdarker dark:text-textaccent">
                      <p>Size: {item.size}</p>
                      <div className="flex items-center">
                        <span>Color: </span>
                        <div 
                          className="ml-1 w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color.hex }}
                        ></div>
                        <span className="ml-1">{item.color.name}</span>
                      </div>
                      <p>Quantity: {item.quantity}</p>
                    </div>
                    
                    <div className="flex justify-end items-center absolute bottom-0 right-0 left-0">                      
                      <button 
                        onClick={() => removeItem(item.id, item.size, item.color.name)}
                        className="text-sm underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-4">
              <div className="flex justify-between font-medium mb-4">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              
              <div className="space-y-3">
                <Link 
                  href="/checkout" 
                  className="block w-full py-2 px-4 bg-dark1 dark:bg-white text-white dark:text-black text-center button-grow-subtle"
                  onClick={handleClose}
                >
                  Checkout
                </Link>
                
                <Link 
                  href="/cart" 
                  className="block w-full py-2 px-4 border border-textaccentdarker dark:border-textaccent text-center button-grow-subtle"
                  onClick={handleClose}
                >
                  View Shopping Bag
                </Link>
                
                <button 
                  onClick={handleClose}
                  className="block w-full text-center py-2 underline"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}