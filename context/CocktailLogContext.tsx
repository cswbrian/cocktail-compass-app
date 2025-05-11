'use client';

import { createContext, useContext, ReactNode, useState } from 'react';
import { CocktailLog } from '@/types/cocktail-log';
import useSWR from 'swr';

export interface EnhancedStats {
  basicStats: {
    totalCocktailsDrunk: number;
    uniqueCocktails: number;
    uniqueBars: number;
  };
  drinksByMonth: Record<string, number>;
  topBarsWithMostDrinks: { name: string; count: number }[];
  recentPhotos: { url: string; type: 'image' | 'video' }[];
}

interface CocktailLogContextType {
  // Form state management
  isFormOpen: boolean;
  openForm: () => void;
  closeForm: () => void;
  selectedLog: CocktailLog | null;
  setSelectedLog: (log: CocktailLog | null) => void;
  // Mutations
  mutate: () => Promise<any>;
}

const CocktailLogContext = createContext<CocktailLogContextType | null>(null);

export function useCocktailData(): CocktailLogContextType {
  const context = useContext(CocktailLogContext);
  if (context === null) {
    throw new Error('useCocktailData must be used within a CocktailDataProvider');
  }
  return context;
}

export function CocktailLogDataProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<CocktailLog | null>(null);

  // SWR for mutations
  const { mutate: mutateLogs } = useSWR('cocktail-logs');
  const { mutate: mutateStats } = useSWR('cocktail-stats');

  const value = {
    // Form state management
    isFormOpen,
    openForm: () => setIsFormOpen(true),
    closeForm: () => {
      setIsFormOpen(false);
      setSelectedLog(null);
    },
    selectedLog,
    setSelectedLog,
    // Mutations
    mutate: async () => {
      await Promise.all([mutateLogs(), mutateStats()]);
    }
  };

  return (
    <CocktailLogContext.Provider value={value}>
      {children}
    </CocktailLogContext.Provider>
  );
} 