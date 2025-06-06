'use client';

import { useCocktailData } from '@/context/CocktailLogContext';
import { BasicStats } from '@/components/stats/BasicStats';
import { AuthWrapper } from '@/components/auth/auth-wrapper';
import { CocktailLogList } from '@/components/cocktail-log/CocktailLogList';

export function FeedsContainer() {
  const {
    logs,
    stats,
    isLoading,
    hasMore,
    loadMore,
    mutate,
  } = useCocktailData();

  return (
    <AuthWrapper
      customLoading={<CocktailLogList isLoading={true} />}
    >
      <div className="space-y-6">
        <div className="px-6">
          <BasicStats
            stats={stats?.basicStats ?? {
              totalCocktailsDrunk: 0,
              uniqueCocktails: 0,
              uniquePlaces: 0,
            }}
          />
        </div>
        <CocktailLogList
          logs={logs ?? []}
          isLoading={isLoading}
          onLogSaved={mutate}
          onLogDeleted={mutate}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      </div>
    </AuthWrapper>
  );
}
