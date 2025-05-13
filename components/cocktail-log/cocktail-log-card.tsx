import { useState } from "react";
import { CocktailLog } from "@/types/cocktail-log";
import { CocktailLogDetail } from "./cocktail-log-detail";
import { CocktailLogMedia } from "./cocktail-log-media";
import { CocktailLogInfo } from "./cocktail-log-info";
import { format } from "date-fns";

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
        className="bg-background border-b rounded-none px-6 py-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setIsDetailOpen(true)}
      >
        <div>
          {log.drinkDate && (
            <div className="text-sm text-muted-foreground">
              {format(new Date(log.drinkDate), "PPP")}
            </div>
          )}
          <h3 className="text-lg font-semibold">{log.cocktailName}</h3>
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
