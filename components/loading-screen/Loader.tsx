"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const FILL_MS = 800; // identical timing to the old shader-fill
const FADE_MS = 800; // identical timing to the old fade/scale

export default function Loader() {
  const [stage, setStage] = useState<"fill" | "fade" | "done">("fill");

  /* ─────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (stage === "fill") {
      const t = setTimeout(() => setStage("fade"), FILL_MS);
      return () => clearTimeout(t);
    }
    if (stage === "fade") {
      const t = setTimeout(() => setStage("done"), FADE_MS);
      return () => clearTimeout(t);
    }
  }, [stage]);
  /* ─────────────────────────────────────────────────────────────── */

  if (stage === "done") return null;

  return (
    <AnimatePresence>
        <motion.div
          key="loader"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-white"
          initial={{ opacity: 1 }}
          animate={{ opacity: stage === "fade" ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_MS / 1000, ease: "easeInOut" }}
        >
          {/* 2️⃣  inner wrapper: handles scale + upward push */}
          <motion.div
            animate={
              stage === "fade"
                ? { scale: 0.2, y: -72 }
                : { scale: 1, y: 0 }
            }
            transition={{ duration: FADE_MS / 1000, ease: "easeInOut" }}
            className="relative flex items-center justify-center"
          >
            {/* blurred backdrop logo (unchanged) */}
            <img
              src="/n-logo-light.svg"
              alt="blurred logo"
              className="absolute w-[200px] h-[200px] opacity-40 blur-md"
            />

            {/* foreground logo that fills from bottom to top */}
            <motion.img
              src="/n-logo-light.svg"
              alt="logo"
              className="relative w-[200px] h-[200px]"
              initial={{ clipPath: "inset(100% 0 0 0)" }}
              animate={{ clipPath: ["inset(100% 0 0 0)", "inset(0% 0 0 0)"] }}
              transition={{ duration: FILL_MS / 1000, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
    </AnimatePresence>
  );
}