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
  invalidateCache,
} from '@/lib/swr-config';
import { useAuth } from '@/context/AuthContext';

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

interface UserVisitContextType {
  visits: Visit[] | undefined;
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  page: number;
  mutate: () => Promise<any>;
}

interface UserVisitContextProps {
  children: ReactNode;
}

const UserVisitContext = createContext<UserVisitContextType | null>(null);

export function useUserVisits(): UserVisitContextType {
  const context = useContext(UserVisitContext);
  if (context === null) {
    throw new Error('useUserVisits must be used within a UserVisitProvider');
  }
  return context;
}

export function UserVisitProvider({ children }: UserVisitContextProps) {
  const { user } = useAuth();
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
    user ? [CACHE_KEYS.USER_VISITS, user.id, page] : null,
    () => fetchers.getUserVisits(user!.id, page, PAGE_SIZE),
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
        console.error('UserVisitContext - Error fetching visits:', err);
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
      await invalidateCache.userVisits(user!.id);
      await mutateVisits();
    },
  };

  return (
    <UserVisitContext.Provider value={value}>
      {children}
    </UserVisitContext.Provider>
  );
} 