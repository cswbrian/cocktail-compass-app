"use client";

import { useCocktailData } from "@/context/CocktailLogContext";
import { BasicStats } from "@/components/stats/BasicStats";
import { AuthWrapper } from "@/components/auth/auth-wrapper";
import { CocktailLogList } from "@/components/cocktail-log/CocktailLogList";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { Link } from "react-router-dom";

export default function MyFeedPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const { logs, isLoading, stats, hasMore, loadMore } = useCocktailData();

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
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      </div>
    </AuthWrapper>
  );
}
