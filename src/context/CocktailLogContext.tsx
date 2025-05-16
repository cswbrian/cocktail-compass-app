'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { CocktailLog } from '@/types/cocktail-log';
import useSWR, { mutate } from 'swr';
import { CACHE_KEYS, fetchers, swrConfig, defaultData } from '@/lib/swr-config';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  // Form state
  const [formState, setFormState] = useState<FormState>({
    isOpen: false,
    mode: 'create',
    selectedLog: null,
  });

  // SWR for data fetching
  const { data: logs, isLoading: isLoadingLogs, error: logsError } = useSWR<CocktailLog[]>(
    CACHE_KEYS.COCKTAIL_LOGS,
    fetchers.getCocktailLogs,
    {
      ...swrConfig,
      fallbackData: defaultData[CACHE_KEYS.COCKTAIL_LOGS],
      onSuccess: (data) => {
        console.log('CocktailLogContext - Logs fetched successfully:', data);
      },
      onError: (err) => {
        console.error('CocktailLogContext - Error fetching logs:', err);
      }
    }
  );

  const { data: stats, isLoading: isLoadingStats, error: statsError } = useSWR(
    CACHE_KEYS.USER_STATS,
    fetchers.getUserStats,
    {
      ...swrConfig,
      fallbackData: defaultData[CACHE_KEYS.USER_STATS],
      onSuccess: (data) => {
        console.log('CocktailLogContext - Stats fetched successfully:', data);
      },
      onError: (err) => {
        console.error('CocktailLogContext - Error fetching stats:', err);
      }
    }
  );

  // Debug effect to track state changes
  useEffect(() => {
    console.log('CocktailLogContext - State update:', {
      logs,
      isLoadingLogs,
      logsError,
      stats,
      isLoadingStats,
      statsError
    });
  }, [logs, isLoadingLogs, logsError, stats, isLoadingStats, statsError]);

  const openCreateForm = useCallback(() => {
    setFormState({
      isOpen: true,
      mode: 'create',
      selectedLog: null,
    });
    navigate('/logs/new');
  }, [navigate]);

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
      console.log('CocktailLogContext - Starting mutation');
      // First mutate the logs
      await mutate(CACHE_KEYS.COCKTAIL_LOGS, async (currentLogs: CocktailLog[] | undefined) => {
        console.log('CocktailLogContext - Mutating logs, current:', currentLogs);
        if (!currentLogs) return currentLogs;
        
        // Fetch fresh logs to get updated media URLs
        const freshLogs = await fetchers.getCocktailLogs();
        console.log('CocktailLogContext - Fresh logs fetched:', freshLogs);
        return freshLogs;
      }, {
        revalidate: true,
        rollbackOnError: true
      });

      // Then mutate stats
      await mutate(CACHE_KEYS.USER_STATS);
      console.log('CocktailLogContext - Mutation completed');
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