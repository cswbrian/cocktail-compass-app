"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useCocktailData } from "@/context/CocktailLogContext";
import { Feeds } from "./feeds";
import { BasicStats } from "./basic-stats";
import useSWR from 'swr';
import { cocktailLogService } from '@/services/cocktail-log-service';

export function FeedsClient() {
  const { user } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
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

  if (!user) {
    router.push(`/${language}/login`);
    return null;
  }

  const handleLogSaved = async () => {
    await mutate();
  };

  const handleLogDeleted = async () => {
    await mutate();
  };

  const isLoading = isLoadingLogs || isLoadingStats;

  return (
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
  );
} 