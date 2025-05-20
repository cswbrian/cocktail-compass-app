import { CocktailLogCard } from "@/components/cocktail-log/CocktailLogCard";
import useSWR from 'swr';
import { cocktailLogService } from '@/services/cocktail-log-service';
import { Skeleton } from "@/components/ui/skeleton";
import { CocktailLog } from "@/types/cocktail-log";
import { useEffect, useState, useCallback, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from "lucide-react";

interface CocktailLogListProps {
  type?: 'place' | 'cocktail' | 'user';
  id?: string;
  logs?: CocktailLog[];
  isLoading?: boolean;
  onLogSaved?: () => void;
  onLogDeleted?: () => void;
  onLogsChange?: (logs: CocktailLog[]) => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

function CocktailLogSkeleton() {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

function CocktailLogListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <CocktailLogSkeleton key={index} />
      ))}
    </div>
  );
}

export function CocktailLogList({ 
  type, 
  id, 
  logs: providedLogs, 
  isLoading: providedIsLoading,
  onLogSaved,
  onLogDeleted,
  onLogsChange,
  hasMore: providedHasMore,
  onLoadMore: providedOnLoadMore
}: CocktailLogListProps) {
  const [page, setPage] = useState(1);
  const [accumulatedLogs, setAccumulatedLogs] = useState<CocktailLog[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const PAGE_SIZE = 10;
  const THROTTLE_DELAY = 300;
  const lastFetchTime = useRef<number>(0);
  const isLoadingRef = useRef(false);
  const isInitialMount = useRef(true);

  const { data: fetchedData, isLoading: isFetching, mutate } = useSWR(
    type && id ? [`${type}-logs`, id, page] : null,
    async () => {
      if (type === 'place') {
        return cocktailLogService.getLogsByPlaceId(id!, page, PAGE_SIZE);
      } else if (type === 'user') {
        return cocktailLogService.getPublicLogsByUserId(id!, page, PAGE_SIZE);
      } else {
        return cocktailLogService.getLogsByCocktailId(id!, page, PAGE_SIZE);
      }
    },
    { 
      fallbackData: { logs: [], hasMore: false },
      onSuccess: (data) => {
        if (page === 1) {
          setAccumulatedLogs(data.logs);
        } else {
          setAccumulatedLogs(prev => [...prev, ...data.logs]);
        }
        setIsLoadingMore(false);
        isLoadingRef.current = false;
      },
      revalidateOnFocus: false,
      revalidateIfStale: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  const logs = providedLogs ?? accumulatedLogs;
  const isLoading = providedIsLoading ?? isFetching;
  const hasMore = providedHasMore ?? fetchedData?.hasMore;

  // Set up intersection observer for infinite scrolling
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '200px',
  });

  const loadMore = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchTime.current < THROTTLE_DELAY || isLoadingRef.current) {
      return;
    }

    if (!hasMore || isLoading) {
      return;
    }

    lastFetchTime.current = now;
    setIsLoadingMore(true);
    isLoadingRef.current = true;

    if (providedOnLoadMore) {
      await providedOnLoadMore();
    } else {
      setPage(prev => prev + 1);
    }
  }, [hasMore, isLoading, providedOnLoadMore]);

  // Load more when the last item comes into view
  useEffect(() => {
    if (inView && hasMore && !isLoading && !isLoadingMore) {
      loadMore();
    }
  }, [inView, hasMore, isLoading, isLoadingMore, loadMore]);

  // Reset state when type or id changes
  useEffect(() => {
    setPage(1);
    setAccumulatedLogs([]);
    setIsLoadingMore(false);
    isLoadingRef.current = false;
    isInitialMount.current = true;
  }, [type, id]);

  // Handle log updates
  useEffect(() => {
    if (onLogSaved || onLogDeleted) {
      const handleLogUpdate = async () => {
        // Reset to first page and fetch fresh data
        setPage(1);
        setAccumulatedLogs([]);
        await mutate();
      };

      if (onLogSaved) {
        handleLogUpdate();
      }
      if (onLogDeleted) {
        handleLogUpdate();
      }
    }
  }, [onLogSaved, onLogDeleted, mutate]);

  // Handle initial data load
  useEffect(() => {
    if (isInitialMount.current && fetchedData?.logs) {
      setAccumulatedLogs(fetchedData.logs);
      isInitialMount.current = false;
    }
  }, [fetchedData?.logs]);

  if (isLoading && (!logs || logs.length === 0)) {
    return <CocktailLogListSkeleton />;
  }

  if (!logs || logs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {logs.map((log, index) => (
        <div 
          key={log.id}
          ref={index === logs.length - 1 ? ref : undefined}
        >
          <CocktailLogCard 
            log={log} 
            onLogSaved={onLogSaved}
            onLogDeleted={onLogDeleted}
            onLogsChange={onLogsChange}
            variant={log.visibility === 'public' ? 'public' : 'private'}
          />
        </div>
      ))}
      {isLoadingMore && (
        <div className="mt-4 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
    </div>
  );
} 