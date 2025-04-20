import React from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import Button from '@/components/ui/button';
import { Product } from '@/lib/products';

interface FeaturedProductsProps {
  products: Product[];
  title: string;
  linkText?: string;
  linkUrl?: string;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ 
  products, 
  title, 
  linkText = "View All",
  linkUrl = "/all" 
}) => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          {linkText && linkUrl && (
            <Link href={linkUrl}>
              <Button text={linkText} variant="outline" size="sm" />
            </Link>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;