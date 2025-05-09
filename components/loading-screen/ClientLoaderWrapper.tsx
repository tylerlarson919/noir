/* -------------------------------------------------------------------------- */
/* components/loading-screen/ClientLoaderWrapper.tsx                          */
/* -------------------------------------------------------------------------- */
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

/* ––––– dynamic imports (no-SSR) –––––––––––––––––––––––––––––––––––––––––– */
const HomeLoader = dynamic(
  () => import("@/components/loading-screen/Loader2"),
  { ssr: false }
);
const PageLoader = dynamic(
  () => import("@/components/loading-screen/Loader"),
  { ssr: false }
);

/* ––––– timing helpers –––––––––––––––––––––––––––––––––––––––––––––––––––– */
/* (Change only if you change the animation inside Loader2)                  */
const HOME_TOTAL_MS = 2_100 + 800; // 2.9 s
const PAGE_DELAY_MS = 0;

/* -------------------------------------------------------------------------- */
export default function ClientLoaderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const Loader = isHome ? HomeLoader : PageLoader;
  const minShowTimeMs = isHome ? HOME_TOTAL_MS : PAGE_DELAY_MS;

  /* ----- loader visibility ------------------------------------------------ */
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const loaderTimer = setTimeout(() => {
      setIsLoading(false);
    }, minShowTimeMs);

    return () => clearTimeout(loaderTimer);
  }, [minShowTimeMs]);

  /* ----- children visibility (200 ms delay) ------------------------------- */
  const [showChildren, setShowChildren] = useState(false);
  useEffect(() => {
    if (!showChildren) {
      const childTimer = setTimeout(() => {
        setShowChildren(true);
      }, 200); // ← the required 200 ms

      return () => clearTimeout(childTimer);
    }
  }, [showChildren]);

  /* ----- render ----------------------------------------------------------- */
  return (
    <>
      {showChildren && (
        <div className="opacity-100 transition-opacity duration-300">
          {children}
        </div>
      )}

      {isLoading && <Loader />}
    </>
  );
}