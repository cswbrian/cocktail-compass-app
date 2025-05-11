"use client";

import { BasicStats } from "./basic-stats";
import { TopBars } from "./top-bars";
import { DrinksBarChart } from "./drinks-bar-chart";
import { PhotoSnapshot } from "./photo-snapshot";
import useSWR from 'swr';
import { cocktailLogService } from '@/services/cocktail-log-service';
import { cocktailLogsMediaService } from '@/services/media-service';
import { AuthWrapper } from "@/components/auth/auth-wrapper";

export function HighlightsClient() {

  // Use SWR for client-side updates
  const { data: stats, isLoading: isLoadingStats } = useSWR(
    'cocktail-stats',
    async () => {
      const data = await cocktailLogService.getEnhancedUserStats();
      if (!data) return null;
      const recentPhotos = await cocktailLogsMediaService.getSignedUrlsForMediaItems(data.recentPhotos);
      return { ...data, recentPhotos };
    },
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

  const isLoading = isLoadingStats;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthWrapper>
      <div className="px-6 space-y-8">
        {/* Basic Stats */}
        <BasicStats stats={stats?.basicStats ?? {
          totalCocktailsDrunk: 0,
          uniqueCocktails: 0,
          uniqueBars: 0
        }} />

        {/* Drinks Over Time */}
        <DrinksBarChart drinksByMonth={stats?.drinksByMonth ?? {}} />

        {/* Top Bars */}
        <TopBars bars={stats?.topBarsWithMostDrinks ?? []} />

        {/* Photo Snapshot */}
        <PhotoSnapshot photos={stats?.recentPhotos ?? []} />
      </div>
    </AuthWrapper>
  );
} 