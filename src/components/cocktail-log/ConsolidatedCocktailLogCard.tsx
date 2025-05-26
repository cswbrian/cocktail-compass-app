import { CocktailLog } from '@/types/cocktail-log';
import { CocktailLogMedia } from './CocktailLogMedia';
import { LocationInfo } from './CocktailLogInfo';
import { CommentInfo } from './CocktailLogInfo';
import { DateInfo } from './CocktailLogInfo';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from 'react-router-dom';
import { formatBilingualText } from '@/lib/utils';

interface ConsolidatedCocktailLogCardProps {
  logs: CocktailLog[];
  onLogSaved?: () => void;
  onLogDeleted?: () => void;
  onLogsChange?: (logs: CocktailLog[]) => void;
  variant?: 'public' | 'private';
}

export function ConsolidatedCocktailLogCard({
  logs,
  onLogSaved,
  onLogDeleted,
  onLogsChange,
  variant = 'private',
}: ConsolidatedCocktailLogCardProps) {
  const { language } = useLanguage();

  // Consolidate all media from all logs
  const consolidatedMedia = logs.flatMap(
    log =>
      log.media?.map(item => ({
        url: item.url,
        type: item.type,
      })) || [],
  );

  return (
    <div>
      {/* Display individual logs */}
      <div className="mt-4 space-y-2">
        {logs.map(log => (
          <div key={log.id}>
            <Link
              to={`/${language}/cocktails/${log.cocktail.slug}`}
              className="font-bold hover:text-primary transition-colors"
            >
              <h3>
                {formatBilingualText(
                  log.cocktail.name,
                  language,
                )}
              </h3>
            </Link>
            <CommentInfo
              comments={log.comments}
              className="text-muted-foreground"
            />
          </div>
        ))}
      </div>

      {/* Display consolidated media */}
      {consolidatedMedia.length > 0 && (
        <div className="mt-4">
          <CocktailLogMedia
            media={consolidatedMedia}
            size="lg"
          />
        </div>
      )}
    </div>
  );
}
