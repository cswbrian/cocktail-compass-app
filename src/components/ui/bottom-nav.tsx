'use client';

import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Search, Home, User } from 'lucide-react';
import { useBottomNav } from '@/context/BottomNavContext';
import { AddVisitButton } from '@/components/visit/AddVisitButton';

export function BottomNav() {
  const { language } = useLanguage();
  const location = useLocation();
  const pathname = location.pathname;
  const t = translations[language];
  const { isBottomNavVisible } = useBottomNav();

  if (!isBottomNavVisible) {
    return null;
  }

  const navItems = [
    {
      href: `/${language}/feeds`,
      icon: Home,
    },
    {
      href: `/${language}/explorer`,
      icon: Compass,
    },
    null, // Middle position for AddVisitButton
    {
      href: `/${language}/search`,
      icon: Search,
    },
    {
      href: `/${language}/profile`,
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background z-40">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-5 h-12">
          {navItems.map(item => {
            if (item === null) {
              return (
                <div
                  key="add-log"
                  className="flex items-center justify-center"
                >
                  <AddVisitButton />
                </div>
              );
            }

            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex flex-col items-center justify-center ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-6 w-6" />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
