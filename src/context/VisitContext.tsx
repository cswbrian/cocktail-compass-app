import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
} from 'react';
import useSWR from 'swr';
import {
  CACHE_KEYS,
  fetchers,
  swrConfig,
  defaultData,
  invalidateCache,
} from '@/lib/swr-config';

interface Visit {
  id: string;
  user: {
    id: string;
    username: string;
  };
  visitDate: Date;
  location: {
    name: string;
    place_id: string;
  } | null;
  comments: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  visibility: 'public' | 'private' | 'friends';
  logs: Array<{
    id: string;
    cocktail: {
      id: string;
      name: string;
      slug: string;
    };
    comments: string | null;
    drinkDate: Date;
    createdAt: Date;
    updatedAt: Date;
    visibility: string;
    mediaUrls: Array<{
      id: string;
      url: string;
    }>;
  }>;
}

interface VisitContextType {
  visits: Visit[] | undefined;
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  page: number;
  mutate: () => Promise<any>;
}

interface VisitContextProps {
  children: ReactNode;
}

const VisitContext = createContext<VisitContextType | null>(null);

export function useVisits(): VisitContextType {
  const context = useContext(VisitContext);
  if (context === null) {
    throw new Error('useVisits must be used within a VisitProvider');
  }
  return context;
}

export function VisitProvider({ children }: VisitContextProps) {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [accumulatedVisits, setAccumulatedVisits] = useState<Visit[]>([]);
  const PAGE_SIZE = 10;

  const {
    data,
    isLoading,
    error,
    mutate: mutateVisits,
  } = useSWR<{ visits: Visit[]; hasMore: boolean }>(
    [CACHE_KEYS.PUBLIC_VISITS, page],
    () => fetchers.getPublicVisits(page, PAGE_SIZE),
    {
      ...swrConfig,
      fallbackData: { visits: [], hasMore: true },
      onSuccess: (data) => {
        setHasMore(data.hasMore);
        if (page === 1) {
          setAccumulatedVisits(data.visits);
        } else {
          setAccumulatedVisits(prev => [...prev, ...data.visits]);
        }
      },
      onError: err => {
        console.error('VisitContext - Error fetching visits:', err);
      },
    },
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    setPage(prev => prev + 1);
  }, [hasMore, isLoading]);

  const value = {
    visits: accumulatedVisits,
    isLoading,
    hasMore,
    loadMore,
    page,
    mutate: async () => {
      setPage(1);
      setAccumulatedVisits([]);
      setHasMore(true);
      await invalidateCache.allVisits();
      await mutateVisits();
    },
  };

  return (
    <VisitContext.Provider value={value}>
      {children}
    </VisitContext.Provider>
  );
} 