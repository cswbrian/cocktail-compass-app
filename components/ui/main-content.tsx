"use client";

import { useBottomNav } from "@/context/BottomNavContext";

interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  const { isBottomNavVisible } = useBottomNav();

  return (
    <div className={`h-full overflow-auto ${isBottomNavVisible ? 'pb-16' : ''}`}>
      {children}
    </div>
  );
} 