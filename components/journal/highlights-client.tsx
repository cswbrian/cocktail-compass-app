"use client";

import { BasicStats } from "./basic-stats";
import { TopPlaces } from "./top-places";
import { DrinksBarChart } from "./drinks-bar-chart";
import { PhotoSnapshot } from "./photo-snapshot";
import useSWR from 'swr';
import { userStatsService } from '@/services/user-stats-service';
import { cocktailLogsMediaService } from '@/services/media-service';
import { AuthWrapper } from "@/components/auth/auth-wrapper";

interface PlaceStats {
  name: string;
  count: number;
  place_id: string;
}

export function HighlightsClient() {
  // Use SWR for client-side updates
  const { data: stats, isLoading: isLoadingStats } = useSWR(
    'user-stats',
    async () => {
      const data = await userStatsService.getUserStats();
      if (!data) return null;
      const recentPhotos = await cocktailLogsMediaService.getSignedUrlsForMediaItems(data.recentPhotos);
      return { ...data, recentPhotos };
    },
    {
      fallbackData: {
        basicStats: {
          totalCocktailsDrunk: 0,
          uniqueCocktails: 0,
          uniquePlaces: 0
        },
        drinksByMonth: {},
        topPlaces: [] as PlaceStats[],
        recentPhotos: [],
        mostLoggedCocktails: []
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
        {stats?.basicStats && (
          <BasicStats stats={stats.basicStats} />
        )}

        {/* Drinks Over Time */}
        {stats?.drinksByMonth && Object.keys(stats.drinksByMonth).length > 0 && (
          <DrinksBarChart drinksByMonth={stats.drinksByMonth} />
        )}

        {/* Top Places */}
        {stats?.topPlaces && stats.topPlaces.length > 0 && (
          <TopPlaces places={stats.topPlaces} />
        )}

        {/* Photo Snapshot */}
        {stats?.recentPhotos && stats.recentPhotos.length > 0 && (
          <PhotoSnapshot photos={stats.recentPhotos} />
        )}
      </div>
    </AuthWrapper>
  );
} 