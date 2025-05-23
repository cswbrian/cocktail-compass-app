'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { CocktailLog } from '@/types/cocktail-log';
import useSWR from 'swr';
import {
  CACHE_KEYS,
  fetchers,
  swrConfig,
  defaultData,
  invalidateCache,
} from '@/lib/swr-config';
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
  // Data
  logs: CocktailLog[] | undefined;
  stats: any | undefined;
  isLoading: boolean;
  // Pagination
  hasMore: boolean;
  loadMore: () => Promise<void>;
  page: number;
  // Mutations
  mutate: () => Promise<any>;
  // Log type
  logType: 'public' | 'private';
  setLogType: (type: 'public' | 'private') => void;
}

interface CocktailLogContextProps {
  children: ReactNode;
}

const CocktailLogContext =
  createContext<CocktailLogContextType | null>(null);

export function useCocktailLogs(): CocktailLogContextType {
  const context = useContext(CocktailLogContext);
  if (context === null) {
    throw new Error(
      'useCocktailLogs must be used within a CocktailLogProvider',
    );
  }
  return context;
}

export function CocktailLogProvider({
  children,
}: CocktailLogContextProps) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [accumulatedLogs, setAccumulatedLogs] = useState<
    CocktailLog[]
  >([]);
  const [logType, setLogType] = useState<
    'public' | 'private'
  >('public');
  const PAGE_SIZE = 10;

  // Form state
  const [formState, setFormState] = useState<FormState>({
    isOpen: false,
    mode: 'create',
    selectedLog: null,
  });

  // SWR for logs based on type
  const {
    data: logsData,
    isLoading: isLoadingLogs,
    error: logsError,
    mutate: mutateLogs,
  } = useSWR<{ logs: CocktailLog[]; hasMore: boolean }>(
    [
      logType === 'public'
        ? CACHE_KEYS.PUBLIC_LOGS
        : CACHE_KEYS.OWN_LOGS,
      page,
    ],
    async () => {
      const result =
        logType === 'public'
          ? await fetchers.getPublicCocktailLogs(
              page,
              PAGE_SIZE,
            )
          : await fetchers.getOwnCocktailLogs(
              page,
              PAGE_SIZE,
            );
      return result;
    },
    {
      ...swrConfig,
      fallbackData: { logs: [], hasMore: true },
      onSuccess: data => {
        setHasMore(data.hasMore);
        if (page === 1) {
          setAccumulatedLogs(data.logs);
        } else {
          setAccumulatedLogs(prev => [
            ...prev,
            ...data.logs,
          ]);
        }
      },
      onError: err => {
        console.error(
          'CocktailLogContext - Error fetching logs:',
          err,
        );
      },
    },
  );

  // Reset pagination when log type changes
  const handleLogTypeChange = useCallback((type: 'public' | 'private') => {
    // First update the log type
    setLogType(type);
    // Then reset all pagination state
    setPage(1);
    setAccumulatedLogs([]);
    setHasMore(true);
    // Finally invalidate the cache and revalidate
    invalidateCache.allLogs().then(() => {
      mutateLogs();
    });
  }, [mutateLogs]);

  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useSWR(CACHE_KEYS.USER_STATS, fetchers.getUserStats, {
    ...swrConfig,
    fallbackData: defaultData[CACHE_KEYS.USER_STATS],
    onSuccess: () => {},
    onError: err => {
      console.error(
        'CocktailLogContext - Error fetching stats:',
        err,
      );
    },
  });

  const closeForm = useCallback(() => {
    setFormState({
      isOpen: false,
      mode: 'create',
      selectedLog: null,
    });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (formState.isOpen) {
        closeForm();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener(
        'popstate',
        handlePopState,
      );
    };
  }, [formState.isOpen, closeForm]);

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

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingLogs) return;
    setPage(prev => prev + 1);
  }, [hasMore, isLoadingLogs]);

  const value = {
    // Form state management
    formState,
    openCreateForm,
    openEditForm,
    closeForm,
    // Data
    logs: accumulatedLogs,
    stats,
    isLoading: isLoadingLogs || isLoadingStats,
    // Pagination
    hasMore,
    loadMore,
    page,
    // Mutations
    mutate: async () => {
      setPage(1); // Reset to first page on mutation
      setAccumulatedLogs([]); // Clear accumulated logs
      setHasMore(true); // Reset hasMore state
      await invalidateCache.allLogs();
      // Force a revalidation
      await mutateLogs();
    },
    // Log type
    logType,
    setLogType: handleLogTypeChange,
  };

  return (
    <CocktailLogContext.Provider value={value}>
      {children}
    </CocktailLogContext.Provider>
  );
}
