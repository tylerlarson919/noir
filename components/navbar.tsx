"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Link } from "@heroui/link";

import { ThemeSwitch } from "@/components/theme-switch";
import { useCart } from "@/context/CartContext";
import { useHeaderModal } from "@/components/HeaderModal";

export const Navbar = () => {
  const { openCart, totalItems } = useCart();
  const { openHeaderMenu, isHeaderOpen } = useHeaderModal();
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [prevScrollY, setPrevScrollY] = useState(0);
  const pathname = usePathname();
  const isMainPage = pathname === "/";

  useEffect(() => {
    if (isHeaderOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isHeaderOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Determine scroll direction
      if (currentScrollY > prevScrollY) {
        setIsScrollingDown(true);
      } else {
        setIsScrollingDown(false);
      }

      // Check if at the top of the page
      setIsAtTop(currentScrollY === 0);

      // Update previous scroll position
      setPrevScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [prevScrollY]);

  // Combine classes conditionally
  const headerClasses = `
    fixed top-0 z-50 left-0 right-0 py-6 px-4 flex flex-row items-center justify-center w-full transition-all duration-300 ease-in-out group
    ${isScrollingDown ? "-translate-y-full" : "translate-y-0"} 
    ${
      !isAtTop
        ? "bg-white dark:bg-darkaccent shadow-md"
        : isMainPage
          ? "bg-transparent hover:bg-white dark:hover:bg-darkaccent text-white hover:text-black dark:hover:text-white"
          : "bg-transparent hover:bg-white dark:hover:bg-darkaccent"
    }
  `;

  return (
    <div className={headerClasses}>
      <div className="flex flex-row item-center justify-between w-full relative">
        <div className="flex flex-row items-center justify-start gap-8 z-[51]">
          <button
            aria-label="Open menu"
            className="flex items-center flex-row gap-2"
            type="button"
            onClick={openHeaderMenu}
          >
            <svg
              className="size-8"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
                fillRule="evenodd"
              />
            </svg>
            <span className="tracking-wider">Menu</span>
          </button>
        </div>

        <div className="absolute inset-0 m-auto flex justify-center z-[50]">
          <Link aria-label="Noir Home" href="/">
            <Image
              alt="Noir Logo"
              className={`${isMainPage && isAtTop ? "invert group-hover:invert-0 dark:group-hover:invert" : ""} h-auto dark:invert transition-all duration-300`}
              height={32}
              src="/noir-logo-full.svg"
              width={100}
              priority={true}
            />
          </Link>
        </div>

        <div className="flex flex-row items-center justify-end gap-4 z-[51]">
          <ThemeSwitch
            className={`${isMainPage && isAtTop ? "text-white group-hover:text-black dark:group-hover:text-white" : ""} text-black dark:text-white transition-all duration-300`}
          />
          <button
            aria-label="Open shopping cart"
            className="relative p-2"
            type="button"
            onClick={openCart}
          >
            <svg
              className="size-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 0 0 4.25 22.5h15.5a1.875 1.875 0 0 0 1.865-2.071l-1.263-12a1.875 1.875 0 0 0-1.865-1.679H16.5V6a4.5 4.5 0 1 0-9 0ZM12 3a3 3 0 0 0-3 3v.75h6V6a3 3 0 0 0-3-3Zm-3 8.25a3 3 0 1 0 6 0v-.75a.75.75 0 0 1 1.5 0v.75a4.5 4.5 0 1 1-9 0v-.75a.75.75 0 0 1 1.5 0v.75Z"
                fillRule="evenodd"
              />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
