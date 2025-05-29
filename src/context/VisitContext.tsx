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
import { Visit as VisitType } from '@/types/visit';

interface ServiceVisit {
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
  visibility: 'public' | 'private';
  logs: Array<{
    id: string;
    cocktail: {
      id: string;
      name: {
        en: string;
        zh: string | null;
      };
      slug: string;
    };
    comments: string | null;
    drinkDate: Date;
    createdAt: Date;
    updatedAt: Date;
    visibility: string;
    media: Array<{
      id: string;
      url: string;
    }>;
  }>;
}

interface VisitContextType {
  // User's personal visits
  userVisits: VisitType[] | undefined;
  userVisitsLoading: boolean;
  userHasMore: boolean;
  loadMoreUserVisits: () => Promise<void>;

  // Public/recommended visits
  publicVisits: VisitType[] | undefined;
  publicVisitsLoading: boolean;
  publicHasMore: boolean;
  loadMorePublicVisits: () => Promise<void>;

  // Common functionality
  mutate: (type: 'user' | 'public') => Promise<any>;
}

interface VisitContextProps {
  children: ReactNode;
}

const VisitContext = createContext<VisitContextType | null>(
  null,
);

export function useVisits(): VisitContextType {
  const context = useContext(VisitContext);
  if (context === null) {
    throw new Error(
      'useVisits must be used within a VisitProvider',
    );
  }
  return context;
}

function convertServiceVisitToVisitType(
  visit: ServiceVisit,
): VisitType {
  return {
    ...visit,
    logs: visit.logs.map(log => ({
      ...log,
      cocktail: {
        ...log.cocktail,
        name: {
          en: log.cocktail.name,
          zh: log.cocktail.name,
        },
      },
      media: log.media,
    })),
  };
}

export function VisitProvider({
  children,
}: VisitContextProps) {
  const { user } = useAuth();
  const PAGE_SIZE = 10;

  // User visits state
  const [userPage, setUserPage] = useState(1);
  const [userHasMore, setUserHasMore] = useState(true);
  const [accumulatedUserVisits, setAccumulatedUserVisits] =
    useState<VisitType[]>([]);

  // Public visits state
  const [publicPage, setPublicPage] = useState(1);
  const [publicHasMore, setPublicHasMore] = useState(true);
  const [
    accumulatedPublicVisits,
    setAccumulatedPublicVisits,
  ] = useState<VisitType[]>([]);

  // User visits SWR
  const {
    data: userData,
    isLoading: userVisitsLoading,
    mutate: mutateUserVisits,
  } = useSWR<{ visits: ServiceVisit[]; hasMore: boolean }>(
    user
      ? [CACHE_KEYS.USER_VISITS, user.id, userPage]
      : null,
    () =>
      fetchers.getUserVisits(user!.id, userPage, PAGE_SIZE),
    {
      ...swrConfig,
      fallbackData: { visits: [], hasMore: true },
      onSuccess: data => {
        setUserHasMore(data.hasMore);
        const convertedVisits = data.visits;
        if (userPage === 1) {
          setAccumulatedUserVisits(convertedVisits);
        } else {
          setAccumulatedUserVisits(prev => [
            ...prev,
            ...convertedVisits,
          ]);
        }
      },
      onError: err => {
        console.error(
          'VisitContext - Error fetching user visits:',
          err,
        );
      },
    },
  );

  // Public visits SWR
  const {
    data: publicData,
    isLoading: publicVisitsLoading,
    mutate: mutatePublicVisits,
  } = useSWR<{ visits: ServiceVisit[]; hasMore: boolean }>(
    [CACHE_KEYS.PUBLIC_VISITS, publicPage],
    () => fetchers.getPublicVisits(publicPage, PAGE_SIZE),
    {
      ...swrConfig,
      fallbackData: { visits: [], hasMore: true },
      onSuccess: data => {
        setPublicHasMore(data.hasMore);
        const convertedVisits = data.visits
        if (publicPage === 1) {
          setAccumulatedPublicVisits(convertedVisits);
        } else {
          setAccumulatedPublicVisits(prev => [
            ...prev,
            ...convertedVisits,
          ]);
        }
      },
      onError: err => {
        console.error(
          'VisitContext - Error fetching public visits:',
          err,
        );
      },
    },
  );

  // Load more handlers
  const loadMoreUserVisits = useCallback(async () => {
    if (!userHasMore || userVisitsLoading) return;
    setUserPage(prev => prev + 1);
  }, [userHasMore, userVisitsLoading]);

  const loadMorePublicVisits = useCallback(async () => {
    if (!publicHasMore || publicVisitsLoading) return;
    setPublicPage(prev => prev + 1);
  }, [publicHasMore, publicVisitsLoading]);

  // Mutate handler
  const mutate = useCallback(
    async (type: 'user' | 'public') => {
      if (type === 'user' && user) {
        setUserPage(1);
        setAccumulatedUserVisits([]);
        setUserHasMore(true);
        await invalidateCache.userVisits(user.id);
        await mutateUserVisits();
      } else if (type === 'public') {
        setPublicPage(1);
        setAccumulatedPublicVisits([]);
        setPublicHasMore(true);
        await invalidateCache.allVisits();
        await mutatePublicVisits();
      }
    },
    [user, mutateUserVisits, mutatePublicVisits],
  );

  const value = {
    userVisits: accumulatedUserVisits,
    userVisitsLoading,
    userHasMore,
    loadMoreUserVisits,
    publicVisits: accumulatedPublicVisits,
    publicVisitsLoading,
    publicHasMore,
    loadMorePublicVisits,
    mutate,
  };

  return (
    <VisitContext.Provider value={value}>
      {children}
    </VisitContext.Provider>
  );
}
