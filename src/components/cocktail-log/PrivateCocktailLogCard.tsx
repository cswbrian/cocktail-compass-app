import { useState } from 'react';
import { CocktailLog } from '@/types/cocktail-log';
import { CocktailLogDetail } from './CocktailLogDetail';
import { CocktailLogMedia } from './CocktailLogMedia';
import {
  DateInfo,
  LocationInfo,
  CommentInfo,
} from './CocktailLogInfo';
import { useLanguage } from '@/context/LanguageContext';
import { formatBilingualText } from '@/lib/utils';

interface PrivateCocktailLogCardProps {
  log: CocktailLog;
  onLogSaved?: () => void;
  onLogDeleted?: () => void;
  onLogsChange?: (logs: CocktailLog[]) => void;
}

export function PrivateCocktailLogCard({
  log,
  onLogSaved,
  onLogDeleted,
  onLogsChange,
}: PrivateCocktailLogCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { language } = useLanguage();

  const handleClick = () => {
    setIsDetailOpen(true);
    window.history.pushState(
      { logId: log.id },
      '',
      `/${language}/logs/${log.id}`,
    );
  };

  return (
    <>
      <div
        className="bg-background border-b rounded-none px-6 py-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleClick}
      >
        <div>
          {log.drinkDate && (
            <DateInfo
              date={new Date(log.drinkDate)}
              className="text-sm text-muted-foreground"
            />
          )}
          <h3 className="text-lg font-semibold">
            {formatBilingualText(
              log.cocktail.name,
              language,
            )}
          </h3>
          <div className="space-y-2">
            <LocationInfo location={log.location} />
            <CommentInfo comments={log.comments} />

            {log.media && log.media.length > 0 && (
              <div className="mt-2">
                <CocktailLogMedia
                  media={log.media}
                  size="sm"
                />
              </div>
            )}
          </div>
        </div>
      </div>

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
        variant={
          log.visibility === 'public' ? 'public' : 'private'
        }
      />
    </>
  );
}
