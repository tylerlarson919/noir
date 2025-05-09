//components/ProductDetails.tsx
"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { useCart } from "@/context/CartContext";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import { Product } from "@/lib/products";
import "swiper/css";
import "swiper/css/pagination";
import "@/styles/swiper-custom.css";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import SizeChartModal from "@/components/sizeChartModal";
import TrustItems from "@/components/trustItems";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripeClient";
import ExpressCheckout from "@/components/ExpressCheckout";
import { useAuth } from "@/context/AuthContext";
import { v4 as uuidv4 } from "uuid";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { memo } from "react";

type Color = { name: string; hex: string; images: number[] };

const ColorPicker = memo(function ColorPicker({
  colors,
  selected,
  onSelect,
  productImages,
}: {
  colors: Color[];
  selected: Color;
  onSelect: (c: Color) => void;
  productImages: string[];
}) {
  return (
    <div className="flex gap-3">
      {colors.map((c) => (
        <button
          key={c.name}
          className={`w-12 h-12 rounded border-1 overflow-hidden transition flex items-center justify-center bg-[#f2f2f2] ${
            selected.name === c.name
              ? "border-black dark:border-white"
              : "border-transparent hover:border-gray-400 dark:hover:border-white/20"
          }`}
          onClick={() => onSelect(c)}
        >
          <Image
            src={productImages[c.images[0]]}
            alt={`${c.name} thumbnail`}
            width={35}
            height={35}
            className="object-cover"
          />
        </button>
      ))}
    </div>
  );
});

const SizePicker = memo(function SizePicker({
  sizes,
  selected,
  onSelect,
}: {
  sizes: string[];
  selected: string;
  onSelect: (s: string) => void;
}) {
  return (
    <div className="flex gap-2 items-center justify-start">
      {sizes.map((s) => (
        <button
          key={s}
          className={`w-20 border rounded transition-all text-xs w-[50px] h-[45px] ${
            selected === s
              ? "border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-semibold"
              : "font-semibold border-transparent hover:border-gray-500 dark:hover:border-white/40"
          }`}
          onClick={() => onSelect(s)}
        >
          {s}
        </button>
      ))}
    </div>
  );
});


const StripeCheckoutShell = memo(function StripeCheckoutShell({
  clientSecret,
  children,
}: {
  clientSecret: string;
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Elements
      stripe={stripePromise}
      key={clientSecret}
      options={{
        clientSecret,
        appearance: { theme: isDark ? "night" : "stripe" },
      }}
    >
      {children}
    </Elements>
  );
});

export default function ProductDetails({
  product,
  featuredProducts,
}: {
  product: Product;
  featuredProducts: Product[];
}) {
  const swiperRef = useRef<any>(null);
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes[0] || "",
  );
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const { addItem } = useCart();
  const [previousColor, setPreviousColor] = useState(product.colors[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [open, setOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set([]));
  const { user } = useAuth();
  const [clientSecret, setClientSecret]     = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [currency, setCurrency]             = useState("usd");
  const [expressLoading, setExpressLoading] = useState(true);
  const router = useRouter();

  const regeneratePaymentIntent = useCallback(async () => {
    const payload = {
      items: [
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          size: selectedSize,
          color: { name: selectedColor.name, value: selectedColor.hex },
          image: product.images[selectedColor.images[0]],
        },
      ],
      userId: user?.uid || "guest-user",
      checkoutId: uuidv4(),
    };
  
    setExpressLoading(true);
  
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const {
      checkoutSessionClientSecret,
      paymentIntentId: piId,
      currency: respCurrency,
    } = await res.json();
  
    setClientSecret(checkoutSessionClientSecret);
    setPaymentIntentId(piId);
    setCurrency(respCurrency);
    setExpressLoading(false);
  }, [
    product.id,
    product.name,
    product.price,
    selectedSize,
    selectedColor,
    user,
  ]);
  
  useEffect(() => {
    const t = setTimeout(regeneratePaymentIntent, 300); // 300 ms debounce
    return () => clearTimeout(t);
  }, [regeneratePaymentIntent]);

  // Add this useEffect to handle transition timing
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300); // Match animation duration

      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  useEffect(() => {
    // Reset current slide when color changes

    // Use the swiperRef to access the Swiper instance
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slideTo(0);
    }
  }, [selectedColor]);

  const openSizeChart  = useCallback(() => setIsSizeChartOpen(true), []);
  const closeSizeChart = useCallback(() => setIsSizeChartOpen(false), []);

  const addToBagClick = () => {
    if (!selectedSize) {
      alert("Please select a size");

      return;
    }

    // Add item to cart
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      quantity: 1,
      size: selectedSize,
      color: selectedColor,
      image:
        product.images[selectedColor.images[0]] ||
        product.images[0] ||
        "/images/placeholder.jpg",
    });
  };

const lightboxSlides = useMemo(
  () =>
    selectedColor.images.map((imageIndex) => ({
      src: product.images[imageIndex] || "/images/placeholder.jpg",
      alt: `${product.name} - ${selectedColor.name}`,
    })),
  [selectedColor, product.name],
);
  return (
    <div className="mx-4 relative flex flex-col justify-start items-center mt-20">
      <SizeChartModal 
        productSizeChart={product.sizeChart}
        isOpen={isSizeChartOpen} 
        onClose={closeSizeChart} 
      />
      <div className="flex flex-col md:flex-row w-full h-full items-start justify-center mt-10 gap-4 stagger-fadein relative">
        {/* Product Images */}
        <div className="w-full md:w-2/3 flex flex-col absolute relative">

          <div className="w-full h-full relative">
            <Breadcrumbs className="absolute left-0 -top-8 z-[15]">
              <BreadcrumbItem
                className="capitalize"
                href={`/all?category=${product.category}`}
              >
                {product.category}
              </BreadcrumbItem>
              <BreadcrumbItem
                className="capitalize"
                href={`/all?subCategory=${product.subCategory}&subCategory=${product.category}`}
              >
                {product.subCategory}
              </BreadcrumbItem>
              <BreadcrumbItem className="capitalize">
                {product.name}
              </BreadcrumbItem>
            </Breadcrumbs>
            {/* Previous color images - positioned absolutely over the current images */}
            {isTransitioning && (
              <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 absolute inset-0 z-10 hidden md:grid">
                {previousColor.images.map((imageIndex, index) => (
                  <div
                    key={`prev-${index}`}
                    className="relative aspect-square bg-transparent w-full"
                  >
                    <Image
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      alt={`${product.name} - ${previousColor.name} - View ${index + 1}`}
                      className="object-contain animate-fade-out"
                      priority={index === 0}
                      src={
                        product.images[imageIndex] || "/images/placeholder.jpg"
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Mobile version - Swiper slider (only shows below md breakpoint) */}
            <div className="w-[calc(100%+32px)] md:hidden -ml-4">
              <Swiper
                ref={swiperRef}
                className="w-full"
                grabCursor={true}
                modules={[Pagination]}
                pagination={{
                  clickable: true,
                  bulletActiveClass: "swiper-pagination-bullet-active",
                  bulletClass: "swiper-pagination-bullet",
                }}
                slidesPerView={1}
                spaceBetween={0}
              >
                {selectedColor.images.map((imageIndex, index) => (
                  <SwiperSlide
                    key={`mobile-${index}`}
                    onClick={() => {
                      setSlideIndex(index);
                      setOpen(true);
                    }}
                    className="cursor-zoom-in"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSlideIndex(index);
                        setOpen(true);
                      }
                    }}
                    aria-label={`View larger image of ${product.name} in ${selectedColor.name}, view ${index + 1}`}
                  >
                    <div className="relative aspect-[3/4] w-full">
                      <Image
                        fill
                        sizes="(max-width:768px) 100vw, 50vw"
                        alt={`${product.name} - ${selectedColor.name} - View ${index + 1}`}
                        className="object-cover"
                        loading={index === 0 ? "eager" : "lazy"}
                        priority={index === 0 && index < 2} // Only prioritize the first visible image
                        src={product.images[imageIndex] || "/images/placeholder.jpg"}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Desktop version - grid layout (only shows at md breakpoint and above) */}
            <div
              className={`w-full h-full grid grid-cols-2 ${isTransitioning ? "z-0" : "z-10"} hidden md:grid`}
            >
              {selectedColor.images.map((imageIndex, index) => (
                <div
                  key={`current-${index}`}
                  className="relative bg-transparent w-full aspect-[3/4] cursor-zoom-in"
                  onClick={() => {
                    setSlideIndex(index);
                    setOpen(true);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSlideIndex(index);
                      setOpen(true);
                    }
                  }}
                  aria-label={`View larger image of ${product.name} in ${selectedColor.name}, view ${index + 1}`}
                >
                  <Image
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    alt={`${product.name} - ${selectedColor.name} - View ${index + 1}`}
                    className={`object-cover ${isTransitioning ? "animate-cross-fade-in" : ""}`}
                    loading={index === 0 ? "eager" : "lazy"}
                    priority={index === 0 && index < 2} // Only prioritize the first visible image
                    src={product.images[imageIndex] || "/images/placeholder.jpg"}
                    onTransitionEnd={index === 0 ? () => setIsTransitioning(false) : undefined}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Product Details */}
        <div className="w-full md:w-1/3 relative sm:sticky sm:top-24">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-medium">{product.name}</h1>
            <p className="text-xl">${product.price.toFixed(2)}</p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 pt-3">
              <hr className="shrink-0 bg-divider border-none w-full h-divider"/>
              <ColorPicker
                colors={product.colors}
                productImages={product.images}
                selected={selectedColor}
                onSelect={(c) => {
                  setPreviousColor(selectedColor);
                  setIsTransitioning(true);
                  setSelectedColor(c);
                }}
              />
              <hr className="shrink-0 bg-divider border-none w-full h-divider"/>
              <SizePicker
                sizes={product.sizes}
                selected={selectedSize}
                onSelect={(s) => setSelectedSize(s)}
              />
              <hr className="shrink-0 bg-divider border-none w-full h-divider"/>
              <p className="text-textaccentdarker dark:text-textaccent text-[14px]">
                {product.description}
              </p>
            </div>
            <button className="text-sm flex items-center gap-2 underline" onClick={openSizeChart}>
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.583 8.445h.01M10.86 19.71l-6.573-6.63a.993.993 0 0 1 0-1.4l7.329-7.394A.98.98 0 0 1 12.31 4l5.734.007A1.968 1.968 0 0 1 20 5.983v5.5a.992.992 0 0 1-.316.727l-7.44 7.5a.974.974 0 0 1-1.384.001Z"/>
              </svg>
              <p>What&apos;s my size?</p>
            </button>
            <div className="w-full flex flex-col gap-3">
              <button
                className="w-full h-[52px] py-auto px-6 bg-dark1 dark:bg-white text-white dark:text-black transition-color duration-300 rounded-md font-semibold text-lg"
                onClick={addToBagClick}
              >
                Add to cart
              </button>
              <div className="w-full relative h-[62px] min-h-[62px] max-h-[62px]">
                {clientSecret ? (
                  <StripeCheckoutShell clientSecret={clientSecret}>
                    {expressLoading && (
                      <div className="absolute inset-0 mt-[5px] mb-[5px] min-h-[52px] w-full bg-gray-200 dark:bg-white/10 animate-pulse rounded-md z-[10]" />
                    )}
                    <ExpressCheckout
                      clientSecret={clientSecret}
                      currency={currency}
                      paymentIntentId={paymentIntentId}
                      type="productPage"
                      onReady={() => setExpressLoading(false)}
                    />
                  </StripeCheckoutShell>
                ) : (
                  <div className="mt-[5px] mb-[5px] min-h-[52px] w-full bg-gray-200 dark:bg-white/10 animate-pulse rounded-md" />
                )}
              </div>
            </div>
            <button
              className="text-sm text-textaccentdarker dark:text-textaccent underline"
              onClick={() => {
                if (!selectedSize) {
                  alert("Please select a size");
                  return;
                }
                addItem({
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  quantity: 1,
                  size: selectedSize,
                  color: selectedColor,
                  image:
                    product.images[selectedColor.images[0]] ||
                    product.images[0] ||
                    "/images/placeholder.jpg",
                });
                router.push("/checkout/new");
              }}
            >
              More payment options
            </button>
          </div>

          <TrustItems/>

          <div className="mt-6 ">
            <Accordion 
              variant="light"
              className="px-0"
              selectedKeys={expandedKeys}
              onSelectionChange={(keys) => {
                // Convert Selection to an array of strings first, then filter
                const keysArray = Array.from(keys) as string[];
                const filteredKeys = new Set(keysArray.filter(key => key !== "2"));
                setExpandedKeys(filteredKeys);
              }}
            >
              <AccordionItem
                key="1"
                aria-label="Details & Care"
                className="text-[14px]"
                classNames={{
                  title: "text-[14px]",
                }}
                title="Details & Care"
              >
              {/* ------- DETAILS & CARE LISTS ------- */}
              <div className="text-textaccentdarker dark:text-textaccent text-[12px] flex flex-col gap-2">

                {/* Details list */}
                <ul className="list-disc pl-4 space-y-1 capitalize">
                  <li>
                    <span className="font-semibold">Style:</span> {product.details?.Style}
                  </li>
                  <li>
                    <span className="font-semibold">Fit:</span> {product.details?.Fit}
                  </li>
                  {product.details?.WaistType && (
                    <li>
                      <span className="font-semibold">Waist&nbsp;Type:</span>{" "}
                      {product.details.WaistType}
                    </li>
                  )}
                  <li>
                    <span className="font-semibold">Material:</span>{" "}
                    {product.details?.Material}
                  </li>
                </ul>

                {/* Care list */}
                <p className="font-semibold pt-2">Care</p>
                <ul className="list-disc pl-4 space-y-1">
                  {product.details?.Care.split(",").map((item) => {
                    const txt = item.trim();
                    return (
                      <li key={txt}>
                        {txt.charAt(0).toUpperCase() + txt.slice(1)}
                      </li>
                    );
                  })}
                </ul>
              </div>
              </AccordionItem>
              <AccordionItem
                onPress={openSizeChart}
                key="2"
                aria-label="Size Guide"
                classNames={{
                  title: "text-[14px]",
                }}
                title="Size Guide"
              >
              </AccordionItem>
              <AccordionItem
                key="3"
                aria-label="Delivery & Returns"
                classNames={{
                  title: "text-[14px]",
                }}
                title="Delivery & Returns"
              >
                <div className="text-textaccentdarker dark:text-textaccent text-[12px] flex flex-col gap-2">
                {/* Delivery & Returns */}
                <ul className="list-disc pl-4 space-y-1 capitalize">
                  <li>
                    <span className="font-semibold">United Stated:</span> Shipping 5-10 working days - UPS
                  </li>
                  <li>
                    <span className="font-semibold">International Shipping:</span> 10-15 working days - UPS
                  </li>
                </ul>
                  <p>If you have any issues with your order email us at help@noir-clothing.com and we will be happy to help. </p>
                  <p>Orders placed after 1PM (EST) will be shipped the following business day. </p>
                </div>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="mt-10 w-full">
        <FeaturedProducts
          products={featuredProducts}
          title="You May Also Like"
        />
      </div>
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={lightboxSlides}
        index={slideIndex}
        plugins={[Zoom]}
        zoom={{
          maxZoomPixelRatio: 3,
          zoomInMultiplier: 2,
          doubleTapDelay: 300,
          doubleClickDelay: 300,
          keyboardMoveDistance: 50,
        }}
      />
    </div>
  );
}
