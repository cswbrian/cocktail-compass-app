'use client';

import { AuthWrapper } from '@/components/auth/auth-wrapper';
import { VisitList } from '@/components/visit/VisitList';
import { useVisits } from '@/context/VisitContext';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';

export default function RecommendFeedPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const {
    publicVisits,
    publicVisitsLoading,
    publicHasMore,
    loadMorePublicVisits,
  } = useVisits();

  return (
    <AuthWrapper
      customLoading={<VisitList isLoading={true} />}
    >
      <div className="space-y-6">
        <VisitList
          visits={publicVisits}
          isLoading={publicVisitsLoading}
          hasMore={publicHasMore}
          onLoadMore={loadMorePublicVisits}
          key={`recommend-feed-${publicVisits?.length}`}
        />
      </div>
    </AuthWrapper>
  );
}
