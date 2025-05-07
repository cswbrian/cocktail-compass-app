import { Star, MapPin, User, Calendar } from "lucide-react";

interface CocktailLogInfoProps {
  rating: number;
  location?: string | null;
  bartender?: string | null;
  comments?: string | null;
  tags: string[];
  drinkDate?: Date | null;
  showHeadings?: boolean;
  className?: string;
}

export function CocktailLogInfo({
  rating,
  location,
  bartender,
  comments,
  tags,
  drinkDate,
  showHeadings = false,
  className = ''
}: CocktailLogInfoProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Date */}
      {drinkDate && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {new Date(drinkDate).toLocaleString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>
      )}


      {/* Location */}
      {location && (
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          {location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
          )}
        </div>
      )}

      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${
                star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          {rating}/5
        </span>
      </div>


      {/* Bartender */}
      {bartender && (
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          {bartender && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{bartender}</span>
            </div>
          )}
        </div>
      )}

      {/* Comments */}
      {comments && (
        <div className="space-y-2">
          {showHeadings && <h3 className="font-semibold">Notes</h3>}
          <p className="text-sm whitespace-pre-wrap">{comments}</p>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="space-y-2">
          {showHeadings && <h3 className="font-semibold">Tags</h3>}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-secondary rounded-full text-secondary-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 