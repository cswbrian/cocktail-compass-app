import { MapPin, User, Calendar, Tag, Eye } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface LocationData {
  id: string;
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
  visibility?: "public" | "private";
  showHeadings?: boolean;
  className?: string;
  commentClassName?: string;
}

export function CocktailLogInfo({
  rating,
  location,
  bartender,
  comments,
  tags,
  drinkDate,
  visibility,
  showHeadings = false,
  className,
  commentClassName,
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
    <div className={cn("space-y-1", className)}>
      {locationData && (
        <div className="flex items-center gap-2">
          {showHeadings && (
            <span className="text-muted-foreground">{t.location}</span>
          )}
          <MapPin className="size-4 text-muted-foreground" />
          <Link
            to={`/${language}/places/${locationData.place_id}`}
            className="hover:text-primary transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {locationData.main_text}
          </Link>
        </div>
      )}

      {bartender && (
        <div className="flex items-center gap-2">
          {showHeadings && (
            <span className="text-muted-foreground">{t.bartender}</span>
          )}
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{bartender}</span>
        </div>
      )}

      {drinkDate && (
        <div className="flex items-center gap-2">
          {showHeadings && (
            <span className="text-muted-foreground">{t.drinkDate}</span>
          )}
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{format(drinkDate, "PPP")}</span>
        </div>
      )}

      {rating && (
        <div className="flex items-center gap-2">
          {showHeadings && (
            <span className="text-muted-foreground">{t.rating}</span>
          )}
          <div className="flex items-center text-muted-foreground">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className="text-sm">
                {star <= rating ? "★" : "☆"}
              </span>
            ))}
          </div>
        </div>
      )}

      {comments && (
        <div className="flex flex-col gap-2">
          {showHeadings && (
            <span className="text-muted-foreground">{t.notePlaceholder}</span>
          )}
          <p className={cn("whitespace-pre-wrap", commentClassName)}>
            {comments}
          </p>
        </div>
      )}

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {showHeadings && (
            <span className="text-muted-foreground">{t.tags}</span>
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

      {visibility && (
        <div className="flex items-center gap-2">
          {showHeadings && (
            <span className="text-muted-foreground">{t.visibility}</span>
          )}
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span>
            {visibility === "public" ? t.visibilityPublic : t.visibilityPrivate}
          </span>
        </div>
      )}
    </div>
  );
}
