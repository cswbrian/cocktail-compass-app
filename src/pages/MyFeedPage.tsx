'use client';

import { useCocktailLogs } from '@/context/CocktailLogContext';
import { BasicStats } from '@/components/stats/BasicStats';
import { AuthWrapper } from '@/components/auth/auth-wrapper';
import { CocktailLogList } from '@/components/cocktail-log/CocktailLogList';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { SmilePlus } from 'lucide-react';

export default function MyFeedPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const {
    logs,
    isLoading,
    stats,
    hasMore,
    loadMore,
    setLogType,
  } = useCocktailLogs();

  useEffect(() => {
    setLogType('private');
    return () => {
      // Reset to default state when unmounting
      setLogType('public');
    };
  }, [setLogType]);

  return (
    <AuthWrapper
      customLoading={<CocktailLogList isLoading={true} />}
    >
      <div className="space-y-6">
        <Link to={`/${language}/profile`}>
          <div className="px-6">
            {stats?.basicStats && (
              <BasicStats stats={stats.basicStats} />
            )}
          </div>
        </Link>

        {!isLoading && (!logs || logs.length === 0) ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <SmilePlus className="w-24 h-24 text-muted-foreground mb-6" />
            <p className="text-2xl text-muted-foreground mb-4">{t.noLogs}</p>
            <p className="text-md text-muted-foreground">
              {t.noLogsDescription}
            </p>
          </div>
        ) : (
          <CocktailLogList
            logs={logs}
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            key={`my-feed-${logs?.length}`}
          />
        )}
      </div>
    </AuthWrapper>
  );
}
