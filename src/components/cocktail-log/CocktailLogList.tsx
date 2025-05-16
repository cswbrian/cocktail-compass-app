'use client';

import { CocktailLogCard } from "@/components/cocktail-log/CocktailLogCard";
import useSWR from 'swr';
import { cocktailLogService } from '@/services/cocktail-log-service';
import { Skeleton } from "@/components/ui/skeleton";
import { CocktailLog } from "@/types/cocktail-log";

interface CocktailLogListProps {
  type?: 'place' | 'cocktail';
  id?: string;
  logs?: CocktailLog[];
  isLoading?: boolean;
  onLogSaved?: () => void;
  onLogDeleted?: () => void;
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
  onLogDeleted 
}: CocktailLogListProps) {
  const { data: fetchedLogs, isLoading: isFetching } = useSWR(
    type && id ? [`${type}-logs`, id] : null,
    () => type === 'place' 
      ? cocktailLogService.getLogsByPlaceId(id!)
      : cocktailLogService.getLogsByCocktailId(id!),
    { fallbackData: [] }
  );

  const logs = providedLogs ?? fetchedLogs;
  const isLoading = providedIsLoading ?? isFetching;

  if (isLoading) {
    return <CocktailLogSkeleton />;
  }

  if (!logs || logs.length === 0) {
    return null;
  }

  return (
    <div>
      {logs.map((log) => (
        <CocktailLogCard 
          key={log.id} 
          log={log} 
          onLogSaved={onLogSaved}
          onLogDeleted={onLogDeleted}
        />
      ))}
    </div>
  );
} 