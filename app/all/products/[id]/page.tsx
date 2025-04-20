"use client";
import { useState, use, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getProductById } from '@/lib/products';
import FeaturedProducts from '@/components/sections/FeaturedProducts';
import { getFeaturedProducts } from '@/lib/products';
import {Select, SelectItem} from "@heroui/select";
import {Breadcrumbs, BreadcrumbItem} from "@heroui/breadcrumbs";
import {Accordion, AccordionItem} from "@heroui/accordion";
import { useCart } from '@/context/CartContext';

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  // Use type assertion to properly type the unwrapped params
  const unwrappedParams = use(params as any) as { id: string };
  const product = getProductById(unwrappedParams.id);
  
  if (!product) {
    notFound();
  }
  
  // Get related products (excluding current product)
  const featuredProducts = getFeaturedProducts().filter(p => p.id !== product.id).slice(0, 4);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const { addItem } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [previousImageIndex, setPreviousImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Update the nextImage and prevImage functions:
  const nextImage = () => {
    if (isTransitioning) return;
    setPreviousImageIndex(currentImageIndex);
    setIsTransitioning(true);
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };
  
  const prevImage = () => {
    if (isTransitioning) return;
    setPreviousImageIndex(currentImageIndex);
    setIsTransitioning(true);
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };
  
  // Add an effect to handle the transition end
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300); // Match the animation duration
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

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
      image: product.images[selectedColor.image] || product.images[0] || '/images/placeholder.jpg',
    });
  };

  return (
    <div className="container mx-auto relative">
      <Breadcrumbs className='absolute left-0 top-0 z-[15]'>
        <BreadcrumbItem className="capitalize" href={`/${product.category}`}>{product.category}</BreadcrumbItem>
        <BreadcrumbItem className="capitalize" href={`/${product.subCategory}`}>{product.subCategory}</BreadcrumbItem>
        <BreadcrumbItem className="capitalize">{product.name}</BreadcrumbItem>
      </Breadcrumbs>

      <div className="flex flex-col md:flex-row w-full h-full gap-12">
        {/* Product Images */}
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="relative aspect-square bg-transparent w-full">
            {/* Previous image */}
            {isTransitioning && (
              <Image
                src={product.images[previousImageIndex] || '/images/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-contain absolute z-10 animate-fade-out"
                priority
              />
            )}
            {/* Current image */}
            <Image
              src={product.images[currentImageIndex] || '/images/placeholder.jpg'}
              alt={product.name}
              fill
              className={`object-contain absolute ${isTransitioning ? 'animate-cross-fade-in' : ''}`}
              priority
              onTransitionEnd={() => setIsTransitioning(false)}
            />
            <button className='absolute top-0 bottom-0 right-0 py-auto button-grow' onClick={nextImage}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8">
                <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
              </svg>
            </button>
            <button className='absolute top-0 bottom-0 left-0 py-auto button-grow' onClick={prevImage}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8">
                <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {product.images.length > 1 && (
            <div className="flex flex-row justify-center items-center gap-2 h-full max-w-[512px] overflow-y-auto">
              {product.images.map((image, index) => {
                // Only render thumbnails that are actually needed to reduce DOM elements
                return (
                  <div 
                    key={index} 
                    className={`relative aspect-square bg-transparent w-[80px] h-[80px] cursor-pointer ${
                      currentImageIndex === index ? 'border-1 border-textaccentdarker dark:border-textaccent' : ''
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      className="object-contain"
                      loading="lazy" // Add lazy loading for thumbnails
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* Product Details */}
        <div>
          <div className='flex flex-col gap-1'>
            <h1 className="text-xl font-medium">{product.name}</h1>
            <p className="text-xl font-light">${product.price.toFixed(2)}</p>
            <p className="text-textaccentdarker dark:text-textaccent text-[14px] pt-2 pb-6">
              {product.description}
            </p>

          </div>

          <div className='flex flex-col gap-4'>
            <div className="flex flex-row gap-4">
              <Select
                placeholder="Select a Color"
                label="Color"
                labelPlacement="outside"
                className="w-1/2"
                radius='none'
                defaultSelectedKeys={[product.colors[0].name]}
                startContent={
                  <div 
                    className="min-w-5 min-h-5 rounded-full mr-1" 
                    style={{ backgroundColor: selectedColor?.hex || '#000000' }}
                  />
                }
                items={product.colors.map(color => ({ id: color.name, label: color.name, color }))}
                onSelectionChange={(keys) => {
                  // Convert keys (Set) to Array and get the first item
                  const selectedKey = Array.from(keys)[0];
                  if (selectedKey) {
                    const newColor = product.colors.find(c => c.name === selectedKey);
                    if (newColor) {
                      setSelectedColor(newColor);
                      // If the color has an associated image index, update the current image with transition
                      if (newColor.image !== undefined && newColor.image !== currentImageIndex) {
                        setPreviousImageIndex(currentImageIndex);
                        setIsTransitioning(true);
                        setCurrentImageIndex(newColor.image);
                      }
                    }
                  }
                }}
                classNames={{
                  trigger: "bg-transparent border-1 border-textaccentdarker dark:border-textaccent",
                  popoverContent: "rounded-none",
                }}
                listboxProps={{
                  itemClasses: {
                    base: [
                      "data-[hover=true]:rounded-none",
                      "data-[focus-visible=true]:rounded-none",
                    ],
                  },
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
                placeholder="Select a size"
                label="Size"
                labelPlacement="outside"
                className="w-1/2"
                radius='none'
                defaultSelectedKeys={[product.sizes[0]]}
                items={product.sizes.map(size => ({ id: size, label: size }))}
                // Update the onSelectionChange handler in the Color Select component:
                onSelectionChange={(keys) => {
                  // Convert keys (Set) to Array and get the first item
                  const selectedKey = Array.from(keys)[0];
                  if (selectedKey) {
                    setSelectedSize(selectedKey.toString());
                  } else {
                    setSelectedSize(product.sizes[0]);
                  }
                }}

                classNames={{
                  trigger: "bg-transparent border-1 border-textaccentdarker dark:border-textaccent",
                  popoverContent: "rounded-none",
                }}
                listboxProps={{
                  itemClasses: {
                    base: [
                      "data-[hover=true]:rounded-none",
                      "data-[focus-visible=true]:rounded-none",
                    ],
                  },
                }}
              >
                {(item) => (
                  <SelectItem key={(item as any).id}>
                    {(item as any).label}
                  </SelectItem>
                )}
              </Select>
            </div>
            <div className='w-full'>
              <button onClick={addToBagClick} className='w-full py-2 px-4 bg-dark1 dark:bg-white button-grow-subtle text-white dark:text-black transition-color duration-300'>
                Add to bag
              </button>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-textaccentdarker dark:border-textaccent">
            <Accordion variant="light">
              <AccordionItem className='text-[14px]' key="1" aria-label="Details & Care" title="Details & Care"
                classNames={{
                  title: "text-[14px]"
                }}
              >
                <p className='text-textaccentdarker dark:text-textaccent text-[12px]'>
                  list items from product here
                </p>
              </AccordionItem>
              <AccordionItem key="2" aria-label="Sizing" title="Sizing"
                classNames={{
                  title: "text-[14px]"
                }}
              >
                <p className='text-textaccentdarker dark:text-textaccent text-[12px]'>
                  sizing chart here
                </p>
              </AccordionItem>
              <AccordionItem key="3" aria-label="Delivery & Returns" title="Delivery & Returns"
                classNames={{
                  title: "text-[14px]"
                }}
              >
                <p className='text-textaccentdarker dark:text-textaccent text-[12px]'>
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