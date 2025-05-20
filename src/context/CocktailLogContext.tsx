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
  publicLogs: CocktailLog[] | undefined;
  stats: any | undefined;
  isLoading: boolean;
  isLoadingPublic: boolean;
  // Pagination
  hasMore: boolean;
  hasMorePublic: boolean;
  loadMore: () => Promise<void>;
  loadMorePublic: () => Promise<void>;
  page: number;
  publicPage: number;
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
  const [publicPage, setPublicPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [hasMorePublic, setHasMorePublic] = useState(true);
  const [accumulatedLogs, setAccumulatedLogs] = useState<CocktailLog[]>([]);
  const [accumulatedPublicLogs, setAccumulatedPublicLogs] = useState<CocktailLog[]>([]);
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

  // SWR for public logs
  const {
    data: publicLogsData,
    isLoading: isLoadingPublicLogs,
    error: publicLogsError,
    mutate: mutatePublicLogs,
  } = useSWR<{ logs: CocktailLog[]; hasMore: boolean }>(
    [CACHE_KEYS.PUBLIC_LOGS, publicPage],
    async () => {
      const result = await fetchers.getPublicCocktailLogs(publicPage, PAGE_SIZE);
      return result;
    },
    {
      ...swrConfig,
      fallbackData: { logs: [], hasMore: true },
      onSuccess: (data) => {
        setHasMorePublic(data.hasMore);
        if (publicPage === 1) {
          setAccumulatedPublicLogs(data.logs);
        } else {
          setAccumulatedPublicLogs((prev) => [...prev, ...data.logs]);
        }
      },
      onError: (err) => {
        console.error("CocktailLogContext - Error fetching public logs:", err);
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

  // Debug effect to track state changes
  useEffect(() => {}, [
    accumulatedLogs,
    isLoadingLogs,
    logsError,
    stats,
    isLoadingStats,
    statsError,
    page,
    hasMore,
  ]);

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

  const loadMorePublic = useCallback(async () => {
    if (!hasMorePublic || isLoadingPublicLogs) return;
    setPublicPage((prev) => prev + 1);
  }, [hasMorePublic, isLoadingPublicLogs]);

  const value = {
    // Form state management
    formState,
    openCreateForm,
    openEditForm,
    closeForm,
    // Mutations
    mutate: async () => {
      setPage(1); // Reset to first page on mutation
      setPublicPage(1); // Reset public page on mutation
      setAccumulatedLogs([]); // Clear accumulated logs
      setAccumulatedPublicLogs([]); // Clear accumulated public logs
      await mutateLogs();
      await mutatePublicLogs();
      await mutate(CACHE_KEYS.USER_STATS);
    },
    // Data
    logs: accumulatedLogs,
    publicLogs: accumulatedPublicLogs,
    stats,
    isLoading: isLoadingLogs || isLoadingStats,
    isLoadingPublic: isLoadingPublicLogs,
    // Pagination
    hasMore,
    hasMorePublic,
    loadMore,
    loadMorePublic,
    page,
    publicPage,
  };

  return (
    <CocktailLogContext.Provider value={value}>
      {children}
    </CocktailLogContext.Provider>
  );
}
