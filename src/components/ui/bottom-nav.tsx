'use client';

import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Compass, Search, Home, User, MapPin } from 'lucide-react';
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

  // Preserve map state when navigating back to map
  const getMapHref = () => {
    const isOnMapPage = pathname.includes('/map');
    
    // If currently on map page, preserve the current URL state
    if (isOnMapPage && location.search) {
      return `/${language}/map${location.search}`;
    }
    
    // If not on map page, try to restore from sessionStorage
    try {
      const savedMapState = sessionStorage.getItem('lastMapState');
      if (savedMapState) {
        return `/${language}/map${savedMapState}`;
      }
    } catch (error) {
      // Ignore sessionStorage errors (e.g., in private mode)
    }
    
    return `/${language}/map`;
  };

  const navItems = [
    {
      href: `/${language}/feeds`,
      icon: Home,
    },
    {
      href: `/${language}/explorer`,
      icon: Sparkles,
    },
    null, // Middle position for AddVisitButton
    {
      href: getMapHref(),
      icon: MapPin,
    },
    // {
    //   href: `/${language}/search`,
    //   icon: Search,
    // },
    {
      href: `/${language}/profile`,
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background z-40">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-5 h-12"> {/* 6 columns for AddVisitButton */}
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
            // Ensure active state ignores query string (e.g., map preserves ?lat/lng/zoom)
            const hrefPath = item.href.split('?')[0];
            const isActive = pathname.startsWith(hrefPath);

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
