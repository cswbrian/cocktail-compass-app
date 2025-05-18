import { CocktailLogCard } from "@/components/cocktail-log/CocktailLogCard";
import useSWR from 'swr';
import { cocktailLogService } from '@/services/cocktail-log-service';
import { Skeleton } from "@/components/ui/skeleton";
import { CocktailLog } from "@/types/cocktail-log";
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from "lucide-react";

interface CocktailLogListProps {
  type?: 'place' | 'cocktail';
  id?: string;
  logs?: CocktailLog[];
  isLoading?: boolean;
  onLogSaved?: () => void;
  onLogDeleted?: () => void;
  onLogsChange?: (logs: CocktailLog[]) => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
  variant?: 'public' | 'private';
}

function CocktailLogSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="rounded-lg border p-4 space-y-3">
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
  onLoadMore: providedOnLoadMore,
  variant = 'private'
}: CocktailLogListProps) {
  const [page, setPage] = useState(1);
  const [accumulatedLogs, setAccumulatedLogs] = useState<CocktailLog[]>([]);
  const PAGE_SIZE = 10;

  const { data: fetchedData, isLoading: isFetching } = useSWR(
    type && id ? [`${type}-logs`, id, page] : null,
    async () => {
      if (type === 'place') {
        return cocktailLogService.getLogsByPlaceId(id!, page, PAGE_SIZE);
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
      }
    }
  );

  const logs = providedLogs ?? accumulatedLogs;
  const isLoading = providedIsLoading ?? isFetching;
  const hasMore = providedHasMore ?? fetchedData?.hasMore;

  // Set up intersection observer for infinite scrolling
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  // Load more when the last item comes into view
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      if (providedOnLoadMore) {
        providedOnLoadMore();
      } else {
        setPage(prev => prev + 1);
      }
    }
  }, [inView, hasMore, isLoading, providedOnLoadMore]);

  if (isLoading && (!logs || logs.length === 0)) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
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
            variant={variant}
          />
        </div>
      ))}
      {isLoading && logs.length > 0 && (
        <div className="mt-4">
          <CocktailLogSkeleton />
        </div>
      )}
    </div>
  );
} 