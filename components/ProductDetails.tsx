//components/ProductDetails.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Select, SelectItem } from "@heroui/select";
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
import { Elements, useStripe, useElements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripeClient";
import ExpressCheckout from "@/components/ExpressCheckout";
import { useAuth } from "@/context/AuthContext";
import { v4 as uuidv4 } from "uuid";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { memo } from "react";

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
  const { resolvedTheme } = useTheme();
  const [clientSecret, setClientSecret]     = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [currency, setCurrency]             = useState("usd");
  const [expressLoading, setExpressLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // whenever size/color changes, regen the PI
    const initExpress = async () => {
      setExpressLoading(true);
      const payload = {
        items: [{
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          size: selectedSize,
          color: { name: selectedColor.name, value: selectedColor.hex },
          image: product.images[selectedColor.images[0]],
        }],
        userId: user?.uid || "guest-user",
        checkoutId: uuidv4(),
      };
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const { checkoutSessionClientSecret, paymentIntentId: piId, currency: respCurrency } = await res.json();
      setClientSecret(checkoutSessionClientSecret);
      setPaymentIntentId(piId);
      setCurrency(respCurrency);
    };
    initExpress();
  }, [selectedSize, selectedColor, user]);

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

  const openSizeChart = () => {
    setIsSizeChartOpen(true);
  };
  
  const closeSizeChart = () => {
    setIsSizeChartOpen(false);
  };

  const addToBagClick = () => {
    if (!selectedSize) {
      alert("Please select a size");

      return;
    }

    // Add item to cart
    addItem({
      id: product.id,
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

  const lightboxSlides = selectedColor.images.map((imageIndex) => ({
    src: product.images[imageIndex] || "/images/placeholder.jpg",
    alt: `${product.name} - ${selectedColor.name}`,
  }));

  return (
    <div className="mx-4 relative flex flex-col justify-start items-center">
      <SizeChartModal 
        productSizeChart={product.sizeChart}
        isOpen={isSizeChartOpen} 
        onClose={closeSizeChart} 
      />
      <div className="flex flex-col md:flex-row w-full h-full items-start justify-center mt-28 gap-4">
        {/* Product Images */}
        <div className="w-full md:w-2/3 flex flex-col relative">
          <Breadcrumbs className="absolute left-0 -top-5 z-[15]">
            <BreadcrumbItem
              className="capitalize"
              href={`/all?category=${product.category}`}
            >
              {product.category}
            </BreadcrumbItem>
            <BreadcrumbItem
              className="capitalize"
              href={`/all?subCategory=${product.subCategory}`}
            >
              {product.subCategory}
            </BreadcrumbItem>
            <BreadcrumbItem className="capitalize">
              {product.name}
            </BreadcrumbItem>
          </Breadcrumbs>

          <div className="w-full h-full relative">
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
            <div className="w-full md:hidden">
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
                    <div className="relative aspect-square w-full">
                      <Image
                        fill
                        alt={`${product.name} - ${selectedColor.name} - View ${index + 1}`}
                        className="object-contain"
                        loading={index === 0 ? "eager" : "lazy"}
                        priority={index === 0}
                        src={
                          product.images[imageIndex] ||
                          "/images/placeholder.jpg"
                        }
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
                  className="relative aspect-square bg-transparent w-full cursor-zoom-in"
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
                    alt={`${product.name} - ${selectedColor.name} - View ${index + 1}`}
                    className={`object-contain ${isTransitioning ? "animate-cross-fade-in" : ""}`}
                    loading={index === 0 ? "eager" : "lazy"}
                    priority={index === 0}
                    src={
                      product.images[imageIndex] || "/images/placeholder.jpg"
                    }
                    onTransitionEnd={
                      index === 0 ? () => setIsTransitioning(false) : undefined
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Product Details */}
        <div className="w-full md:w-1/3 ">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-medium">{product.name}</h1>
            <p className="text-xl">${product.price.toFixed(2)}</p>
            <p className="text-textaccentdarker dark:text-textaccent text-[14px] pt-2 pb-6">
              {product.description}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-4">
              <Select
                className="w-1/2"
                classNames={{
                  trigger:
                    "bg-transparent border-1 border-black/30 dark:border-textaccent/30",
                  popoverContent: "rounded-none",
                }}
                defaultSelectedKeys={[product.colors[0].name]}
                items={product.colors.map((color) => ({
                  id: color.name,
                  label: color.name,
                  color,
                }))}
                label="Color"
                labelPlacement="outside"
                listboxProps={{
                  itemClasses: {
                    base: [
                      "data-[hover=true]:rounded-none",
                      "data-[focus-visible=true]:rounded-none",
                    ],
                  },
                }}
                placeholder="Select a Color"
                radius="none"
                startContent={
                  <div
                    className="min-w-5 min-h-5 rounded-full mr-1"
                    style={{ backgroundColor: selectedColor?.hex || "#000000" }}
                  />
                }
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0];

                  if (selectedKey) {
                    const newColor = product.colors.find(
                      (c) => c.name === selectedKey,
                    );

                    if (newColor && newColor.name !== selectedColor.name) {
                      setPreviousColor(selectedColor);
                      setIsTransitioning(true);
                      setSelectedColor(newColor);
                    }
                  }
                }}
              >
                {(item) => (
                  <SelectItem
                    key={(item as any).id}
                    startContent={
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: (item as any).color.hex }}
                      />
                    }
                  >
                    {(item as any).label}
                  </SelectItem>
                )}
              </Select>
              <Select
                className="w-1/2"
                classNames={{
                  trigger:
                    "bg-transparent border-1 border-black/30 dark:border-textaccent/30 !overflow-visible",
                  popoverContent: "rounded-none",
                }}
                defaultSelectedKeys={[product.sizes[0]]}
                items={product.sizes.map((size) => ({ id: size, label: size }))}
                label="Size"
                labelPlacement="outside"
                listboxProps={{
                  itemClasses: {
                    base: [
                      "data-[hover=true]:rounded-none",
                      "data-[focus-visible=true]:rounded-none",
                    ],
                  },
                }}
                placeholder="Select a size"
                radius="none"
                onSelectionChange={(keys) => {
                  // Convert keys (Set) to Array and get the first item
                  const selectedKey = Array.from(keys)[0];

                  if (selectedKey) {
                    setSelectedSize(selectedKey.toString());
                  } else {
                    setSelectedSize(product.sizes[0]);
                  }
                }}
              >
                {(item) => (
                  <SelectItem key={(item as any).id}>
                    {(item as any).label}
                  </SelectItem>
                )}
              </Select>
            </div>
            <button className="text-sm flex items-center gap-2 underline" onClick={openSizeChart}>
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.583 8.445h.01M10.86 19.71l-6.573-6.63a.993.993 0 0 1 0-1.4l7.329-7.394A.98.98 0 0 1 12.31 4l5.734.007A1.968 1.968 0 0 1 20 5.983v5.5a.992.992 0 0 1-.316.727l-7.44 7.5a.974.974 0 0 1-1.384.001Z"/>
              </svg>
              <p>What&apos;s my size?</p>
            </button>
            <div className="w-full">
              <button
                className="w-full h-[42px] py-auto px-6 bg-dark1 dark:bg-white text-white dark:text-black transition-color duration-300 rounded-md font-medium"
                onClick={addToBagClick}
              >
                Add to cart
              </button>
            </div>
            <div className="w-full">
              {!clientSecret ? (
                <div className="min-h-[42px] w-full bg-gray-200 dark:bg-white/10 animate-pulse rounded-md" />
              ) : (
                <StripeCheckoutShell clientSecret={clientSecret}>
                  <ExpressCheckout
                    clientSecret={clientSecret}
                    currency={currency}
                    paymentIntentId={paymentIntentId}
                    type="productPage"
                    onReady={() => setExpressLoading(false)}
                  />
                </StripeCheckoutShell>
              )}
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
                <p className="text-textaccentdarker dark:text-textaccent text-[12px]">
                  list items from product here
                </p>
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
                <div className="text-textaccentdarker dark:text-textaccent text-[14px] flex flex-col gap-2">
                  <p>- United Stated Shipping 5-10 working days - UPS</p>
                  <p>- International Shipping 10-15 working days - UPS</p>
                  <p>If you have any issues with your order email us at help@noir-clothing.com and we will be there to help you. </p>
                  <p>Orders placed after 1PM (EST) will be shipped the following business day. </p>
                </div>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="mt-20">
        <FeaturedProducts
          products={featuredProducts}
          title="You Might Also Like"
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
