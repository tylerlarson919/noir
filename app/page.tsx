"use client";
import Hero from '@/components/ui/Hero';
import FeaturedProducts from '@/components/sections/FeaturedProducts';
import CategoryPreview from '@/components/sections/CategoryPreview';
import Newsletter from '@/components/sections/Newsletter';
import { getFeaturedProducts, getProductsBySubCategory } from '@/lib/products';
import { useRouter } from 'next/navigation';

export default function Home() {
  const featuredProducts = getFeaturedProducts();
  const denimProducts = getProductsBySubCategory('jeans');
  const router = useRouter();


  return (
    <div className='flex flex-col w-full h-full'>
      <Hero />
      
      <FeaturedProducts 
        products={featuredProducts} 
        title="NEW ARRIVIALS"
      />
      
      
      <div className="relative h-[80vh] flex flex-row w-full items-center justify-start flex-grow">
        <button onClick={() => router.push("/all?subCategory=hoodies&subCategory=shirts&subCategory=jackets")} className='z-[5] absolute bottom-8 left-8 w-fit py-2 px-6 bg-dark1 dark:bg-white button-grow-subtle text-white dark:text-black transition-color duration-300'>
          Tops
        </button>
        <button onClick={() => router.push("/all?subCategory=pants")} className='z-[5] absolute bottom-8 left-1/2 ml-8 w-fit py-2 px-6 bg-dark1 dark:bg-white button-grow-subtle text-white dark:text-black transition-color duration-300'>
          Bottoms
        </button>
        <div 
          style={{ 
            backgroundImage: `url('https://res.cloudinary.com/dyujm1mtq/image/upload/v1745163797/TOPS_fcv680.webp')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '50%',
            height: '100%'
          }}
          className='relative cursor-pointer image-grow'
        >

        </div>
        <div 
          style={{ 
            backgroundImage: `url('https://res.cloudinary.com/dyujm1mtq/image/upload/v1745163798/BOTTOMS__lk5qla.webp')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '50%',
            height: '100%'
          }}
          className='relative cursor-pointer image-grow'
        >
        </div>
      </div>
      <FeaturedProducts 
        products={denimProducts} 
        title="DENIM"
      />
    </div>
  );
}