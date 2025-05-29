import { useState, useEffect } from 'react';
import {
  useParams,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { placeService } from '@/services/place-service';
import { Button } from '@/components/ui/button';
import { Place } from '@/types/place';
import { useLanguage } from '@/context/LanguageContext';
import { CocktailLogList } from '@/components/cocktail-log/CocktailLogList';
import {
  MapPin,
  BadgeCheck,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { translations } from '@/translations';
import useSWR from 'swr';
import { fetchers, CACHE_KEYS } from '@/lib/swr-config';
import { AuthWrapper } from '@/components/auth/auth-wrapper';
import { ExternalLink } from '@/components/external-link';
import { VisitList } from '@/components/visit/VisitList';
import { PlaceDetailNav } from '@/components/place/PlaceDetailNav';
import { ShareButton } from '@/components/ShareButton';
import { BookmarkButton } from '@/components/bookmark/bookmark-button';

export default function PlaceDetailPage() {
  const [place, setPlace] = useState<Place | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const { placeId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const PAGE_SIZE = 10;
  const location = useLocation();
  const isRecommendFeed = location.pathname.includes(
    '/feeds/recommend',
  );
  const isMyFeed = location.pathname.includes('/feeds/me');
  const isVisitsView = location.pathname.includes('/feeds');

  // Fetch place details
  useEffect(() => {
    const fetchPlace = async () => {
      if (!placeId) return;

      try {
        setIsLoading(true);
        setError(null);
        const fetchedPlace =
          await placeService.getPlaceByPlaceId(placeId);
        if (fetchedPlace) {
          setPlace(fetchedPlace);
        } else {
          setError('Place not found');
        }
      } catch (err) {
        setError('Failed to load place');
        console.error('Error fetching place:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlace();
  }, [placeId]);

  // Fetch logs using SWR
  const {
    data: logsData,
    isLoading: isLoadingLogs,
    mutate,
  } = useSWR(
    placeId && !isVisitsView
      ? [CACHE_KEYS.PLACE_LOGS(placeId), page]
      : null,
    () => fetchers.getPlaceLogs(placeId!, page, PAGE_SIZE),
    {
      fallbackData: { logs: [], hasMore: false },
      revalidateOnFocus: false,
      revalidateIfStale: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    },
  );

  // Fetch visits using SWR
  const {
    data: visitsData,
    isLoading: isLoadingVisits,
    mutate: mutateVisits,
  } = useSWR(
    placeId && isVisitsView
      ? [
          CACHE_KEYS.PLACE_VISITS(placeId),
          page,
          isRecommendFeed,
        ]
      : null,
    () =>
      fetchers.getPlaceVisits(
        placeId!,
        page,
        PAGE_SIZE,
        isRecommendFeed,
      ),
    {
      fallbackData: { visits: [], hasMore: false },
      revalidateOnFocus: false,
      revalidateIfStale: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    },
  );

  const loadMore = () => {
    if (logsData?.hasMore && !isLoadingLogs) {
      setPage(prev => prev + 1);
    }
  };

  const loadMoreVisits = () => {
    if (visitsData?.hasMore && !isLoadingVisits) {
      setPage(prev => prev + 1);
    }
  };

  const handleClose = () => {
    navigate(`/${language}/feeds`);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={handleClose}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!place) return null;

  return (
    <AuthWrapper>
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 mb-6">
          <Button
            variant="link"
            onClick={handleClose}
            className="p-0 text-muted-foreground hover:no-underline"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.back}
          </Button>
          <div className="flex items-top gap-2">
            <h1 className="text-4xl mb-2">{place.name}</h1>
            <div className="flex gap-2">
              <BookmarkButton placeId={place.id} />
              <ShareButton url={window.location.href} />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            {place.is_verified ? (
              <div className="flex items-center text-primary">
                <BadgeCheck className="w-5 h-5 mr-1" />
                <span className="text-sm">
                  {t.placeVerified}
                </span>
              </div>
            ) : (
              <div className="flex items-center text-muted-foreground">
                <AlertCircle className="w-5 h-5 mr-1" />
                <span className="text-sm">
                  {t.placeUnverified}
                </span>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {place.is_verified
              ? t.placeVerifiedDescription
              : t.placeUnverifiedDescription}
          </p>
          <ExternalLink message={t.feedbackMessage} />
          <div className="mt-4 flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {place.secondary_text && (
              <span className="ml-1">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${place.secondary_text}&query_place_id=${place.place_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary inline-block"
                >
                  {place.secondary_text}
                </a>
              </span>
            )}
          </div>
        </div>

        <div>
          <PlaceDetailNav />
          <VisitList
            visits={visitsData?.visits}
            isLoading={isLoadingVisits}
            hasMore={visitsData?.hasMore}
            onLoadMore={loadMoreVisits}
            feedType={isRecommendFeed ? 'recommend' : 'my'}
          />
        </div>
      </div>
    </AuthWrapper>
  );
}
