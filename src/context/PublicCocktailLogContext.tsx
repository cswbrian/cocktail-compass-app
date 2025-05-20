"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
} from "react";
import { CocktailLog } from "@/types/cocktail-log";
import useSWR from "swr";
import { CACHE_KEYS, fetchers, swrConfig, invalidateCache } from "@/lib/swr-config";

interface PublicCocktailLogContextType {
  // Data
  logs: CocktailLog[] | undefined;
  isLoading: boolean;
  // Pagination
  hasMore: boolean;
  loadMore: () => Promise<void>;
  page: number;
  // Mutations
  mutate: () => Promise<any>;
}

interface PublicCocktailLogContextProps {
  children: ReactNode;
}

const PublicCocktailLogContext = createContext<PublicCocktailLogContextType | null>(null);

export function usePublicCocktailLogs(): PublicCocktailLogContextType {
  const context = useContext(PublicCocktailLogContext);
  if (context === null) {
    throw new Error(
      "usePublicCocktailLogs must be used within a PublicCocktailLogProvider"
    );
  }
  return context;
}

export function PublicCocktailLogProvider({
  children,
}: PublicCocktailLogContextProps) {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [accumulatedLogs, setAccumulatedLogs] = useState<CocktailLog[]>([]);
  const PAGE_SIZE = 10;

  // SWR for public logs
  const {
    data: logsData,
    isLoading: isLoadingLogs,
    error: logsError,
    mutate: mutateLogs,
  } = useSWR<{ logs: CocktailLog[]; hasMore: boolean }>(
    [CACHE_KEYS.PUBLIC_LOGS, page],
    async () => {
      const result = await fetchers.getPublicCocktailLogs(page, PAGE_SIZE);
      return result;
    },
    {
      ...swrConfig,
      fallbackData: { logs: [], hasMore: true },
      onSuccess: (data) => {
        setHasMore(data.hasMore);
        if (page === 1) {
          setAccumulatedLogs(data.logs);
        } else {
          setAccumulatedLogs((prev) => [...prev, ...data.logs]);
        }
      },
      onError: (err) => {
        console.error("PublicCocktailLogContext - Error fetching public logs:", err);
      },
    }
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingLogs) return;
    setPage((prev) => prev + 1);
  }, [hasMore, isLoadingLogs]);

  const value = {
    // Data
    logs: accumulatedLogs,
    isLoading: isLoadingLogs,
    // Pagination
    hasMore,
    loadMore,
    page,
    // Mutations
    mutate: async () => {
      setPage(1); // Reset to first page on mutation
      setAccumulatedLogs([]); // Clear accumulated logs
      await invalidateCache.publicLogs();
    },
  };

  return (
    <PublicCocktailLogContext.Provider value={value}>
      {children}
    </PublicCocktailLogContext.Provider>
  );
} 