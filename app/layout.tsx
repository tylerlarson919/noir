import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Providers } from "./providers";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/layout/Footer";
import CartModal from "@/components/cart/CartModal";
import HeaderModal, { HeaderModalProvider } from "@/components/HeaderModal";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <HeaderModalProvider>
            <CartModal />
            <HeaderModal />
            <div className="relative flex flex-col min-h-screen">
              <Navbar />
              <main className="w-full flex-grow pt-0 relative">{children}</main>
              <Footer />
            </div>
          </HeaderModalProvider>
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
