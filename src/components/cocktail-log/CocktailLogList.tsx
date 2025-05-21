import { CocktailLogCard } from "@/components/cocktail-log/CocktailLogCard";
import { Skeleton } from "@/components/ui/skeleton";
import { CocktailLog } from "@/types/cocktail-log";
import { useEffect, useState, useCallback, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from "lucide-react";

interface CocktailLogListProps {
  logs?: CocktailLog[];
  isLoading?: boolean;
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
  logs: providedLogs, 
  isLoading: providedIsLoading,
  hasMore: providedHasMore,
  onLoadMore: providedOnLoadMore
}: CocktailLogListProps) {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const THROTTLE_DELAY = 300;
  const lastFetchTime = useRef<number>(0);
  const isLoadingRef = useRef(false);

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

    if (!providedHasMore || providedIsLoading) {
      return;
    }

    lastFetchTime.current = now;
    setIsLoadingMore(true);
    isLoadingRef.current = true;

    if (providedOnLoadMore) {
      await providedOnLoadMore();
      setIsLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [providedHasMore, providedIsLoading, providedOnLoadMore]);

  // Load more when the last item comes into view
  useEffect(() => {
    if (inView && providedHasMore && !providedIsLoading && !isLoadingMore) {
      loadMore();
    }
  }, [inView, providedHasMore, providedIsLoading, isLoadingMore, loadMore]);

  if (providedIsLoading && (!providedLogs || providedLogs.length === 0)) {
    return <CocktailLogListSkeleton />;
  }

  if (!providedLogs || providedLogs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4" key={`log-list-${providedLogs.length}`}>
      {providedLogs.map((log, index) => (
        <div 
          key={log.id}
          ref={index === providedLogs.length - 1 ? ref : undefined}
        >
          <CocktailLogCard 
            log={log} 
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