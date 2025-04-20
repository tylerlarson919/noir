import localFont from 'next/font/local';
import { Fira_Code as FontMono } from "next/font/google";

// Define the Futura font family using local font files
export const fontSans = localFont({
  src: [
    {
      path: '../public/fonts/futura/futura medium bt.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/futura/Futura Medium Italic font.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../public/fonts/futura/Futura Bold font.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/futura/Futura Bold Italic font.ttf',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../public/fonts/futura/Futura Light font.ttf',
      weight: '300',
      style: 'normal',
    },
  ],
  variable: '--font-sans',
  display: 'swap',
});

// Keep Fira Code for monospace font
export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});