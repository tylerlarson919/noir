"use client";
import { useState, use, useEffect, useRef } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Select, SelectItem } from "@heroui/select";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { Accordion, AccordionItem } from "@heroui/accordion";
// Replace useSwipeable import with Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

import { useCart } from "@/context/CartContext";
import { getFeaturedProducts } from "@/lib/products";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import { getProductById } from "@/lib/products";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "@/styles/swiper-custom.css";

export default async function ProductPage({
     params,
   }: {
     params: Promise<{ id: string }>;
   }) {
    const { id } = await params;
  const product = getProductById(id);

  const swiperRef = useRef<any>(null);

  if (!product) {
    notFound();
  }

  // Get related products (excluding current product)
  const featuredProducts = getFeaturedProducts()
    .filter((p) => p.id !== product.id)
    .slice(0, 4);
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes[0] || "",
  );
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const { addItem } = useCart();
  const [previousColor, setPreviousColor] = useState(product.colors[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  return (
    <div className="mx-4 relative flex flex-col justify-start items-center">
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
                  <SwiperSlide key={`mobile-${index}`}>
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
                  className="relative aspect-square bg-transparent w-full"
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
            <p className="text-xl font-light">${product.price.toFixed(2)}</p>
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
                    "bg-transparent border-1 border-textaccentdarker dark:border-textaccent",
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
                    "bg-transparent border-1 border-textaccentdarker dark:border-textaccent !overflow-visible",
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
            <div className="w-full">
              <button
                className="w-full py-2 px-6 bg-dark1 dark:bg-white button-grow-subtle text-white dark:text-black transition-color duration-300"
                onClick={addToBagClick}
              >
                Add to bag
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-textaccentdarker dark:border-textaccent">
            <Accordion variant="light">
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
                key="2"
                aria-label="Sizing"
                classNames={{
                  title: "text-[14px]",
                }}
                title="Sizing"
              >
                <p className="text-textaccentdarker dark:text-textaccent text-[12px]">
                  sizing chart here
                </p>
              </AccordionItem>
              <AccordionItem
                key="3"
                aria-label="Delivery & Returns"
                classNames={{
                  title: "text-[14px]",
                }}
                title="Delivery & Returns"
              >
                <p className="text-textaccentdarker dark:text-textaccent text-[12px]">
                  30 days
                </p>
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
    </div>
  );
}
