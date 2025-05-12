'use client';

import { CocktailLogCard } from "@/components/cocktail-log/cocktail-log-card";
import useSWR from 'swr';
import { cocktailLogService } from '@/services/cocktail-log-service';
import { Skeleton } from "@/components/ui/skeleton";

interface PlaceLogsProps {
  placeId: string;
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

export function PlaceLogs({ placeId }: PlaceLogsProps) {

  const { data: logs, isLoading } = useSWR(
    ['place-logs', placeId],
    () => cocktailLogService.getLogsByPlaceId(placeId),
    { fallbackData: [] }
  );

  if (isLoading) {
    return (
      <div>
        <CocktailLogSkeleton />
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="space-y-4">
        {logs.map((log) => (
          <CocktailLogCard key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
} 