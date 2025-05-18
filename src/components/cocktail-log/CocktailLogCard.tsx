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
import { cocktailLogService } from "@/services/cocktail-log-service";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";

interface CocktailLogCardProps {
  log: CocktailLog;
  onLogSaved?: () => void;
  onLogDeleted?: () => void;
  onLogsChange?: (logs: CocktailLog[]) => void;
  variant?: 'public' | 'private';
}

export function CocktailLogCard({
  log,
  onLogSaved,
  onLogDeleted,
  onLogsChange,
  variant = 'private'
}: CocktailLogCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { language } = useLanguage();
  const { user } = useAuth();
  const [isCheered, setIsCheered] = useState(false);
  const [cheerCount, setCheerCount] = useState(log.reactions?.['cheers'] || 0);
  const [cheerReactionTypeId, setCheerReactionTypeId] = useState<string | null>(null);

  useEffect(() => {
    // Get the cheer reaction type ID
    const getCheerReactionType = async () => {
      try {
        const reactionTypes = await cocktailLogService.getReactionTypes();
        const cheerType = reactionTypes.find(type => type.name === 'cheers');
        if (cheerType) {
          setCheerReactionTypeId(cheerType.id);
        }
      } catch (error) {
        console.error('Error getting reaction types:', error);
      }
    };
    getCheerReactionType();
  }, []);

  useEffect(() => {
    // Check if the current user has cheered this log
    const checkUserReaction = async () => {
      if (!user || !cheerReactionTypeId) return;
      try {
        const { reactions } = await cocktailLogService.getReactions(log.id);
        const userReaction = reactions.find(r => 
          r.userId === user.id && r.reactionTypeId === cheerReactionTypeId
        );
        setIsCheered(!!userReaction);
      } catch (error) {
        console.error('Error checking user reaction:', error);
      }
    };
    checkUserReaction();
  }, [log.id, user, cheerReactionTypeId]);

  const handleClick = () => {
    setIsDetailOpen(true);
    window.history.pushState({ logId: log.id }, '', `/${language}/logs/${log.id}`);
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

    if (!cheerReactionTypeId) {
      toast({
        title: "Error",
        description: "Unable to process cheer action",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isCheered) {
        await cocktailLogService.removeReaction(log.id, user.id, cheerReactionTypeId);
        setCheerCount(prev => Math.max(0, prev - 1));
      } else {
        await cocktailLogService.addReaction(log.id, user.id, cheerReactionTypeId);
        setCheerCount(prev => prev + 1);
      }
      setIsCheered(!isCheered);
    } catch (error) {
      console.error('Error toggling cheer:', error);
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

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
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
            <span className="font-medium text-primary">{log.user?.username || '??'}</span>
            {log.drinkDate && (
              <span className="text-base text-muted-foreground">
                {format(new Date(log.drinkDate), "PPP")}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold mt-1">{formatBilingualText(log.cocktail.name, language)}</h3>
          <div className="space-y-2">
            <CocktailLogInfo
              rating={log.rating ?? null}
              location={log.location ?? null}
              bartender={log.bartender ?? null}
              comments={log.comments ?? null}
              tags={log.tags ?? null}
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
                <Heart className={`h-4 w-4 ${isCheered ? 'fill-current' : ''}`} />
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
        <h3 className="text-lg font-semibold">{formatBilingualText(log.cocktail.name, language)}</h3>
        <div className="space-y-2">
          <CocktailLogInfo
            rating={log.rating ?? null}
            location={log.location ?? null}
            bartender={log.bartender ?? null}
            comments={log.comments ?? null}
            tags={log.tags ?? null}
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
      {variant === 'public' ? renderPublicCard() : renderPrivateCard()}

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
