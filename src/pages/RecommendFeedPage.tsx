'use client';

import { AuthWrapper } from '@/components/auth/auth-wrapper';
import { VisitList } from '@/components/visit/VisitList';
import { useVisits } from '@/context/VisitContext';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { useEffect } from 'react';

export default function RecommendFeedPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const {
    visits,
    isLoading,
    hasMore,
    loadMore,
  } = useVisits();


  return (
    <AuthWrapper
      customLoading={<VisitList isLoading={true} />}
    >
      <div className="space-y-6">
        <VisitList
          visits={visits}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={loadMore}
          key={`recommend-feed-${visits?.length}`}
        />
      </div>
    </AuthWrapper>
  );
}
