import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { placeService } from "@/services/place-service";
import { Button } from "@/components/ui/button";
import { Place } from "@/types/place";
import { useLanguage } from "@/context/LanguageContext";
import { PlaceLogs } from "@/components/place/place-logs";
import { MapPin, X, BadgeCheck, AlertCircle, ArrowLeft } from "lucide-react";
import { translations } from "@/translations";

export default function PlaceDetailPage() {
  const [place, setPlace] = useState<Place | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { placeId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    const fetchPlace = async () => {
      if (!placeId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const fetchedPlace = await placeService.getPlaceByPlaceId(placeId);
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

  const handleClose = () => {
    navigate(`/${language}/feeds`);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
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
    <div className="flex-1 overflow-y-auto">
          <div className="p-6 mb-6">
            <Button
              variant="link"
              onClick={handleClose}
              className="p-0 text-muted-foreground hover:no-underline"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.back}
            </Button>
            <h1 className="text-4xl mb-2">{place.name}</h1>
            <div className="flex items-center gap-2 mb-2">
              {place.is_verified ? (
                <div className="flex items-center text-primary">
                  <BadgeCheck className="w-5 h-5 mr-1" />
                  <span className="text-sm">{t.placeVerified}</span>
                </div>
              ) : (
                <div className="flex items-center text-muted-foreground">
                  <AlertCircle className="w-5 h-5 mr-1" />
                  <span className="text-sm">{t.placeUnverified}</span>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {place.is_verified 
                ? t.placeVerifiedDescription
                : t.placeUnverifiedDescription}
            </p>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {place.secondary_text && (
                <span className="ml-1">
                  <a
                    href={`https://www.google.com/maps/place/?q=place_id:${place.place_id}`}
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

          <PlaceLogs placeId={place.place_id} />
        </div>
  );
} 