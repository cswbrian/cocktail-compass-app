"use client";

import { useCocktailData } from "@/context/CocktailLogContext";
import { BasicStats } from "@/components/stats/BasicStats";
import { AuthWrapper } from "@/components/auth/auth-wrapper";
import { CocktailLogList } from "@/components/cocktail-log/CocktailLogList";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { cocktailLogService } from "@/services/cocktail-log-service";
import { CocktailLog } from "@/types/cocktail-log";
import { useAuth } from "@/context/AuthContext";
import useSWR from 'swr';
import { CACHE_KEYS, fetchers, swrConfig, defaultData } from '@/lib/swr-config';

export default function MyFeedPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const { user } = useAuth();
  const [logs, setLogs] = useState<CocktailLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Use SWR for stats
  const { data: stats, isLoading: isLoadingStats } = useSWR(
    CACHE_KEYS.USER_STATS,
    fetchers.getUserStats,
    {
      ...swrConfig,
      fallbackData: defaultData[CACHE_KEYS.USER_STATS]
    }
  );

  const loadLogs = async (pageNum: number = 1) => {
    if (!user) return;
    
    try {
      const { logs: newLogs, hasMore: more } = await cocktailLogService.getOwnLogs(user.id, pageNum);
      if (pageNum === 1) {
        setLogs(newLogs);
      } else {
        setLogs(prev => [...prev, ...newLogs]);
      }
      setHasMore(more);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadLogs(nextPage);
    }
  };

  useEffect(() => {
    if (user) {
      loadLogs();
    }
  }, [user]);

  const handleLogSaved = () => {
    setPage(1);
    loadLogs(1);
  };

  const handleLogDeleted = () => {
    setPage(1);
    loadLogs(1);
  };

  return (
    <AuthWrapper customLoading={<CocktailLogList isLoading={true} />}>
      <div className="space-y-6">
        <Link to={`/${language}/profile`}>
          <div className="px-6">
            {stats?.basicStats && (
              <BasicStats
                stats={stats.basicStats}
              />
            )}
          </div>
        </Link>

        <CocktailLogList
          logs={logs}
          isLoading={isLoading}
          onLogSaved={handleLogSaved}
          onLogDeleted={handleLogDeleted}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      </div>
    </AuthWrapper>
  );
}
