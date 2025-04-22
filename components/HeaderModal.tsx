// src/components/HeaderModal.tsx
"use client";
import Link from "next/link";
import {
  useEffect,
  useState,
  useRef,
  ReactNode,
  createContext,
  useContext,
} from "react";

// Create HeaderModalContext
export const HeaderModalContext = createContext({
  isHeaderOpen: false,
  openHeaderMenu: () => {},
  closeHeaderMenu: () => {},
});

// Create HeaderModalProvider
export const HeaderModalProvider = ({ children }: { children: ReactNode }) => {
  const [isHeaderOpen, setIsHeaderOpen] = useState(false);
  const openHeaderMenu = () => setIsHeaderOpen(true);
  const closeHeaderMenu = () => setIsHeaderOpen(false);

  return (
    <HeaderModalContext.Provider
      value={{ isHeaderOpen, openHeaderMenu, closeHeaderMenu }}
    >
      {children}
    </HeaderModalContext.Provider>
  );
};

// Custom hook for using the header modal
export const useHeaderModal = () => useContext(HeaderModalContext);

// HeaderModal Component
export default function HeaderModal() {
  const { isHeaderOpen, closeHeaderMenu } = useHeaderModal();
  const [activeView, setActiveView] = useState("main"); // 'main' or 'shopAll'
  const [isClosing, setIsClosing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Prevent scrolling when modal is open and handle visibility
  useEffect(() => {
    if (isHeaderOpen) {
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
  }, [isHeaderOpen]);

  const switchToShopAll = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveView("shopAll");
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
  };

  const switchToMain = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveView("main");
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
  };

  const handleClose = () => {
    setIsVisible(false);
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      closeHeaderMenu();
      setActiveView("main");
    }, 300);
  };

  if (!isHeaderOpen) return null;

  return (
    <div
      aria-label="Navigation menu backdrop"
      className={`fixed inset-0 z-[98] flex justify-start bg-black transition-opacity duration-300 ease-in-out ${
        isVisible ? "bg-opacity-50 opacity-100" : "bg-opacity-0 opacity-0"
      }`}
      role="dialog"
    >
      <button
        aria-label="Close navigation menu"
        className="fixed inset-0 w-full h-full cursor-default bg-transparent border-none"
        onClick={handleClose}
        onKeyDown={(e) => e.key === "Escape" && handleClose()}
      />
      {/* Modal content */}
      <div
        aria-modal="true"
        className={`relative z-[100] w-full h-full p-6 overflow-x-hidden overflow-y-auto bg-white border-r dark:bg-darkaccent md:max-w-md border-gray-600 dark:border-darkaccent2/60 ${
          isClosing ? "drawer-animation-exit" : "drawer-animation"
        }`}
        ref={menuRef}
        role="dialog"
      >
        <div className="relative flex items-center justify-between mb-4">
          {activeView === "shopAll" ? (
            <div className="absolute z-[101] flex items-center gap-2 -top-1 -left-2">
              <button
                aria-label="Back to main menu"
                onClick={switchToMain}
                className="flex text-gray-600 transition-colors duration-300 dark:text-textaccent hover:text-black dark:hover:text-white button-grow"
              >
                <svg
                  className="size-6"
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
              </button>
              <h2 className="text-sm font-normal text-gray-600 dark:text-textaccent">
                Categories
              </h2>
            </div>
          ) : (
            <div />
          )}
          <button
            aria-label="Close menu"
            className="absolute text-gray-600 transition-colors duration-300 z-[101] dark:text-textaccent hover:text-black dark:hover:text-white button-grow -top-1 right-0"
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

        {/* Main Menu Content */}
        <div
          className={`absolute inset-0 p-6 pt-16 flex flex-col transition-all duration-300 items-start justify-start gap-6 ${
            activeView === "main"
              ? "opacity-100 transform translate-x-0"
              : "opacity-0 transform -translate-x-full"
          } ${isTransitioning ? "pointer-events-none" : ""}`}
          role="menu"
        >
          <button
            aria-label="Shop All Categories"
            className="text-left group relative w-full text-gray-600 dark:text-textaccent hover:text-black dark:hover:text-white transition-all duration-300 text-xl flex items-center justify-start hover-underline"
            onClick={switchToShopAll}
          >
            <span>Shop All</span>
            <svg
              className="size-5 absolute right-2 top-0 bottom-0 mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
                fillRule="evenodd"
              />
            </svg>
          </button>
          <Link
            className="w-full text-gray-600 dark:text-textaccent hover:text-black dark:hover:text-white transition-all duration-300 text-xl hover-underline"
            href="/all?category=featured"
          >
            New In
          </Link>
          <Link
            className="w-full text-gray-600 dark:text-textaccent hover:text-black dark:hover:text-white transition-all duration-300 text-xl hover-underline"
            href="/about"
          >
            About Us
          </Link>
          <Link
            className="w-full text-gray-600 dark:text-textaccent hover:text-black dark:hover:text-white transition-all duration-300 text-xl hover-underline"
            href="/contact"
          >
            Contact
          </Link>
          <Link
            className="w-full text-gray-600 dark:text-textaccent hover:text-black dark:hover:text-white transition-all duration-300 text-xl hover-underline"
            href="/track-order"
          >
            Track Order
          </Link>
        </div>

        {/* Shop All Content */}
        <div
          className={`absolute inset-0 p-6 pt-16 flex flex-col transition-all duration-300 ${
            activeView === "shopAll"
              ? "opacity-100 transform translate-x-0"
              : "opacity-0 transform translate-x-full"
          } ${isTransitioning ? "pointer-events-none" : ""}`}
          role="menu"
        >
          <div className="flex flex-col items-start justify-start gap-6">
            <Link
              key="all"
              className="group relative w-full text-gray-600 dark:text-textaccent hover:text-black dark:hover:text-white transition-all duration-300 text-xl flex items-center justify-start hover-underline"
              href="/all"
              onClick={() => {
                handleClose();
              }}
            >
              <p>All</p>
              <svg
                className="size-5 absolute right-2 top-0 bottom-0 my-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clipRule="evenodd"
                  d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
                  fillRule="evenodd"
                />
              </svg>
            </Link>
            {[
              "pants",
              "jeans",
              "shorts",
              "hoodies",
              "t-shirts",
              "shirts",
              "accessories",
            ].map((type) => (
              <Link
                key={type}
                className="group relative w-full text-gray-600 dark:text-textaccent hover:text-black dark:hover:text-white transition-all duration-300 text-xl flex items-center justify-start hover-underline"
                href={`/all?type=${type}`}
                onClick={() => {
                  handleClose();
                }}
              >
                <p>{type.charAt(0).toUpperCase() + type.slice(1)}</p>
                <svg
                  className="size-5 absolute right-2 top-0 bottom-0 my-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
                    fillRule="evenodd"
                  />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
