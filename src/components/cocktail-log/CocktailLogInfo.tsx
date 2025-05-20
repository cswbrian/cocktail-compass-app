import { MapPin, Calendar, Eye } from "lucide-react";
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
  location: string | null;
  comments: string | null;
  drinkDate: Date | null;
  visibility?: "public" | "private";
  showHeadings?: boolean;
  className?: string;
  commentClassName?: string;
}

export function CocktailLogInfo({
  location,
  comments,
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

  const formatCommentWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        const cleanUrl = part.replace(/^https?:\/\//, '');
        const displayUrl = cleanUrl.length > 15 ? cleanUrl.substring(0, 12) + '...' : cleanUrl;
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {displayUrl}
          </a>
        );
      }
      return part;
    });
  };

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

      {drinkDate && (
        <div className="flex items-center gap-2">
          {showHeadings && (
            <span className="text-muted-foreground">{t.drinkDate}</span>
          )}
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{format(drinkDate, "PPP")}</span>
        </div>
      )}

      {comments && (
        <div className="flex flex-col gap-2">
          {showHeadings && (
            <span className="text-muted-foreground">{t.notePlaceholder}</span>
          )}
          <p className={cn("whitespace-pre-wrap break-words max-w-full", commentClassName)}>
            {formatCommentWithLinks(comments)}
          </p>
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
