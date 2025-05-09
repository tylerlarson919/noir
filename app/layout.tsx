// layout.tsx
import "@/styles/globals.css";
import { Metadata } from "next";
import clsx from "clsx";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Providers } from "./providers";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/layout/Footer";
import CartModal from "@/components/cart/CartModal";
import HeaderModal, { HeaderModalProvider } from "@/components/HeaderModal";
import "@/lib/stripeClient";
import WelcomeModules from "@/components/first-time-visitors/WelcomeModules";
import ClientLoaderWrapper from "@/components/loading-screen/ClientLoaderWrapper";
import 'framer-motion';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://noir-clothing.com'),

  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
    /* 3️⃣ Focus keywords (not a ranking factor but good for organisation tools) */
    keywords: [
      'luxury streetwear',
      'premium clothing',
      'designer hoodies',
      'monochrome fashion',
      'noir clothing brand',
      'japanese denim pants',
    ],
  
    /* 4️⃣ Robots */
    robots: { index: true, follow: true },
  
    /* 5️⃣ Canonical fallback */
    alternates: { canonical: '/' },
  
    /* 6️⃣ Open Graph  */
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: '/',
      siteName: 'NOIR Clothing',
      title: 'NOIR Clothing | Luxury Streetwear',
      description:
        'Elevate your wardrobe with premium monochrome garments by NOIR Clothing.',
      images: [
        {
          url: '/og/default.jpg', // 1200×630  <— put this in /public/og/
          width: 1200,
          height: 630,
          alt: 'NOIR Clothing — Luxury Streetwear',
        },
      ],
    },
  
    /* 7️⃣ Twitter */
    twitter: {
      card: 'summary_large_image',
      site: '@NoirClothing',
      creator: '@NoirClothing',
      title: 'NOIR Clothing | Luxury Streetwear',
      description:
        'Premium monochrome fashion crafted from the finest materials.',
      images: ['/og/default.jpg'],
    },

    icons: {
      icon: [
      {
        url: '/favicon-light.ico',
        media: '(prefers-color-scheme: light)',
        type: 'image/x-icon', 
      },
      {
        url: '/favicon-dark.ico',
        media: '(prefers-color-scheme: dark)',
        type: 'image/x-icon', 
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        {/* --- Stripe pre-connects / DNS prefetch -------------------- */}
        <link rel="dns-prefetch" href="https://js.stripe.com" />
        <link rel="preconnect"    href="https://js.stripe.com"  crossOrigin="" />
        <link rel="preconnect"    href="https://m.stripe.com"   crossOrigin="" />
        <link rel="preconnect"    href="https://api.stripe.com" crossOrigin="" />
        {/* ----------------------------------------------------------- */}
        <script
          key="ld-org"                 /* prevent “duplicate key” warnings */
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'NOIR Clothing',
              url: 'https://noir-clothing.com',
              logo: 'https://noir-clothing.com/n-logo-light.svg',
              sameAs: [
                'https://www.instagram.com/noirclothing',
                'https://twitter.com/NoirClothing',
              ],
            }),
          }}
        />
        {/* ----------------------------------------------------------- */}
      </head>
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <ClientLoaderWrapper>
        <Providers >
          <HeaderModalProvider>
            <WelcomeModules />
            <CartModal />
            <HeaderModal />
            <div className="relative flex flex-col min-h-screen">
              <Navbar />
              <main className="w-full flex-grow pt-0 relative">{children}</main>
              <Footer />
            </div>
          </HeaderModalProvider>
        </Providers>
        </ClientLoaderWrapper>
        <SpeedInsights />
      </body>
    </html>
  );
}
