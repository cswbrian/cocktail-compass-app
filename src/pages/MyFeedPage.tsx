'use client';

import { BasicStats } from '@/components/stats/BasicStats';
import { AuthWrapper } from '@/components/auth/auth-wrapper';
import { VisitList } from '@/components/visit/VisitList';
import { useUserVisits } from '@/context/UserVisitContext';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { Link } from 'react-router-dom';
import { SmilePlus } from 'lucide-react';

export default function MyFeedPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const {
    visits,
    isLoading,
    hasMore,
    loadMore,
  } = useUserVisits();

  return (
    <AuthWrapper
      customLoading={<VisitList isLoading={true} />}
    >
      <div className="space-y-6">
        <Link to={`/${language}/profile`}>
          <div className="px-6">
            <BasicStats />
          </div>
        </Link>

        {!isLoading && (!visits || visits.length === 0) ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <SmilePlus className="w-24 h-24 text-muted-foreground mb-6" />
            <p className="text-2xl text-muted-foreground mb-4">{t.noVisits}</p>
            <p className="text-md text-muted-foreground">
              {t.noVisitsDescription}
            </p>
          </div>
        ) : (
          <VisitList
            visits={visits}
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            key={`my-feed-${visits?.length}`}
          />
        )}
      </div>
    </AuthWrapper>
  );
}
