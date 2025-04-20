"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/products';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Get primary image - this should be the image associated with the first color
  const primaryColor = product.colors[0];
  const primaryImageIndex = primaryColor ? primaryColor.images[0] : 0;
  const [isHovering, setIsHovering] = useState(false);

  // Get both images
  const primaryImageUrl = product.images && product.images.length > primaryColor.images[0] 
    ? product.images[primaryColor.images[0]]
    : '/images/placeholder.jpg';

  const secondaryImageUrl = product.images && product.images.length > primaryColor.images[1] 
    ? product.images[primaryColor.images[1]]
    : '/images/placeholder.jpg';
  
  return (
    <div className="group">
      <Link href={`/all/products/${product.id}`}>
        <div className="relative overflow-hidden aspect-square rounded-xl">
          <div 
            className="relative w-full h-full"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Primary image */}
            <Image
              src={primaryImageUrl}
              alt={product.name}
              fill
              className={`object-contain object-center transition-opacity duration-300 ease-in-out ${isHovering ? 'opacity-0' : 'opacity-100'}`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder.jpg';
              }}
              priority={true}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
            
            {/* Secondary image (shows on hover) */}
            <Image
              src={secondaryImageUrl}
              alt={`${product.name} - alternate view`}
              fill
              className={`object-contain object-center transition-opacity duration-300 ease-in-out ${isHovering ? 'opacity-100' : 'opacity-0'}`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder.jpg';
              }}
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