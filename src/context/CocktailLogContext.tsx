"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useEffect,
} from "react";
import { CocktailLog } from "@/types/cocktail-log";
import useSWR, { mutate } from "swr";
import { CACHE_KEYS, fetchers, swrConfig, defaultData } from "@/lib/swr-config";
import { useNavigate } from "react-router-dom";

interface FormState {
  isOpen: boolean;
  mode: "create" | "edit";
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
  // Pagination
  hasMore: boolean;
  loadMore: () => Promise<void>;
  page: number;
}

interface CocktailLogContextProps {
  children: ReactNode;
}

const CocktailLogContext = createContext<CocktailLogContextType | null>(null);

export function useCocktailData(): CocktailLogContextType {
  const context = useContext(CocktailLogContext);
  if (context === null) {
    throw new Error(
      "useCocktailData must be used within a CocktailDataProvider"
    );
  }
  return context;
}

export function CocktailLogDataProvider({
  children,
}: CocktailLogContextProps) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [accumulatedLogs, setAccumulatedLogs] = useState<CocktailLog[]>([]);
  const PAGE_SIZE = 10;

  // Form state
  const [formState, setFormState] = useState<FormState>({
    isOpen: false,
    mode: "create",
    selectedLog: null,
  });

  // SWR for own logs
  const {
    data: logsData,
    isLoading: isLoadingLogs,
    error: logsError,
    mutate: mutateLogs,
  } = useSWR<{ logs: CocktailLog[]; hasMore: boolean }>(
    [CACHE_KEYS.OWN_LOGS, page],
    async () => {
      const result = await fetchers.getOwnCocktailLogs(page, PAGE_SIZE);
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
        console.error("CocktailLogContext - Error fetching own logs:", err);
      },
    }
  );

  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useSWR(CACHE_KEYS.USER_STATS, fetchers.getUserStats, {
    ...swrConfig,
    fallbackData: defaultData[CACHE_KEYS.USER_STATS],
    onSuccess: () => {},
    onError: (err) => {
      console.error("CocktailLogContext - Error fetching stats:", err);
    },
  });

  const closeForm = useCallback(() => {
    setFormState({
      isOpen: false,
      mode: "create",
      selectedLog: null,
    });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (formState.isOpen) {
        closeForm();
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [formState.isOpen, closeForm]);

  const openCreateForm = useCallback(() => {
    setFormState({
      isOpen: true,
      mode: "create",
      selectedLog: null,
    });
  }, [navigate]);

  const openEditForm = useCallback((log: CocktailLog) => {
    setFormState({
      isOpen: true,
      mode: "edit",
      selectedLog: log,
    });
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingLogs) return;
    setPage((prev) => prev + 1);
  }, [hasMore, isLoadingLogs]);

  const value = {
    // Form state management
    formState,
    openCreateForm,
    openEditForm,
    closeForm,
    // Mutations
    mutate: async () => {
      setPage(1); // Reset to first page on mutation
      setAccumulatedLogs([]); // Clear accumulated logs
      await mutateLogs();
      await mutate(CACHE_KEYS.USER_STATS);
    },
    // Data
    logs: accumulatedLogs,
    stats,
    isLoading: isLoadingLogs || isLoadingStats,
    // Pagination
    hasMore,
    loadMore,
    page,
  };

  return (
    <CocktailLogContext.Provider value={value}>
      {children}
    </CocktailLogContext.Provider>
  );
}
