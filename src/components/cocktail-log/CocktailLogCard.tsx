import { useState, useEffect } from "react";
import { CocktailLog } from "@/types/cocktail-log";
import { CocktailLogDetail } from "./CocktailLogDetail";
import { CocktailLogMedia } from "./CocktailLogMedia";
import { CocktailLogInfo } from "./CocktailLogInfo";
import { format } from "date-fns";
import { useLanguage } from "@/context/LanguageContext";
import { formatCocktailName } from "@/lib/utils";

interface CocktailLogCardProps {
  log: CocktailLog;
  onLogSaved?: () => void;
  onLogDeleted?: () => void;
  onLogsChange?: (logs: CocktailLog[]) => void;
}

export function CocktailLogCard({
  log,
  onLogSaved,
  onLogDeleted,
  onLogsChange,
}: CocktailLogCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { language } = useLanguage();

  const handleClick = () => {
    setIsDetailOpen(true);
    // Update URL without navigation
    window.history.pushState({ logId: log.id }, '', `/${language}/logs/${log.id}`);
  };

  useEffect(() => {
    const handlePopState = () => {
      if (isDetailOpen) {
        setIsDetailOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isDetailOpen]);

  return (
    <>
      <div
        className="bg-background border-b rounded-none px-6 py-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleClick}
      >
        <div>
          {log.drinkDate && (
            <div className="text-sm text-muted-foreground">
              {format(new Date(log.drinkDate), "PPP")}
            </div>
          )}
          <h3 className="text-lg font-semibold">{formatCocktailName(log.cocktail.name, language)}</h3>
          <div className="space-y-2">
            <CocktailLogInfo
              rating={log.rating}
              location={log.location}
              bartender={log.bartender}
              comments={log.comments}
              tags={log.tags}
              drinkDate={null}
              className="text-sm text-muted-foreground"
              commentClassName="text-base text-foreground"
            />

            {log.media && log.media.length > 0 && (
              <CocktailLogMedia media={log.media} size="sm" />
            )}
          </div>
        </div>
      </div>

      <CocktailLogDetail
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          // Go back in history when closing manually
          window.history.back();
        }}
        log={log}
        onLogSaved={onLogSaved}
        onLogDeleted={onLogDeleted}
        onLogsChange={onLogsChange}
      />
    </>
  );
}
