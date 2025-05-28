import { Skeleton } from '@/components/ui/skeleton';
import { Visit } from '@/types/visit';
import {
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { VisitCard } from './VisitCard';

interface VisitListProps {
  visits?: Visit[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  feedType?: 'recommend' | 'my';
}

function VisitSkeleton() {
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

function VisitListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <VisitSkeleton key={index} />
      ))}
    </div>
  );
}

export function VisitList({
  visits: providedVisits,
  isLoading: providedIsLoading,
  hasMore: providedHasMore,
  onLoadMore: providedOnLoadMore,
  feedType = 'recommend',
}: VisitListProps) {
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
    if (
      now - lastFetchTime.current < THROTTLE_DELAY ||
      isLoadingRef.current
    ) {
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
  }, [
    providedHasMore,
    providedIsLoading,
    providedOnLoadMore,
  ]);

  // Load more when the last item comes into view
  useEffect(() => {
    if (
      inView &&
      providedHasMore &&
      !providedIsLoading &&
      !isLoadingMore
    ) {
      loadMore();
    }
  }, [
    inView,
    providedHasMore,
    providedIsLoading,
    isLoadingMore,
    loadMore,
  ]);

  if (
    providedIsLoading &&
    (!providedVisits || providedVisits.length === 0)
  ) {
    return <VisitListSkeleton />;
  }

  if (!providedVisits || providedVisits.length === 0) {
    return null;
  }

  return (
    <div
      className="space-y-4"
      key={`visit-list-${providedVisits.length}`}
    >
      {providedVisits.map((visit, index) => (
        <div
          key={visit.id}
          ref={
            index === providedVisits.length - 1
              ? ref
              : undefined
          }
        >
          <VisitCard visit={visit} feedType={feedType} />
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
