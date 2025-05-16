'use client';

import { CocktailLogList } from "@/components/cocktail-log/CocktailLogList";
import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import { cocktailLogService } from '@/services/cocktail-log-service';
import { CocktailLog } from '@/types/cocktail-log';

interface PlaceLogsProps {
  placeId: string;
}

export function PlaceLogs({ placeId }: PlaceLogsProps) {
  const [page, setPage] = useState(1);
  const [accumulatedLogs, setAccumulatedLogs] = useState<CocktailLog[]>([]);
  const PAGE_SIZE = 10;

  const { data, isLoading } = useSWR(
    ['place-logs', placeId, page],
    async () => {
      const result = await cocktailLogService.getLogsByPlaceId(placeId, page, PAGE_SIZE);
      return result;
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

  const loadMore = useCallback(() => {
    if (data?.hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  }, [data?.hasMore, isLoading]);

  return (
    <CocktailLogList 
      type="place" 
      id={placeId}
      logs={accumulatedLogs}
      isLoading={isLoading}
      hasMore={data?.hasMore}
      onLoadMore={loadMore}
    />
  );
} 