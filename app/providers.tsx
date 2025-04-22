"use client";

import type { ThemeProviderProps } from "next-themes";
import { AuthProvider } from "@/context/AuthContext";
import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ToastProvider } from "@heroui/toast";
import { CartProvider } from "@/context/CartContext";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      <ToastProvider placement="bottom-center" />
      <AuthProvider>
        <CartProvider>
          <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
        </CartProvider>
      </AuthProvider>
    </HeroUIProvider>
  );
}
