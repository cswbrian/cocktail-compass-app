'use client';

import { useBottomNav } from '@/context/BottomNavContext';
import { useLocation } from 'react-router-dom';

interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({
  children,
}: MainContentProps) {
  const { isBottomNavVisible } = useBottomNav();
  const location = useLocation();
  
  // Check if we're on the map page (which has transparent header)
  const isMapPage = location.pathname.includes('/map');
  
  return (
    <div
      className={`h-full overflow-auto ${
        isBottomNavVisible ? 'pb-16' : ''
      } ${
        !isMapPage ? 'pt-16' : '' // Add top padding for non-map pages
      }`}
    >
      {children}
    </div>
  );
}
