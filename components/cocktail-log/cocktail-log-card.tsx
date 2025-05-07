import { useState } from "react";
import { CocktailLog } from "@/types/cocktail-log";
import { CocktailLogDetail } from "./cocktail-log-detail";
import { CocktailLogMedia } from "./cocktail-log-media";
import { CocktailLogInfo } from "./cocktail-log-info";

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

  return (
    <>
      <div
        className="bg-card border-b rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setIsDetailOpen(true)}
      >
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{log.cocktailName}</h3>
          
          <CocktailLogInfo
            rating={log.rating}
            location={log.location}
            bartender={log.bartender}
            comments={log.comments}
            tags={log.tags}
            drinkDate={log.drinkDate ? new Date(log.drinkDate) : null}
          />

          {log.media && log.media.length > 0 && (
            <CocktailLogMedia media={log.media} size="sm" />
          )}
        </div>
      </div>

      <CocktailLogDetail
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        log={log}
        cocktailName={log.cocktailName}
        onLogSaved={onLogSaved}
        onLogDeleted={onLogDeleted}
        onLogsChange={onLogsChange}
      />
    </>
  );
} 