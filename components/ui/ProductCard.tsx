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
        <div className="relative overflow-hidden aspect-square mb-4 rounded-xl">
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
          {product.new && (
            <div className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1">
              NEW
            </div>
          )}
        </div>
        <h3 className="text-lg font-medium">{product.name}</h3>
        <div className='flex flex-row justify-between items-center'>
          <p className="text-gray-800 dark:text-textcolor">${product.price.toFixed(2)}</p>
          <div className="mr-3 flex gap-1">
            {product.colors.map((color) => (
              <div 
                key={color.name} 
                className="w-[16px] h-[16px] rounded-full border border-gray-300" 
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;