import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/ui/header";
import { LanguageProvider } from "@/context/LanguageContext";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Menu } from "@/components/ui/menu";
import { Toaster } from "@/components/ui/sonner"
import { Inter } from 'next/font/google'
import { BottomNav } from "@/components/ui/bottom-nav";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  adjustFontFallback: true,
})

export const metadata: Metadata = {
  title: '溝酒神燈 | 新手調酒推介 | Cocktail Cult | Cocktail Finder for Beginners',
  description: '新手調酒推介！按照甜度、酸度、口感等條件，為你推介最適合的雞尾酒。',
  metadataBase: new URL('https://cocktails.monsoonclub.co'),
  openGraph: {
    title: '溝酒神燈 | 新手調酒推介 | Cocktail Cult | Cocktail finder for Beginners',
    description: '新手調酒推介！按照甜度、酸度、口感等條件，為你推介最適合的雞尾酒。',
    url: 'https://cocktails.monsoonclub.co/',
    type: 'website',
    siteName: '溝酒神燈',
    locale: 'zh_HK',
    images: [
      {
        url: '/web-app-manifest-512x512.png',
        width: 512,
        height: 512,
        alt: '溝酒神燈 Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '溝酒神燈 | 新手調酒推介 | Cocktail Cult',
    description: '新手調酒推介！按照甜度、酸度、口感等條件，為你推介最適合的雞尾酒。',
    images: ['/web-app-manifest-512x512.png'],
  },
  alternates: {
    languages: {
      'zh-HK': 'https://cocktails.monsoonclub.co/',
      'zh-TW': 'https://cocktails.monsoonclub.co/',
      'en': 'https://cocktails.monsoonclub.co/en/',
    },
    canonical: 'https://cocktails.monsoonclub.co/',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LanguageProvider>
      <html lang="zh-HK" className="dark">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
            rel="preload"
            as="style"
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').then(
                      function(registration) {
                        console.log('ServiceWorker registration successful');
                      },
                      function(err) {
                        console.log('ServiceWorker registration failed: ', err);
                      }
                    );
                  });
                }
              `,
            }}
          />
        </head>
        <GoogleAnalytics gaId="G-P79BEGY4R7" />
        <body
          className={`${inter.variable} antialiased max-w-4xl mx-auto pb-16`}
        >
          <Header />
          <Menu />
          {children}
          <BottomNav />
          <Toaster />
        </body>
      </html>
    </LanguageProvider>
  );
}
