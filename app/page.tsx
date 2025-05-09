import type { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';   // <–– NEW FILE, see below

export const metadata: Metadata = {
  title:       'New Arrivals – Luxury Hoodies, Jackets & Pants',
  description:
    'Shop the latest NOIR Clothing drops: heavyweight hoodies, precision-cut jackets and Japanese denim pants. Free global shipping over $100.',
  openGraph:   { images: ['/og/home.jpg'] },
  alternates:  { canonical: '/' },
};

export default function Home() {
  // Purely returns the client component
  return <HomeClient />;
}