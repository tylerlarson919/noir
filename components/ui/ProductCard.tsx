"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/products';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Get primary image - this should be the image associated with the first color
  const primaryColor = product.colors[0];
  const primaryImageIndex = primaryColor ? primaryColor.image : 0;
  
  // Get the image URL from the product's images array using the color's image index
  const primaryImageUrl = product.images && product.images.length > primaryImageIndex 
    ? product.images[primaryImageIndex]
    : '/images/placeholder.jpg';
  
  return (
    <div className="group">
      <Link href={`/all/products/${product.id}`}>
        <div className="relative overflow-hidden aspect-square rounded-xl">
          <div className="relative w-full h-full">
            {/* Primary image */}
            <Image
              src={primaryImageUrl}
              alt={product.name}
              fill
              className="object-contain object-center"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder.jpg';
              }}
              // Add image loading priority for better performance
              priority={true}
              // Add sizes attribute for responsiveness
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          </div>
        </div>
        <div className='flex flex-col justify-center items-center gap-1'>
          <h3 className="text-sm uppercase tracking-wide">{product.name}</h3>
          <p className="text-gray-800 dark:text-textaccent text-sm">${product.price.toFixed(2)}</p>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;