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

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
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
