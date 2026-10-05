import { Geist, Noto_Sans_Bengali, Outfit, Montserrat } from "next/font/google";
import "./globals.css";
import { AppProvider } from "./context";
import LayoutWrapper from "./LayoutWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-noto-sans-bengali",
  subsets: ["bengali"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});




const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "SLOOR | Premium Apparel & Lifestyle",
    template: "%s | SLOOR",
  },
  description: "Premium clothing e-commerce retail store. Experience the finest combed cotton fabrics, refined tailoring, and modern designs for your everyday lifestyle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${notoSansBengali.variable} ${outfit.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </AppProvider>
      </body>
    </html>
  );
}
