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

export async function generateMetadata(): Promise<Metadata> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://admin.sloor.bd/api/';
  const cleanUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

  let googleVerification: string | undefined;
  const otherVerification: Record<string, string | string[]> = {};
  let siteTitle = "SLOOR | Premium Apparel & Lifestyle";
  const siteDescription =
    "Premium clothing e-commerce retail store. Experience the finest combed cotton fabrics, refined tailoring, and modern designs for your everyday lifestyle.";
  let ogImageUrl = "https://sloor.bd/favicon.png";

  try {
    const res = await fetch(`${cleanUrl}/system-config`, { cache: 'force-cache' });
    if (res.ok) {
      const json = await res.json();
      const cfg = json.data;
      if (cfg?.title) siteTitle = `${cfg.title}`;
      if (cfg?.logo) {
        const imageBasePath = process.env.NEXT_PUBLIC_IMAGE_BASE_PATH || 'https://admin.sloor.bd/';
        const cleanImgBase = imageBasePath.endsWith('/') ? imageBasePath.slice(0, -1) : imageBasePath;
        ogImageUrl = cfg.logo.startsWith('http') ? cfg.logo : `${cleanImgBase}${cfg.logo.startsWith('/') ? '' : '/'}${cfg.logo}`;
      }

      const marketing = cfg?.marketing;
      const headScripts: string = marketing?.custom_head_scripts || '';

      // Match <meta name="..." content="..." />
      const metaRegex = /<meta\s+[^>]*name=["']([^"']+)["'][^>]*content=["']([^"']+)["'][^>]*>/gi;
      let match;
      while ((match = metaRegex.exec(headScripts)) !== null) {
        const name = match[1];
        const content = match[2];
        if (name === 'google-site-verification') {
          googleVerification = content;
        } else {
          otherVerification[name] = content;
        }
      }

      // Match <meta content="..." name="..." />
      const revRegex = /<meta\s+[^>]*content=["']([^"']+)["'][^>]*name=["']([^"']+)["'][^>]*>/gi;
      while ((match = revRegex.exec(headScripts)) !== null) {
        const content = match[1];
        const name = match[2];
        if (name === 'google-site-verification') {
          googleVerification = content;
        } else {
          otherVerification[name] = content;
        }
      }
    }
  } catch (err) {
    console.error('generateMetadata error:', err);
  }

  // Fallbacks ensuring verification is never missed
  if (!googleVerification) {
    googleVerification = 'aVyMjncS6n0kqIkOeIHNe84BK7P2up5MLWBXtm9ffOI';
  }
  if (!otherVerification['facebook-domain-verification']) {
    otherVerification['facebook-domain-verification'] = 'f8hhxcxjlusayza5jru1a9tyjebnu6';
  }

  return {
    title: {
      default: siteTitle,
      template: "%s | SLOOR",
    },
    description: siteDescription,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: siteTitle,
      description: siteDescription,
      url: 'https://sloor.bd',
      siteName: 'SLOOR BD - Luxury Fashion & Shoes',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: siteTitle,
        },
      ],
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: siteTitle,
      description: siteDescription,
      images: [ogImageUrl],
    },
    icons: {
      icon: [
        { url: '/favicon.ico?v=2', sizes: 'any' },
        { url: '/favicon.png?v=2', type: 'image/png' },
      ],
      shortcut: '/favicon.ico?v=2',
      apple: '/favicon.png?v=2',
    },
    verification: {
      google: googleVerification,
      other: otherVerification,
    },
  };
}

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
