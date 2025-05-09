"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Product } from "@/lib/products";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Get primary image - this should be the image associated with the first color
  const primaryColor = product.colors[0];
  const [isHovering, setIsHovering] = useState(false);

  // Get both images
  const primaryImageUrl =
    product.images && product.images.length > primaryColor.images[0]
      ? product.images[primaryColor.images[0]]
      : "/images/placeholder.jpg";

  const secondaryImageUrl =
    product.images && product.images.length > primaryColor.images[1]
      ? product.images[primaryColor.images[1]]
      : "/images/placeholder.jpg";

  return (
    <div className="group mx-2">
      <Link href={`/all/products/${product.slug}`}>
        <div className="relative overflow-hidden aspect-[3/4] rounded">
          <div
            className="relative w-full h-full"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Primary image */}
            <Image
              fill
              alt={product.name}
              className={`object-cover object-center transition-opacity duration-300 ease-in-out ${isHovering ? "opacity-0" : "opacity-100"}`}
              priority={true}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              src={primaryImageUrl}
              onError={(e) => {
                const target = e.target as HTMLImageElement;

                target.src = "/images/placeholder.jpg";
              }}
            />

            {/* Secondary image (shows on hover) */}
            <Image
              fill
              alt={`${product.name} - alternate view`}
              className={`object-cover object-center transition-opacity duration-300 ease-in-out ${isHovering ? "opacity-100" : "opacity-0"}`}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              src={secondaryImageUrl}
              onError={(e) => {
                const target = e.target as HTMLImageElement;

                target.src = "/images/placeholder.jpg";
              }}
            />
          </div>
        </div>
        <div className="flex flex-col justify-center items-start gap-1 text-xs font-medium mt-2">
          <h3 className="uppercase">{product.name}</h3>
          <p className="text-gray-800 dark:text-textaccent">
            ${product.price.toFixed(2)} USD
          </p>
          <div className="flex gap-1 items-center">
            {product.colors.map((c) => (
              <span
                key={c.name}
                className="w-3 h-3 rounded-full border border-gray-300 dark:border-white/30 shrink-0"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
