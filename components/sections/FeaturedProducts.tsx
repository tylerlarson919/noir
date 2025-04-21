import React from "react";

import ProductCard from "@/components/ui/ProductCard";
import { Product } from "@/lib/products";

interface FeaturedProductsProps {
  products: Product[];
  title: string;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  title,
}) => {
  return (
    <section className="py-10">
      <div className="px-4 w-full flex flex-col gap-6 items-center justify-center">
        <div className="flex justify-center items-center">
          <h2 className="text-2xl md:text-2xl font-medium tracking-wider">
            {title}
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full px-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <button className="w-fit py-2 px-6 bg-dark1 dark:bg-white button-grow-subtle text-white dark:text-black transition-color duration-300">
          View All
        </button>
      </div>
    </section>
  );
};

export default FeaturedProducts;
