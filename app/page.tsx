"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Hero from "@/components/ui/Hero";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import { getFeaturedProducts, getProductsBySubCategory } from "@/lib/products";

export default function Home() {
  const featuredProducts = getFeaturedProducts();
  const pantsProducts = getProductsBySubCategory("pants");
  const router = useRouter();

  useEffect(() => {
    const els = document.querySelectorAll(
      ".fade-in-section, .fade-in-section-left, .fade-in-section-right"
    );
    const obs = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(({ isIntersecting, target }) => {
          if (isIntersecting) {
            target.classList.add("is-visible");
            observer.unobserve(target);
          }
        });
      },
      { threshold: 0.2 }
    );
    els.forEach(el => obs.observe(el));
    return () => els.forEach(el => obs.unobserve(el));
  }, []);

  return (
    <div className="flex flex-col w-full h-full">
      {/* 1. Hero */}
      <div className="fade-in-section">
        <Hero />
      </div>
      {/* 2. NEW ARRIVALS */}
      <div className="fade-in-section">
        <FeaturedProducts products={featuredProducts} title="NEW ARRIVIALS" />
      </div>
      {/* 3. Tops/Bottoms split screen */}
      <div className="relative h-[80vh] flex flex-row w-full items-center justify-start flex-grow">
        <button
          className="z-[5] absolute bottom-8 left-8 w-fit py-2 px-6 bg-dark1 dark:bg-white button-grow-subtle text-white dark:text-black transition-color duration-300 rounded-sm"
          onClick={() =>
            router.push(
              "/all?subCategory=hoodies&subCategory=shirts&subCategory=jackets"
            )
          }
        >
          Tops
        </button>
        <button
          className="z-[5] absolute bottom-8 left-1/2 ml-8 w-fit py-2 px-6 bg-dark1 dark:bg-white button-grow-subtle text-white dark:text-black transition-color duration-300 rounded-sm"
          onClick={() => router.push("/all?subCategory=pants")}
        >
          Bottoms
        </button>
        <button
          className="fade-in-section-left relative cursor-pointer image-grow"
          style={{
            backgroundImage: `url('https://res.cloudinary.com/dyujm1mtq/image/upload/v1745163797/TOPS_fcv680.webp')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            width: "50%",
            height: "100%",
          }}
          onClick={() => router.push("/all?subCategory=hoodies&subCategory=shirts&subCategory=jackets)")}
        />
        <button
          className="fade-in-section-left relative cursor-pointer image-grow"
          style={{
            backgroundImage: `url('https://res.cloudinary.com/dyujm1mtq/image/upload/v1745163798/BOTTOMS__lk5qla.webp')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            width: "50%",
            height: "100%",
          }}
          onClick={() => router.push("/all?subCategory=pants")}
        />
      </div>
      {/* 4. DENIM */}
      <div className="fade-in-section">
        <FeaturedProducts products={pantsProducts} title="PANTS" />
      </div>
    </div>
  );
}
