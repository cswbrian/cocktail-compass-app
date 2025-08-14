import { Skeleton } from '@/components/ui/skeleton';
import { Visit } from '@/types/visit';
import {
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { useInView } from 'react-intersection-observer';
import {
  Loader2,
  LayoutList,
  List,
  SmilePlus,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { VisitCard } from './VisitCard';
import { sendGAEvent } from '@/lib/ga';
import { Button } from '@/components/ui/button';
import { translations } from '@/translations';

interface VisitListProps {
  visits?: Visit[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  feedType?: 'recommend' | 'my';
}

function VisitSkeleton() {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

function VisitListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <VisitSkeleton key={index} />
      ))}
    </div>
  );
}

function ViewToggle({ compact, setCompact, t }: { compact: boolean; setCompact: React.Dispatch<React.SetStateAction<boolean>>; t: any }) {
  return (
    <div className="flex px-6">
      <Button
        variant="link"
        className="p-0 text-muted-foreground"
        size="sm"
        onClick={() => setCompact((v) => !v)}
      >
        {compact ? (
          <>
            <List className="h-4 w-4" /> {t.compactView}
          </>
        ) : (
          <>
            <LayoutList className="h-4 w-4" /> {t.cardView}
          </>
        )}
      </Button>
    </div>
  );
}

export function VisitList({
  visits: providedVisits,
  isLoading: providedIsLoading,
  hasMore: providedHasMore,
  onLoadMore: providedOnLoadMore,
  feedType = 'recommend',
}: VisitListProps) {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [compact, setCompact] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('visit-list-view-mode');
      // 'compact' means compact view (default), 'normal' means normal view
      return stored === null ? true : stored === 'compact' ? true : false;
    }
    return true;
  });
  
  const THROTTLE_DELAY = 300;
  const lastFetchTime = useRef<number>(0);
  const isLoadingRef = useRef(false);
  const { language } = useLanguage();
  const t =
    translations[language as keyof typeof translations] ||
    translations.en;

  // Set up intersection observer for infinite scrolling
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '200px',
  });

  const loadMore = useCallback(async () => {
    const now = Date.now();
    if (
      now - lastFetchTime.current < THROTTLE_DELAY ||
      isLoadingRef.current
    ) {
      return;
    }

    if (!providedHasMore || providedIsLoading) {
      return;
    }

    lastFetchTime.current = now;
    setIsLoadingMore(true);
    isLoadingRef.current = true;

    if (providedOnLoadMore) {
      // Track loading more visits
      sendGAEvent(
        'Visit List',
        'Load More',
        `Feed: ${feedType}`,
      );
      await providedOnLoadMore();
      setIsLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [
    providedHasMore,
    providedIsLoading,
    providedOnLoadMore,
    feedType,
  ]);

  // Track initial visits load
  useEffect(() => {
    if (providedVisits && providedVisits.length > 0) {
      sendGAEvent(
        'Visit List',
        'Initial Load',
        `Feed: ${feedType}, Count: ${providedVisits.length}`,
      );
    }
  }, [providedVisits, feedType]);

  // Load more when the last item comes into view
  useEffect(() => {
    if (
      inView &&
      providedHasMore &&
      !providedIsLoading &&
      !isLoadingMore
    ) {
      loadMore();
    }
  }, [
    inView,
    providedHasMore,
    providedIsLoading,
    isLoadingMore,
    loadMore,
  ]);

  // Save compact view to localStorage when it changes
  useEffect(() => {
    if (feedType === 'my' && typeof window !== 'undefined') {
      localStorage.setItem('visit-list-view-mode', compact ? 'compact' : 'normal');
    }
  }, [compact, feedType]);

  if (
    providedIsLoading &&
    (!providedVisits || providedVisits.length === 0)
  ) {
    return <VisitListSkeleton />;
  }

  if (!providedVisits || providedVisits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
            <SmilePlus className="w-24 h-24 text-muted-foreground mb-6" />
            <p className="text-2xl text-muted-foreground mb-4">{t.noVisits}</p>
            <p className="text-md text-muted-foreground">
              {t.noLogsDescription}
            </p>
          </div>
    );
  }

  return (
    <div key={`visit-list-${providedVisits.length}`}>
      {feedType === 'my' && (
        <ViewToggle compact={compact} setCompact={setCompact} t={t} />
      )}
      {providedVisits.map((visit, index) => (
        <div
          key={visit.id}
          ref={
            index === providedVisits.length - 1
              ? ref
              : undefined
          }
        >
          <VisitCard
            visit={visit}
            feedType={feedType}
            compact={feedType === 'my' ? compact : false}
          />
        </div>
      ))}
      {isLoadingMore && (
        <div className="mt-4 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
    </div>
  );
}
