import { useState, useEffect } from "react";
import { CocktailLog } from "@/types/cocktail-log";
import { CocktailLogDetail } from "./CocktailLogDetail";
import { CocktailLogMedia } from "./CocktailLogMedia";
import { CocktailLogInfo } from "./CocktailLogInfo";
import { format } from "date-fns";
import { useLanguage } from "@/context/LanguageContext";
import { formatBilingualText } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { cocktailLogService } from "@/services/cocktail-log-service";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";

// Add constant for cheers reaction
const CHEERS_REACTION = 'cheers';

interface CocktailLogCardProps {
  log: CocktailLog;
  onLogSaved?: () => void;
  onLogDeleted?: () => void;
  onLogsChange?: (logs: CocktailLog[]) => void;
  variant?: "public" | "private";
}

export function CocktailLogCard({
  log,
  onLogSaved,
  onLogDeleted,
  onLogsChange,
  variant = "private",
}: CocktailLogCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { language } = useLanguage();
  const { user } = useAuth();
  const [isCheered, setIsCheered] = useState(log.has_cheered || false);
  const [cheerCount, setCheerCount] = useState(log.reactions?.[CHEERS_REACTION] || 0);

  const handleClick = () => {
    setIsDetailOpen(true);
    window.history.pushState(
      { logId: log.id },
      "",
      `/${language}/logs/${log.id}`
    );
  };

  const handleCheer = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to cheer a cocktail log",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isCheered) {
        await cocktailLogService.removeReaction(log.id, user.id);
        setCheerCount((prev) => Math.max(0, prev - 1));
      } else {
        await cocktailLogService.addReaction(log.id, user.id);
        setCheerCount((prev) => prev + 1);
      }
      setIsCheered(!isCheered);
    } catch (error) {
      console.error("Error toggling cheer:", error);
      toast({
        title: "Error",
        description: "Failed to update cheer status",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      if (isDetailOpen) {
        setIsDetailOpen(false);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isDetailOpen]);

  const renderPublicCard = () => (
    <div
      className="bg-background border-b rounded-none px-6 py-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <Link
              to={`/${language}/drinkers/${log.user?.username}`}
              className="font-medium text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              <span>{log.user?.username || "??"}</span>
            </Link>
            {log.drinkDate && (
              <span className="text-base text-muted-foreground">
                {format(new Date(log.drinkDate), "PPP")}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold mt-1">
            {formatBilingualText(log.cocktail.name, language)}
          </h3>
          <div className="space-y-2">
            <CocktailLogInfo
              location={log.location ?? null}
              comments={log.comments ?? null}
              drinkDate={null}
              className="text-sm text-muted-foreground"
              commentClassName="text-base text-foreground"
            />

            {log.media && log.media.length > 0 && (
              <div className="mt-2">
                <CocktailLogMedia media={log.media} size="sm" />
              </div>
            )}

            <div className="flex items-center space-x-4 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="p-0 hover:bg-transparent cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCheer();
                }}
              >
                <Heart
                  className={`h-4 w-4 ${isCheered ? "fill-current" : ""}`}
                />
                <span>{cheerCount}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivateCard = () => (
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
        <h3 className="text-lg font-semibold">
          {formatBilingualText(log.cocktail.name, language)}
        </h3>
        <div className="space-y-2">
          <CocktailLogInfo
            location={log.location ?? null}
            comments={log.comments ?? null}
            drinkDate={null}
            className="text-sm text-muted-foreground"
            commentClassName="text-base text-foreground"
          />

          {log.media && log.media.length > 0 && (
            <div className="mt-2">
              <CocktailLogMedia media={log.media} size="sm" />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {variant === "public" ? renderPublicCard() : renderPrivateCard()}

      <CocktailLogDetail
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
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
