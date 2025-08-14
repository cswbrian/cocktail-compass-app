import { useState, useEffect } from 'react';
import {
  useParams,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { placeService } from '@/services/place-service';
import { Button } from '@/components/ui/button';
import { Place } from '@/types/place';
import { Visit } from '@/types/visit';
import { useLanguage } from '@/context/LanguageContext';
import { CocktailLogList } from '@/components/cocktail-log/CocktailLogList';
import {
  MapPin,
  BadgeCheck,
  AlertCircle,
  Clock,
  Phone,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { translations } from '@/translations';
import useSWR from 'swr';
import { fetchers, CACHE_KEYS } from '@/lib/swr-config';
import { AuthWrapper } from '@/components/auth/auth-wrapper';
import { ExternalLink as ExternalLinkComponent } from '@/components/external-link';
import { VisitList } from '@/components/visit/VisitList';
import { PlaceDetailNav } from '@/components/place/PlaceDetailNav';
import { ShareButton } from '@/components/ShareButton';
import { BookmarkButton } from '@/components/bookmark/bookmark-button';
import { BackButton } from '@/components/common/BackButton';
import { PlaceStatusDisplay } from '@/components/common/PlaceStatusDisplay';
import { sendGAEvent } from '@/lib/ga';
import { buildGoogleMapsUrl } from '@/lib/utils';

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

  // Helper function to format time (e.g., "1700" -> "5:00 PM")
  const formatTime = (timeStr: string) => {
    const hour = parseInt(timeStr.substring(0, 2));
    const minute = timeStr.substring(2, 4);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour =
      hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minute} ${period}`;
  };

  // Helper function to render opening hours
  const renderOpeningHours = (openingHours: any) => {
    if (!openingHours) return null;

    // Show weekday_text if available (most readable)
    if (
      openingHours.weekday_text &&
      Array.isArray(openingHours.weekday_text)
    ) {
      return (
        <div className="space-y-1">
          {openingHours.weekday_text.map(
            (dayText: string, index: number) => (
              <div
                key={index}
                className="text-sm text-muted-foreground"
              >
                {dayText}
              </div>
            ),
          )}
        </div>
      );
    }

    // Fallback to periods if weekday_text not available
    if (
      openingHours.periods &&
      Array.isArray(openingHours.periods)
    ) {
      const days = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];

      return (
        <div className="space-y-1">
          {openingHours.periods.map(
            (period: any, index: number) => {
              const openDay = days[period.open.day];
              const closeDay = days[period.close.day];
              const openTime = formatTime(period.open.time);
              const closeTime = formatTime(
                period.close.time,
              );

              if (period.open.day === period.close.day) {
                return (
                  <div
                    key={index}
                    className="text-sm text-muted-foreground"
                  >
                    {openDay}: {openTime} - {closeTime}
                  </div>
                );
              } else {
                return (
                  <div
                    key={index}
                    className="text-sm text-muted-foreground"
                  >
                    {openDay} {openTime} - {closeDay}{' '}
                    {closeTime}
                  </div>
                );
              }
            },
          )}
        </div>
      );
    }

    return null;
  };

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
          setError(t.userNotFound);
        }
      } catch (err) {
        setError(t.error);
        console.error('Error fetching place:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlace();
  }, [placeId, t.userNotFound, t.error]);

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

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {t.loading}
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
          <Button onClick={handleGoBack}>{t.back}</Button>
        </div>
      </div>
    );
  }

  if (!place) return null;

  return (
    <AuthWrapper>
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 mb-6">
          <BackButton />
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

          {/* Place Status and Details */}
          <PlaceStatusDisplay
            place={place}
            className="mb-4"
          />

          {/* Full Opening Hours Display */}
          {place.opening_hours && (
            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium mb-2">
                    {t.openingHours}
                  </div>
                  {renderOpeningHours(place.opening_hours)}
                </div>
              </div>
            </div>
          )}

          {/* Contact Information */}
          {(place.phone_number ||
            place.website ||
            place.secondary_text) && (
            <div className="space-y-3 mb-4">
              {/* Address */}
              {place.secondary_text && (
                <div
                  className="flex items-start gap-3"
                  onClick={() => {
                    sendGAEvent(
                      'PlaceDetail',
                      'directions_click',
                      place.name,
                    );
                    const url = buildGoogleMapsUrl({
                      name: place.name,
                      place_id: place.place_id,
                      lat: place.lat,
                      lng: place.lng,
                    });
                    window.open(url, '_blank');
                  }}
                >
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-primary flex items-center gap-1">
                      {place.secondary_text}
                      <ExternalLink className="w-3 h-3" />
                    </div>
                    {place.description && (
                      <div className="text-sm text-muted-foreground/80 mt-1">
                        {place.description}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Phone Number */}
              {place.phone_number && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <a
                    href={`tel:${place.phone_number}`}
                    className="text-primary hover:text-primary/80 hover:underline"
                  >
                    {place.phone_number}
                  </a>
                </div>
              )}

              {/* Website */}
              {place.website && (
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <a
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 hover:underline flex items-center gap-1"
                  >
                    {t.visitWebsite}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          <ExternalLinkComponent
            message={t.feedbackMessage}
          />
        </div>

        <div>
          <PlaceDetailNav />
          <VisitList
            visits={
              (visitsData?.visits as unknown as Visit[]) ||
              []
            }
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
