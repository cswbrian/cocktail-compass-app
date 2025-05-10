'use client';

import { createContext, useContext, ReactNode } from 'react';
import { CocktailLog } from '@/types/cocktail-log';
import { cocktailLogService } from '@/services/cocktail-log-service';
import { cocktailLogsMediaService } from '@/services/media-service';
import useSWR from 'swr';

interface EnhancedStats {
  basicStats: {
    totalCocktailsDrunk: number;
    uniqueCocktails: number;
    uniqueBars: number;
  };
  drinksByMonth: Record<string, number>;
  topBarsWithMostDrinks: { name: string; count: number }[];
  recentPhotos: { url: string; type: 'image' | 'video' }[];
}

interface CocktailLogContextType {
  logs: CocktailLog[];
  stats: EnhancedStats;
  isLoading: boolean;
  error: any;
  mutate: () => Promise<any>;
}

const CocktailLogContext = createContext<CocktailLogContextType | null>(null);

export function useCocktailData(): CocktailLogContextType {
  const context = useContext(CocktailLogContext);
  if (context === null) {
    throw new Error('useCocktailData must be used within a CocktailDataProvider');
  }
  return context;
}

export function CocktailDataProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Fetch logs using SWR
  const { data: logs = [], error: logsError, isLoading: isLoadingLogs, mutate: mutateLogs } = useSWR(
    'cocktail-logs',
    () => cocktailLogService.getLogsByUserId()
  );

  // Fetch stats using SWR
  const { data: stats, error: statsError, isLoading: isLoadingStats, mutate: mutateStats } = useSWR(
    'cocktail-stats',
    async () => {
      const data = await cocktailLogService.getEnhancedUserStats();
      if (!data) {
        return {
          basicStats: {
            totalCocktailsDrunk: 0,
            uniqueCocktails: 0,
            uniqueBars: 0
          },
          drinksByMonth: {},
          topBarsWithMostDrinks: [],
          recentPhotos: []
        };
      }

      // Convert recent photos to signed URLs
      const recentPhotos = await cocktailLogsMediaService.getSignedUrlsForMediaItems(data.recentPhotos);
      return {
        ...data,
        recentPhotos
      };
    }
  );

  // Combine the states
  const value = {
    logs,
    stats: stats || {
      basicStats: {
        totalCocktailsDrunk: 0,
        uniqueCocktails: 0,
        uniqueBars: 0
      },
      drinksByMonth: {},
      topBarsWithMostDrinks: [],
      recentPhotos: []
    },
    isLoading: isLoadingLogs || isLoadingStats,
    error: logsError || statsError,
    mutate: async () => {
      await Promise.all([mutateLogs(), mutateStats()]);
    }
  };

  return (
    <CocktailLogContext.Provider value={value}>
      {children}
    </CocktailLogContext.Provider>
  );
} 