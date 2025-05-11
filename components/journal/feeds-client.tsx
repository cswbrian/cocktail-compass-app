"use client";

import { useCocktailData } from "@/context/CocktailLogContext";
import { Feeds } from "./feeds";
import { BasicStats } from "./basic-stats";
import useSWR from 'swr';
import { cocktailLogService } from '@/services/cocktail-log-service';
import { AuthWrapper } from "@/components/auth/auth-wrapper";

export function FeedsClient() {
  const { mutate } = useCocktailData();

  // Use SWR for client-side updates
  const { data: logs, isLoading: isLoadingLogs } = useSWR(
    'cocktail-logs',
    () => cocktailLogService.getLogsByUserId(),
    { fallbackData: [] }
  );

  const { data: stats, isLoading: isLoadingStats } = useSWR(
    'cocktail-stats',
    () => cocktailLogService.getEnhancedUserStats(),
    { 
      fallbackData: {
        basicStats: {
          totalCocktailsDrunk: 0,
          uniqueCocktails: 0,
          uniqueBars: 0
        },
        drinksByMonth: {},
        topBarsWithMostDrinks: [],
        recentPhotos: []
      }
    }
  );

  const handleLogSaved = async () => {
    await mutate();
  };

  const handleLogDeleted = async () => {
    await mutate();
  };

  const isLoading = isLoadingLogs || isLoadingStats;

  return (
    <AuthWrapper>
      <div className="space-y-6">
        <div className="px-6">
          <BasicStats stats={stats?.basicStats ?? {
            totalCocktailsDrunk: 0,
            uniqueCocktails: 0,
            uniqueBars: 0
          }} />
        </div>
        <Feeds
          logs={logs}
          isLoading={isLoading}
          onLogSaved={handleLogSaved}
          onLogDeleted={handleLogDeleted}
          onLogsChange={() => {}}
        />
      </div>
    </AuthWrapper>
  );
} 