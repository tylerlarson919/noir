import { Montserrat } from "next/font/google";
import { Fira_Code as FontMono } from "next/font/google";

// Define Montserrat font family from Google Fonts
export const fontSans = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
  variable: "--font-sans",
  display: "swap",
});

// Keep Fira Code for monospace font
export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});
