import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/ui/header";
import { LanguageProvider } from "@/context/LanguageContext";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Menu } from "@/components/ui/menu";
import { Toaster } from "@/components/ui/sonner"
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: '溝酒神燈 | 新手調酒推介 | Cocktail Cult | Cocktail Finder for Beginners',
  description: '新手調酒推介！按照甜度、酸度、口感等條件，為你推介最適合的雞尾酒。',
  openGraph: {
    title: '溝酒神燈 | 新手調酒推介 | Cocktail Cult | Cocktail finder for Beginners',
    description: '新手調酒推介！按照甜度、酸度、口感等條件，為你推介最適合的雞尾酒。',
    url: 'https://cocktails.monsoonclub.co/',
    type: 'website'
  },
  alternates: {
    languages: {
      'zh-HK': 'https://cocktails.monsoonclub.co/',
      'zh-TW': 'https://cocktails.monsoonclub.co/',
      'en': 'https://cocktails.monsoonclub.co/en/',
    }
  }
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
        </head>
        <GoogleAnalytics gaId="G-P79BEGY4R7" />
        <body
          className={`${inter.variable} antialiased max-w-4xl mx-auto`}
        >
          <Header />
          <Menu />
          {children}
          <Toaster />
        </body>
      </html>
    </LanguageProvider>
  );
}
