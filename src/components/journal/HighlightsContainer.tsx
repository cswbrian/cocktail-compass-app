"use client";

import { BasicStats } from "@/components/stats/BasicStats";
import { TopPlaces } from "@/components/stats/TopPlaces";
import { DrinksBarChart } from "@/components/stats/DrinksBarChart";
import { PhotoSnapshot } from "@/components/journal/photo-snapshot";
import useSWR from 'swr';
import { AuthWrapper } from "@/components/auth/auth-wrapper";
import { CACHE_KEYS, fetchers, swrConfig, defaultData } from '@/lib/swr-config';

export function HighlightsContainer() {
  // Use SWR for client-side updates
  const { data: stats, isLoading: isLoadingStats } = useSWR(
    CACHE_KEYS.USER_STATS,
    fetchers.getUserStats,
    {
      ...swrConfig,
      fallbackData: defaultData[CACHE_KEYS.USER_STATS]
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