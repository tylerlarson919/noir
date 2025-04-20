import React from 'react';
import Link from 'next/link';
import Button from './button';

interface HeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  imageSrc: string;
}

const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  ctaText,
  ctaLink,
  imageSrc
}) => {
  return (
    <div className="relative h-[80vh] overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: `url(${imageSrc})` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-lg">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              {title}
            </h1>
            <p className="text-xl text-white/90 mb-8">
              {subtitle}
            </p>
            <Link href={ctaLink}>
              <Button text={ctaText} variant="primary" size="lg" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;