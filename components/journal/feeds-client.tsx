"use client";

import { useCocktailData } from "@/context/CocktailLogContext";
import { Feeds } from "./feeds";
import { BasicStats } from "./basic-stats";
import useSWR from 'swr';
import { cocktailLogService } from '@/services/cocktail-log-service';
import { userStatsService } from '@/services/user-stats-service';
import { AuthWrapper } from "@/components/auth/auth-wrapper";
import { Skeleton } from "@/components/ui/skeleton";

function CocktailLogSkeleton() {
  return (
    <div className="space-y-6">
      {/* BasicStats Skeleton */}
      <div className="px-6">
        <div className="flex gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-6 w-8" />
              <Skeleton className="h-4 w-18" />
            </div>
          ))}
        </div>
      </div>

      {/* Feeds Skeleton */}
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
    </div>
  );
}

export function FeedsClient() {
  const { mutate } = useCocktailData();

  // Use SWR for client-side updates
  const { data: logs, isLoading: isLoadingLogs } = useSWR(
    'cocktail-logs',
    () => cocktailLogService.getLogsByUserId(),
    { fallbackData: [] }
  );

  const { data: stats, isLoading: isLoadingStats } = useSWR(
    'user-stats',
    () => userStatsService.getUserStats(),
    { 
      fallbackData: {
        basicStats: {
          totalCocktailsDrunk: 0,
          uniqueCocktails: 0,
          uniquePlaces: 0
        },
        drinksByMonth: {},
        topPlaces: [],
        recentPhotos: [],
        mostLoggedCocktails: []
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
    <AuthWrapper customLoading={<CocktailLogSkeleton />}>
      <div className="space-y-6">
        <div className="px-6">
          <BasicStats stats={stats?.basicStats ?? {
            totalCocktailsDrunk: 0,
            uniqueCocktails: 0,
            uniquePlaces: 0
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