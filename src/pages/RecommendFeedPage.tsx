import { useCocktailData } from "@/context/CocktailLogContext";
import { AuthWrapper } from "@/components/auth/auth-wrapper";
import { CocktailLogList } from "@/components/cocktail-log/CocktailLogList";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { useState, useEffect } from "react";
import { cocktailLogService } from "@/services/cocktail-log-service";
import { CocktailLog } from "@/types/cocktail-log";

export default function RecommendFeedPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [logs, setLogs] = useState<CocktailLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadLogs = async (pageNum: number = 1) => {
    try {
      const { logs: newLogs, hasMore: more } = await cocktailLogService.getPublicLogs(pageNum);
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
    loadLogs();
  }, []);

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