'use client';

import { createContext, useContext, ReactNode } from 'react';
import { CocktailLog } from '@/types/cocktail-log';
import { cocktailLogService } from '@/services/cocktail-log-service';
import useSWR from 'swr';

interface EnhancedStats {
  basicStats: {
    totalCocktailsDrunk: number;
    uniqueCocktails: number;
    uniqueBars: number;
  };
  drinksByMonth: Record<string, number>;
  topBarsWithMostDrinks: { name: string; count: number }[];
  recentPhotos: { url: string; type: string }[];
}

interface CocktailDataContextType {
  logs: CocktailLog[];
  stats: EnhancedStats;
  isLoading: boolean;
  error: any;
  mutate: () => Promise<any>;
}

const CocktailDataContext = createContext<CocktailDataContextType | null>(null);

export function useCocktailData(): CocktailDataContextType {
  const context = useContext(CocktailDataContext);
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
      return data;
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
    <CocktailDataContext.Provider value={value}>
      {children}
    </CocktailDataContext.Provider>
  );
} 