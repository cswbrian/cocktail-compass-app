'use client';

import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { CocktailLog } from '@/types/cocktail-log';
import useSWR, { mutate } from 'swr';
import { CACHE_KEYS, fetchers, swrConfig, defaultData } from '@/lib/swr-config';

interface FormState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  selectedLog: CocktailLog | null;
}

interface CocktailLogContextType {
  // Form state management
  formState: FormState;
  openCreateForm: () => void;
  openEditForm: (log: CocktailLog) => void;
  closeForm: () => void;
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
  const [formState, setFormState] = useState<FormState>({
    isOpen: false,
    mode: 'create',
    selectedLog: null,
  });

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

  const openCreateForm = useCallback(() => {
    setFormState({
      isOpen: true,
      mode: 'create',
      selectedLog: null,
    });
  }, []);

  const openEditForm = useCallback((log: CocktailLog) => {
    setFormState({
      isOpen: true,
      mode: 'edit',
      selectedLog: log,
    });
  }, []);

  const closeForm = useCallback(() => {
    setFormState({
      isOpen: false,
      mode: 'create',
      selectedLog: null,
    });
  }, []);

  const value = {
    // Form state management
    formState,
    openCreateForm,
    openEditForm,
    closeForm,
    // Mutations
    mutate: async () => {
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