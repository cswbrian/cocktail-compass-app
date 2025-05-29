import { CocktailLog } from '@/types/cocktail-log';
import { CocktailLogMedia } from './CocktailLogMedia';
import { CommentInfo } from './CocktailLogInfo';
import { useLanguage } from '@/context/LanguageContext';
import { formatBilingualText } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { MartiniIcon } from 'lucide-react';

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
      <div className="bg-background border-b rounded-none py-4 transition-shadow">
        <div className="flex items-start space-x-4">
          <div className="flex-1">
            <Link
              to={`/${language}/cocktails/${log.cocktail.slug}`}
              className="inline-flex hover:text-primary transition-colors"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <MartiniIcon className="w-4 h-4 size-4 text-muted-foreground" />
                <h3 className="text-primary hover:underline transition-colors">
                  {formatBilingualText(
                    log.cocktail.name,
                    language,
                  )}
                </h3>
              </div>
            </Link>
            <div className="space-y-2">
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
