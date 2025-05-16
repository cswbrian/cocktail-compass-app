"use client";

import { useCocktailData } from "@/context/CocktailLogContext";
import { BasicStats } from "@/components/journal/basic-stats";
import { AuthWrapper } from "@/components/auth/auth-wrapper";
import { CocktailLogList } from "@/components/cocktail-log/cocktail-log-list";

export function FeedsContainer() {
  const { logs, stats, isLoading, mutate } = useCocktailData();

  console.log('FeedsContainer - logs:', logs);
  console.log('FeedsContainer - isLoading:', isLoading);
  console.log('FeedsContainer - stats:', stats);

  return (
    <AuthWrapper customLoading={<CocktailLogList isLoading={true} />}>
      <div className="space-y-6">
        <div className="px-6">
          <BasicStats stats={stats?.basicStats ?? {
            totalCocktailsDrunk: 0,
            uniqueCocktails: 0,
            uniquePlaces: 0
          }} />
        </div>
        <CocktailLogList
          logs={logs ?? []}
          isLoading={isLoading}
          onLogSaved={mutate}
          onLogDeleted={mutate}
        />
      </div>
    </AuthWrapper>
  );
} 