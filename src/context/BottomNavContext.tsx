"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

interface BottomNavContextType {
  isBottomNavVisible: boolean;
}

// Define patterns for routes that should hide the bottom nav
const HIDE_BOTTOM_NAV_PATTERNS = [
  // Express route pattern
  /^\/[a-z]{2}\/express$/,
  // Add more patterns here as needed
];

function shouldHideBottomNav(pathname: string): boolean {
  if (!pathname) return false;
  
  return HIDE_BOTTOM_NAV_PATTERNS.some(pattern => pattern.test(pathname));
}

const BottomNavContext = createContext<BottomNavContextType>({
  isBottomNavVisible: true,
});

export function BottomNavProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const pathname = location.pathname;
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);

  useEffect(() => {
    if (!pathname) return;
    setIsBottomNavVisible(!shouldHideBottomNav(pathname));
  }, [pathname]);

  return (
    <BottomNavContext.Provider value={{ isBottomNavVisible }}>
      {children}
    </BottomNavContext.Provider>
  );
}

export function useBottomNav() {
  return useContext(BottomNavContext);
} 