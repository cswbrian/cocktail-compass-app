import { CocktailLog } from '@/types/cocktail-log';
import { CocktailLogMedia } from './CocktailLogMedia';
import {
  LocationInfo,
  CommentInfo,
} from './CocktailLogInfo';
import { useLanguage } from '@/context/LanguageContext';
import { formatBilingualText } from '@/lib/utils';


interface CocktailLogCardProps {
  log: CocktailLog;
  onLogSaved?: () => void;
  onLogDeleted?: () => void;
  onLogsChange?: (logs: CocktailLog[]) => void;
}

export function CocktailLogCard({
  log,
}: CocktailLogCardProps) {
  const { language } = useLanguage();

  return (
    <>
      <div
        className="bg-background border-b rounded-none py-4 transition-shadow"
      >
        <div className="flex items-start space-x-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mt-1">
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
      </div>
    </>
  );
}
