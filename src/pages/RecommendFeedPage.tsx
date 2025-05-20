import { useCocktailData } from "@/context/CocktailLogContext";
import { AuthWrapper } from "@/components/auth/auth-wrapper";
import { CocktailLogList } from "@/components/cocktail-log/CocktailLogList";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { useState, useEffect } from "react";
import { cocktailLogService } from "@/services/cocktail-log-service";
import { CocktailLog } from "@/types/cocktail-log";
import useSWR from 'swr';
import { CACHE_KEYS, fetchers, swrConfig, defaultData } from '@/lib/swr-config';

export default function RecommendFeedPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const {
    data: logsData,
    isLoading,
    error,
    mutate: mutateLogs,
  } = useSWR<{ logs: CocktailLog[]; hasMore: boolean }>(
    [CACHE_KEYS.COCKTAIL_LOGS, 'public', page],
    async () => {
      const result = await fetchers.getPublicCocktailLogs(page, PAGE_SIZE);
      return result;
    },
    {
      ...swrConfig,
      fallbackData: { logs: [], hasMore: true },
    }
  );

  const handleLogSaved = () => {
    setPage(1);
    mutateLogs();
  };

  const handleLogDeleted = () => {
    setPage(1);
    mutateLogs();
  };

  const loadMore = () => {
    if (!isLoading && logsData?.hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <AuthWrapper customLoading={<CocktailLogList isLoading={true} />}>
      <div className="space-y-6">
        <CocktailLogList
          logs={logsData?.logs || []}
          isLoading={isLoading}
          onLogSaved={handleLogSaved}
          onLogDeleted={handleLogDeleted}
          hasMore={logsData?.hasMore || false}
          onLoadMore={loadMore}
        />
      </div>
    </AuthWrapper>
  );
} 