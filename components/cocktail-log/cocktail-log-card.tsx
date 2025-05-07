import { CocktailLog } from "@/types/cocktail-log";
import { Star, MapPin, User, Calendar } from "lucide-react";

interface CocktailLogCardProps {
  log: CocktailLog;
  cocktailName: string;
  onClick?: () => void;
}

export function CocktailLogCard({ log, cocktailName, onClick }: CocktailLogCardProps) {

  return (
    <div
      className="p-6 border-b hover:bg-accent/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex flex-col gap-4">
        {/* Header with date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {log.drinkDate && (
            <span>
              {new Date(log.drinkDate).toLocaleString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          )}
        </div>

        {/* Main content */}
        <div className="space-y-3">
          <h3 className="text-xl">{cocktailName}</h3>
          
          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= log.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {log.rating}/5
            </span>
          </div>

          {/* Location and Bartender */}
          {(log.location || log.bartender) && (
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              {log.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{log.location}</span>
                </div>
              )}
              {log.bartender && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{log.bartender}</span>
                </div>
              )}
            </div>
          )}

          {/* Comments */}
          {log.comments && (
            <p className="text-sm whitespace-pre-wrap">{log.comments}</p>
          )}

          {/* Tags */}
          {log.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {log.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-secondary rounded-full text-secondary-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 