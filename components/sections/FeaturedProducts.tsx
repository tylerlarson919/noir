import React from "react";

import ProductCard from "@/components/ui/ProductCard";
import { Product } from "@/lib/products";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Virtual } from "swiper/modules";
import "swiper/css/virtual";
import "swiper/css";
import "swiper/css/navigation";
import "@/styles/swiper-custom.css";

interface FeaturedProductsProps {
  products: Product[];
  title: string;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  title,
}) => {
  const router = useRouter();

  return (
    <section className="py-10 px-2">
      <div className="w-full flex flex-col gap-6 items-center justify-center">
        <div className="flex justify-center items-center">
          <h2 className="text-2xl md:text-2xl font-medium tracking-wider">
            {title}
          </h2>
        </div>
        <Swiper
          modules={[Navigation, Virtual]}
          navigation
          virtual
          spaceBetween={8}
          slidesPerView={2}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          className="w-full"
        >
          {products.map((product, index) => (
            <SwiperSlide key={product.id} virtualIndex={index} className="flex">
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
        <button
          className="w-fit py-2 px-6 bg-dark1 dark:bg-white button-grow-subtle text-white dark:text-black transition-color duration-300 rounded-sm"
          onClick={() => router.push("/all")}
        >
          View All
        </button>
      </div>
    </section>
  );
};

export default FeaturedProducts;
