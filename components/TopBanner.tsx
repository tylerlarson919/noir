"use client";
import React, { useState, useEffect } from "react";

const messages = [
  "Free shipping over $100 USD",
  "Prices include all duties & tariffs",
  "30 day return policy",
];

export default function TopBanner() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setPrev(current);
      setCurrent((i) => (i + 1) % messages.length);
    }, 8000);
    return () => clearInterval(t);
  }, [current]);

  return (
    <div className="top-banner bg-[#f5f5f5] dark:bg-noirdark1">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={
            "message" +
            (i === current ? " enter" : "") +
            (i === prev ? " exit" : "")
          }
        >
          {msg}
        </div>
      ))}
    </div>
  );
}
