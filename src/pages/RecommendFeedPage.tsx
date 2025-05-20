"use client";

import { usePublicCocktailLogs } from "@/context/PublicCocktailLogContext";
import { AuthWrapper } from "@/components/auth/auth-wrapper";
import { CocktailLogList } from "@/components/cocktail-log/CocktailLogList";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";

export default function RecommendFeedPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const { logs, isLoading, hasMore, loadMore } = usePublicCocktailLogs();

  return (
    <AuthWrapper customLoading={<CocktailLogList isLoading={true} />}>
      <div className="space-y-6">
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