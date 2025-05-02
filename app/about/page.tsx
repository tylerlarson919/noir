// app/about/page.tsx
'use client';

import { useEffect } from 'react';
import Image from 'next/image';

export default function AboutPage() {
  useEffect(() => {
    const els = document.querySelectorAll(
      '.fade-in-section, .fade-in-section-up, .fade-in-section-left, .fade-in-right, .fade-in-image'
    );
    const obs = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(({ isIntersecting, target }) => {
          if (isIntersecting) {
            target.classList.add('is-visible');
            observer.unobserve(target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <main className="overflow-x-hidden">
        {/* 1. Hero */}
        <section className="relative flex flex-col items-center justify-center min-h-[80vh] px-6 pb-20 fade-in-section-up">
          <Image
            src="/noir-studio.jpg"
            alt="Noir visionary studio"
            fill
            priority
            className="object-cover object-center -z-10 fade-in-image"
          />
          <div className="max-w-4xl text-center space-y-6 fade-in-section">
            <h1 className="font-medium text-5xl md:text-7xl tracking-tight">Noir</h1>
            <p className="md:text-xl tracking-wide">True luxury, honestly priced.</p>
          </div>
        </section>

        {/* 2. Origin Story */}
        <section className="px-6 md:px-20 lg:px-32 py-24 space-y-10 fade-in-section">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 fade-in-section-left">
              <h2 className="font-semibold text-3xl md:text-4xl">Our Beginning</h2>
              <p className="leading-relaxed">
                Noir emerged in 2025 from a visionary studio in Virginia, challenging the
                conventions of luxury fashion. In a world where technology and sustainability
                intersect, our founder sought to create a brand that honors craftsmanship
                while embracing innovation.
              </p>
              <p className="leading-relaxed">
                Nestled in the serene landscape of Virginia, far from the traditional fashion
                epicenters, Noir represents a bold departure from the past. Here, artisans
                trained in centuries-old techniques work alongside material scientists and
                digital innovators to craft garments that are both timeless and ahead of their time.
              </p>
            </div>
            <div className="fade-in-right">
              <Image
                src="/virginia-studio.jpg"
                alt="Noir studio in Virginia"
                width={800}
                height={600}
                className="rounded-lg fade-in-image"
              />
            </div>
          </div>
        </section>

        {/* 3. The Philosophy */}
        <section className="bg-neutral-100 dark:bg-noirdark1 px-6 md:px-20 lg:px-32 py-24 fade-in-section-up">
          <div className="max-w-4xl mx-auto space-y-16">
            <div className="space-y-6 text-center fade-in-section">
              <h2 className="font-semibold text-3xl md:text-4xl">The Noir Philosophy</h2>
              <p className="leading-relaxed md:text-lg">
                At Noir, transparency is not just a promise—it’s a practice. Through blockchain
                technology, we offer an unprecedented look into our supply chain. Every garment
                comes with a digital passport, detailing its journey from sustainably sourced
                materials to the skilled hands that brought it to life.
              </p>
              <p className="leading-relaxed md:text-lg">
                Our design philosophy is simple yet profound: minimalism with a futuristic soul.
                Noir pieces are designed to transcend fleeting trends, becoming staples in your
                wardrobe for years to come. Each collection is a testament to the belief that
                true luxury lies in quality, not excess.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-12">
              {[
                ['Transparency', '/blockchain.jpg'],
                ['Minimalism', '/futuristic-garment.jpg'],
                ['Value', '/cost-breakdown.jpg']
              ].map(([title, src]) => (
                <div key={title} className="space-y-4 fade-in-section">
                  <Image
                    src={src}
                    alt={title}
                    width={600}
                    height={400}
                    className="rounded-md fade-in-image"
                  />
                  <h3 className="font-medium text-xl">{title}</h3>
                  <p className="text-sm leading-relaxed">
                    {title === 'Transparency'
                      ? 'Through blockchain, we offer an unprecedented look into our supply chain.'
                      : title === 'Minimalism'
                      ? 'Our design philosophy: minimalism with a futuristic soul.'
                      : 'We reject exorbitant markups, making luxury accessible.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Price Breakdown */}
        <section className="px-6 md:px-20 lg:px-32 py-24 space-y-12 fade-in-section">
          <div className="space-y-6 max-w-3xl fade-in-section-left">
            <h2 className="font-semibold text-3xl md:text-4xl">Redefining Value</h2>
            <p className="leading-relaxed">
              We reject the industry’s tradition of exorbitant markups. By leveraging
              direct-to-consumer models and efficient production methods, we make luxury
              accessible without sacrificing excellence. Consider the anatomy of a Noir jacket:
            </p>
          </div>
          <div className="relative max-w-4xl fade-in-right">
            <Image
              src="/noir-jacket.jpg"
              alt="Noir jacket price transparency"
              width={1200}
              height={800}
              className="rounded-lg fade-in-image"
            />
            <div className="absolute top-4 left-4 bg-black/20 dark:bg-white/20 backdrop-blur px-4 py-2 text-sm rounded fade-in-section-up">
              <ul className="list-disc pl-4">
                <li>Fabric: €90 (eco-friendly, high‑performance textiles)</li>
                <li>Craft: €50 (artisanal expertise meets digital precision)</li>
                <li>Technology: €15 (blockchain traceability and virtual try‑on)</li>
                <li>Logistics: €10 (sustainable packaging & carbon‑neutral shipping)</li>
                <li>Your investment: €220</li>
              </ul>
            </div>
          </div>
          <div className="space-y-6 max-w-3xl fade-in-section">
            <p className="leading-relaxed">
              Noir is more than a brand; it’s a movement towards a more honest, innovative,
              and sustainable future in fashion.
            </p>
            <p className="leading-relaxed italic">
              Embrace the new luxury. Discover Noir.
            </p>
          </div>
        </section>

        {/* 5. Call to Action */}
        <section className="bg-neutral-900 text-white flex items-center justify-center flex-col space-y-8 py-24 fade-in-section-up">
          <h2 className="font-serif text-3xl md:text-5xl text-center fade-in-section">
            Wear Noir. Own the narrative.
          </h2>
          <a
            href="/collections"
            className="border border-white px-8 py-3 hover:bg-white hover:text-neutral-900 transition-all fade-in-section"
          >
            Explore the Collection
          </a>
        </section>
      </main>
    </>
  );
}
