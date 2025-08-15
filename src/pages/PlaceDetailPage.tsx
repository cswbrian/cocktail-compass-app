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
import { MAP_CONFIG } from '@/config/map-config';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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

  // Helper function to format time (e.g., "1700" -> "17:00")
  const formatTime = (timeStr: string) => {
    const hour = timeStr.substring(0, 2);
    const minute = timeStr.substring(2, 4);
    return `${hour}:${minute}`;
  };

  // Helper function to render opening hours
  const renderOpeningHours = (openingHours: any) => {
    if (!openingHours) return null;

    // Use periods as primary method for better translation support
    if (
      openingHours.periods &&
      Array.isArray(openingHours.periods)
    ) {
      const weekdays = [
        t.sunday,
        t.monday,
        t.tuesday,
        t.wednesday,
        t.thursday,
        t.friday,
        t.saturday,
      ];

      // Get current day (0 = Sunday, 1 = Monday, etc.)
      const today = new Date().getDay();

      return (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="opening-hours">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{t.openingHours}</span>
                {/* Place Status Display */}
                <div>
                  {place && (
                    <PlaceStatusDisplay
                      place={place}
                      className="ml-2"
                    />
                  )}
                  {/* Show today's hours in the trigger */}
                  {(() => {
                    const todayPeriod = openingHours.periods.find(
                      (period: any) => period.open.day === today
                    );
                    if (todayPeriod) {
                      const openTime = formatTime(todayPeriod.open.time);
                      const closeTime = formatTime(todayPeriod.close.time);
                      return (
                        <span className="ml-2">
                          {weekdays[today]}: {openTime} - {closeTime}
                        </span>
                      );
                    } else {
                      return (
                        <span className="ml-2 text-muted-foreground">
                          {weekdays[today]}: {t.closed}
                        </span>
                      );
                    }
                  })()}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1">
                {weekdays.map((weekday, index) => {
                  const period = openingHours.periods.find(
                    (p: any) => p.open.day === index
                  );
                  const isToday = index === today;

                  if (period) {
                    const openTime = formatTime(period.open.time);
                    const closeTime = formatTime(period.close.time);

                    if (period.open.day === period.close.day) {
                      return (
                        <div
                          key={index}
                          className={`flex justify-between p-1 ${
                            isToday 
                              ? 'text-primary bg-primary/10 rounded' 
                              : 'text-muted-foreground'
                          }`}
                        >
                          <span>{weekday}</span> 
                          <span>{openTime} - {closeTime}</span>
                        </div>
                      );
                    } else {
                      return (
                        <div
                          key={index}
                          className={`flex justify-between p-1 ${
                            isToday 
                              ? 'text-primary bg-primary/10 rounded' 
                              : 'text-muted-foreground'
                          }`}
                        >
                          <span>{weekday}</span> 
                          <span>{openTime} - {closeTime}</span>
                        </div>
                      );
                    }
                  } else {
                    // No data for this day, show as closed
                    return (
                      <div
                        key={index}
                        className={`flex justify-between p-1 ${
                          isToday 
                            ? 'text-primary bg-primary/10 rounded' 
                            : 'text-muted-foreground'
                        }`}
                      >
                        <span>{weekday}</span> 
                        <span>{t.closed}</span>
                      </div>
                    );
                  }
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    }

    // Fallback to weekday_text if periods not available
    if (
      openingHours.weekday_text &&
      Array.isArray(openingHours.weekday_text)
    ) {
      return (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="opening-hours">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{t.openingHours}</span>
                {/* Place Status Display */}
                {place && (
                  <PlaceStatusDisplay
                    place={place}
                    className="ml-2"
                  />
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1 pt-2">
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
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
          {place.show_on_map && (
            <div className="mb-4">
              <Button
                variant="outline"
                onClick={() => {
                  const params = new URLSearchParams({
                    place: place.id,
                    lat: String(place.lat),
                    lng: String(place.lng),
                    zoom: String(MAP_CONFIG.interactions.markerFocusZoom),
                  });
                  navigate(`/${language}/map?${params.toString()}`, {
                    state: { place },
                  });
                }}
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {t.viewOnMap || 'View on Map'}
                </span>
              </Button>
            </div>
          )}
          <p className="text-sm text-muted-foreground mb-4">
            {place.is_verified
              ? t.placeVerifiedDescription
              : t.placeUnverifiedDescription}
          </p>

          {/* Place Status and Details */}
          {/* Removed PlaceStatusDisplay from here - moved to accordion trigger */}

          {/* Full Opening Hours Display */}
          {place.opening_hours && (
            <div className="space-y-3 mb-4">
              {renderOpeningHours(place.opening_hours)}
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
                      <ExternalLink className="w-4 h-4" />
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
                    <ExternalLink className="w-4 h-4" />
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
