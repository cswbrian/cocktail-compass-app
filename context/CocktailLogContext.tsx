'use client';

import { createContext, useContext, ReactNode, useState } from 'react';
import { CocktailLog } from '@/types/cocktail-log';
import useSWR, { mutate } from 'swr';
import { CACHE_KEYS, fetchers, swrConfig, defaultData } from '@/lib/swr-config';

interface CocktailLogContextType {
  // Form state management
  isFormOpen: boolean;
  openForm: () => void;
  closeForm: () => void;
  selectedLog: CocktailLog | null;
  setSelectedLog: (log: CocktailLog | null) => void;
  // Mutations
  mutate: () => Promise<any>;
  // Data
  logs: CocktailLog[] | undefined;
  stats: any | undefined;
  isLoading: boolean;
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

  // SWR for data fetching
  const { data: logs, isLoading: isLoadingLogs } = useSWR<CocktailLog[]>(
    CACHE_KEYS.COCKTAIL_LOGS,
    fetchers.getCocktailLogs,
    {
      ...swrConfig,
      fallbackData: defaultData[CACHE_KEYS.COCKTAIL_LOGS]
    }
  );

  const { data: stats, isLoading: isLoadingStats } = useSWR(
    CACHE_KEYS.USER_STATS,
    fetchers.getUserStats,
    {
      ...swrConfig,
      fallbackData: defaultData[CACHE_KEYS.USER_STATS]
    }
  );

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
      // Optimistically update the cache
      await Promise.all([
        mutate(CACHE_KEYS.COCKTAIL_LOGS),
        mutate(CACHE_KEYS.USER_STATS)
      ]);
    },
    // Data
    logs,
    stats,
    isLoading: isLoadingLogs || isLoadingStats
  };

  return (
    <CocktailLogContext.Provider value={value}>
      {children}
    </CocktailLogContext.Provider>
  );
} 