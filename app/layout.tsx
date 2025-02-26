import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/ui/header";
import { LanguageProvider } from "@/context/LanguageContext";
import { GoogleAnalytics } from "@next/third-parties/google";
import { translations } from "@/translations";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${translations.zh.appName} | ${translations.en.appName}`,
  description: "Find the perfect cocktail for you",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <LanguageProvider>
      <html lang="zh" className="dark">
        <GoogleAnalytics gaId="G-P79BEGY4R7" />
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased max-w-4xl mx-auto`}
        >
          <Header />
          {children}
        </body>
      </html>
    </LanguageProvider>
  );
}
