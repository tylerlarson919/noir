// app/about/page.tsx
'use client';

import { useEffect } from 'react';
import Image from 'next/image';

export default function AboutPage() {
  // Simple Intersection Observer to trigger the fade-in utility class
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('fade');
        });
      },
      { threshold: 0.15 }
    );

    const elements = document.querySelectorAll('.will-fade');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="bg-white text-neutral-900 overflow-x-hidden">
      {/* 1. Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-[80vh] px-6 pb-20">
        <Image
          src="/placeholder-hero.jpg"        /* A cinematic black-and-white shot of flowing silk */
          alt="Noir luxury fabric"
          fill
          priority
          className="object-cover object-center -z-10"
        />
        <div className="max-w-4xl text-center space-y-6 will-fade">
          <h1 className="font-serif text-5xl md:text-7xl tracking-tight">
            Noir
          </h1>
          <p className="md:text-xl tracking-wide">
            True luxury, honestly priced.
          </p>
        </div>
      </section>

      {/* 2. Origin Story */}
      <section className="px-6 md:px-20 lg:px-32 py-24 space-y-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 will-fade">
            <h2 className="font-semibold text-3xl md:text-4xl">Our Beginning</h2>
            <p className="leading-relaxed">
              Noir started in a tiny Paris atelier where our founder, tired of
              watching mark-ups eclipse craftsmanship, asked a simple question:
              “What if elegance didn’t come with a hidden tax?” We began by
              sourcing the same mills favored by heritage fashion houses—and
              skipped the endless middlemen. What remained was pure:
              <span className="italic">luxury stripped of pretense.</span>
            </p>
          </div>

          <Image
            src="/placeholder-origin.jpg"   /* A candid photo of a sunlit Parisian studio with pattern sketches */
            alt="Noir atelier"
            width={800}
            height={600}
            className="rounded-lg will-fade"
          />
        </div>
      </section>

      {/* 3. The Philosophy */}
      <section className="bg-neutral-100 px-6 md:px-20 lg:px-32 py-24">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="space-y-6 text-center will-fade">
            <h2 className="font-semibold text-3xl md:text-4xl">
              The Noir Philosophy
            </h2>
            <p className="leading-relaxed md:text-lg">
              We obsess over silhouette, drape, and fabric science—then let
              minimalism speak for itself. Every collection is built on three
              pillars:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              ['Masterful Craft', '/placeholder-craft.jpg', 'Close-up of skilled hands sewing a lapel'],
              ['Radical Transparency', '/placeholder-transparency.jpg', 'Glass pricing chart overlaid on fabric'],
              ['Timeless Design', '/placeholder-timeless.jpg', 'Model wearing a classic, monochrome trench against marble']
            ].map(([title, src, alt]) => (
              <div key={title} className="space-y-4 will-fade">
                <Image
                  src={src as string}
                  alt={alt as string}
                  width={600}
                  height={400}
                  className="rounded-md"
                />
                <h3 className="font-medium text-xl">{title}</h3>
                <p className="text-sm leading-relaxed">
                  {title === 'Masterful Craft' &&
                    'Italian-spun wool, Japanese hardware, and stitches counted in the hundreds per inch.'}
                  {title === 'Radical Transparency' &&
                    'We reveal every cost—from fabric to freight—because trust is the ultimate luxury.'}
                  {title === 'Timeless Design' &&
                    'Noir pieces outlive seasons and trends, existing beyond the calendar.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Price Breakdown */}
      <section className="px-6 md:px-20 lg:px-32 py-24 space-y-12">
        <div className="will-fade space-y-6 max-w-3xl">
          <h2 className="font-semibold text-3xl md:text-4xl">
            Dissecting the Mark-up Myth
          </h2>
          <p className="leading-relaxed">
            Traditional luxury brands mark garments up 6-10× their true cost.
            Noir keeps the margin modest, investing in fabric, not inflated
            logos. Below, the anatomy of a Noir blazer:
          </p>
        </div>

        <div className="relative max-w-4xl will-fade">
          <Image
            src="/placeholder-blazer.jpg"  /* Flat-lay of a tailored black blazer with call-out lines */
            alt="Noir blazer price transparency"
            width={1200}
            height={800}
            className="rounded-lg"
          />
          {/* Example overlay (purely decorative) */}
          <div className="absolute top-4 left-4 bg-white/80 backdrop-blur px-4 py-2 text-sm rounded">
            Fabric €78  •  Craft €45  •  Logistics €9  •  You pay €210
          </div>
        </div>
      </section>

      {/* 5. Call to Action */}
      <section className="bg-neutral-900 text-white flex items-center justify-center flex-col space-y-8 py-24 will-fade">
        <h2 className="font-serif text-3xl md:text-5xl text-center">
          Wear Noir. Own the narrative.
        </h2>
        <a
          href="/collections"
          className="border border-white px-8 py-3 hover:bg-white hover:text-neutral-900 transition-all"
        >
          Explore the Collection
        </a>
      </section>
    </main>
  );
}