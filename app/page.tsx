import Hero from '@/components/ui/Hero';
import FeaturedProducts from '@/components/sections/FeaturedProducts';
import CategoryPreview from '@/components/sections/CategoryPreview';
import Newsletter from '@/components/sections/Newsletter';
import { getFeaturedProducts } from '@/lib/products';

export default function Home() {
  const featuredProducts = getFeaturedProducts();
  
  return (
    <>
      <Hero 
        title="Elegance in Every Detail"
        subtitle="Discover our new collection of timeless, sustainable fashion pieces."
        ctaText="Shop Now"
        ctaLink="/all"
        imageSrc="/images/hero.jpg"
      />
      
      <FeaturedProducts 
        products={featuredProducts} 
        title="Featured Collection"
      />
      
      
      <CategoryPreview 
        title="Men's Collection"
        description="Our men's collection combines classic styles with modern details, offering versatile wardrobe essentials crafted from premium materials."
        imageSrc="/images/men-category.jpg"
        ctaText="Shop Men"
        ctaLink="/all?category=men"
        imagePosition="right"
      />
      
      <Newsletter />
    </>
  );
}