import { Star, MapPin, User, Calendar, Tag } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";

interface LocationData {
  name: string;
  place_id: string;
  lat: number;
  lng: number;
  main_text: string;
  secondary_text: string;
}

interface CocktailLogInfoProps {
  rating: number | null;
  location: string | null;
  bartender: string | null;
  comments: string | null;
  tags: string[] | null;
  drinkDate: Date | null;
  showHeadings?: boolean;
}

export function CocktailLogInfo({
  rating,
  location,
  bartender,
  comments,
  tags,
  drinkDate,
  showHeadings = false,
}: CocktailLogInfoProps) {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  let locationData: LocationData | null = null;
  if (location) {
    try {
      locationData = JSON.parse(location);
    } catch (error) {
      console.error("Error parsing location data:", error);
    }
  }

  return (
    <div className="space-y-1">
      {locationData && (
        <div className="flex items-center gap-2">
          {showHeadings && (
            <span className="text-muted-foreground">{t.location}:</span>
          )}
          <MapPin className="size-4 text-muted-foreground" />
          {locationData.main_text}
        </div>
      )}

      {drinkDate && (
        <div className="flex items-center gap-2">
          {showHeadings && (
            <span className="text-muted-foreground">{t.drinkDate}:</span>
          )}
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{format(drinkDate, "PPP")}</span>
        </div>
      )}

      {rating && (
        <div className="flex items-center gap-2">
          {showHeadings && (
            <span className="text-muted-foreground">{t.rating}:</span>
          )}
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= rating
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {bartender && (
        <div className="flex items-center gap-2">
          {showHeadings && (
            <span className="text-muted-foreground">{t.bartender}:</span>
          )}
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{bartender}</span>
        </div>
      )}

      {comments && (
        <div className="flex flex-col gap-2">
          {showHeadings && (
            <span className="text-muted-foreground">{t.notes}:</span>
          )}
          <p className="text-sm whitespace-pre-wrap">{comments}</p>
        </div>
      )}

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {showHeadings && (
            <span className="text-muted-foreground">{t.tags}:</span>
          )}
          <Tag className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
