// src/components/HeaderModal.tsx
"use client";
import Link from 'next/link';
import { useEffect, useState, useRef, ReactNode, createContext, useContext  } from 'react';

// Create HeaderModalContext
export const HeaderModalContext = createContext({
  isHeaderOpen: false,
  openHeaderMenu: () => {},
  closeHeaderMenu: () => {}
});

// Create HeaderModalProvider
export const HeaderModalProvider = ({ children }: { children: ReactNode }) => {
  const [isHeaderOpen, setIsHeaderOpen] = useState(false);
  const openHeaderMenu = () => setIsHeaderOpen(true);
  const closeHeaderMenu = () => setIsHeaderOpen(false);
  
  return (
    <HeaderModalContext.Provider value={{ isHeaderOpen, openHeaderMenu, closeHeaderMenu }}>
      {children}
    </HeaderModalContext.Provider>
  );
};

// Custom hook for using the header modal
export const useHeaderModal = () => useContext(HeaderModalContext);

// HeaderModal Component
export default function HeaderModal() {
  const { isHeaderOpen, closeHeaderMenu } = useHeaderModal();
  const [isShopAllOpen, setIsShopAllOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isShopAllClosing, setIsShopAllClosing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isHeaderOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isHeaderOpen]);

  // Add a useEffect to handle the style left property based on screen size
  useEffect(() => {
    const handleResize = () => {
      // Force re-render when window size changes to recalculate styles
      setIsShopAllOpen(isShopAllOpen);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isShopAllOpen]);

  const openShopAllMenu = () => {
    setIsShopAllOpen(true);
  };
  
  // Add a function to close Shop All submenu
  const closeShopAllMenu = () => {
    setIsShopAllClosing(true);
    setTimeout(() => {
      setIsShopAllClosing(false);
      setIsShopAllOpen(false);
    }, 300);
  };

  const handleClose = () => {
    // If Shop All modal is open, close it first with animation
    if (isShopAllOpen) {
      setIsShopAllClosing(true);
      
      // First close Shop All modal
      setTimeout(() => {
        setIsShopAllClosing(false);
        setIsShopAllOpen(false);
        
        // Only start the main modal closing animation after Shop All is closed
        setIsClosing(true);
        setTimeout(() => {
          setIsClosing(false);
          closeHeaderMenu();
        }, 300);
      }, 300);
    } else {
      // Just close the main modal if Shop All isn't open
      setIsClosing(true);
      setTimeout(() => {
        setIsClosing(false);
        closeHeaderMenu();
      }, 300);
    }
  };
  
  if (!isHeaderOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black z-[98] flex justify-start transition-opacity duration-500 ease-in-out bg-opacity-50"
      onClick={handleClose}
    >
      {/* Main Modal Content */}
      <div 
        ref={menuRef}
        className={`z-[100] bg-white dark:bg-darkaccent w-full md:max-w-md h-full overflow-y-auto p-6 relative border-r border-gray-600 dark:border-darkaccent2/60 ${
          isClosing ? 'drawer-animation-exit' : 'drawer-animation'
        } ${isShopAllOpen && 'hidden md:block'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end items-center mb-4 relative">
          <button onClick={handleClose} className="text-gray-600 dark:text-textaccent hover:text-black dark:hover:text-white button-grow transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col items-start justify-start gap-6"
          onClick={(e) => {
              e.preventDefault();
            }} 
          >
          <Link
            href="#" 
            onClick={ () => {
              openShopAllMenu()
            }}
            className='group relative w-full text-gray-600 dark:text-textaccent hover:text-black dark:hover:text-white transition-all duration-300 text-xl flex items-center justify-start hover-underline'
          >
            <p>Shop All</p>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                className="size-5 absolute right-2 top-0 bottom-0 mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
            </svg>
          </Link>
          <Link href="/all?type=new_in" className='w-full text-gray-600 dark:text-textaccent hover:text-black dark:hover:text-white transition-all duration-300 text-xl hover-underline'>
            New In
          </Link>
          <Link href="/about" className='w-full text-gray-600 dark:text-textaccent hover:text-black dark:hover:text-white transition-all duration-300 text-xl hover-underline'>
            About Us
          </Link>
          <Link href="/contact" className='w-full text-gray-600 dark:text-textaccent hover:text-black dark:hover:text-white transition-all duration-300 text-xl hover-underline'>
            Contact
          </Link>
          <Link href="/track-order" className='w-full text-gray-600 dark:text-textaccent hover:text-black dark:hover:text-white transition-all duration-300 text-xl hover-underline'>
            Track Order
          </Link>
        </div>
      </div>
      {/* Shop all modal */}
      {(isShopAllOpen || isShopAllClosing) && (
        <div 
          className={`z-[99] fixed top-0 bottom-0 bg-white dark:bg-darkaccent w-full md:max-w-md h-full overflow-y-auto p-6 transform transition-transform duration-300 border-r border-gray-600 dark:border-darkaccent2/60 ${
            isShopAllOpen ? 'translate-x-0' : 'translate-x-full'
          } ${isShopAllClosing ? 'drawer-animation-exit' : 'drawer-animation'} md:ml-0`}
          onClick={(e) => e.stopPropagation()}
          style={{ 
            left: window.innerWidth >= 768 ? (menuRef.current ? menuRef.current.offsetWidth : 0) : 0 
          }}
        >
          <div className="flex justify-start items-center mb-8 gap-4">
            <button onClick={closeShopAllMenu} className="text-gray-600 dark:text-textaccent hover:text-black dark:hover:text-white button-grow transition-colors duration-300 flex md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
              </svg>
            </button>
            <h2 className="text-lg font-medium">Categories</h2>
          </div>
          <div className="flex flex-col items-start justify-start gap-6">
            {['pants', 'jeans', 'shorts', 'hoodies', 't-shirts', 'shirts', 'accessories'].map((type) => (
              <Link 
                key={type}
                href={`/all?type=${type}`} 
                className='group relative w-full text-gray-600 dark:text-textaccent hover:text-black dark:hover:text-white transition-all duration-300 text-xl flex items-center justify-start hover-underline'
                onClick={(e) => {
                  e.preventDefault();
                  handleClose();
                  window.location.href = `/all?type=${type}`;
                }}
              >
                <p>{type.charAt(0).toUpperCase() + type.slice(1)}</p>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                    className="size-5 absolute right-2 top-0 bottom-0 my-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}