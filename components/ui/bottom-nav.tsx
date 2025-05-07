"use client";

import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Search, Bookmark, BookHeart } from "lucide-react";
import { useBottomNav } from "@/context/BottomNavContext";

export function BottomNav() {
  const { language } = useLanguage();
  const pathname = usePathname();
  const t = translations[language];
  const { isBottomNavVisible } = useBottomNav();

  if (!isBottomNavVisible) {
    return null;
  }

  const navItems = [
    {
      href: `/${language}/explorer`,
      icon: Compass,
      label: t.bottomNavExplorer,
    },
    {
      href: `/${language}/journal`,
      icon: BookHeart,
      label: t.bottomNavJournal,
    },
    {
      href: `/${language}/search`,
      icon: Search,
      label: t.bottomNavSearch,
    },
    {
      href: `/${language}/bookmarks`,
      icon: Bookmark,
      label: t.bottomNavBookmarks,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = 
              pathname === item.href || 
              (item.href.endsWith('/explorer') && pathname === `/${language}`);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
} 