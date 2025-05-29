import { CocktailLog } from '@/types/cocktail-log';
import { CocktailLogMedia } from './CocktailLogMedia';
import { CommentInfo } from './CocktailLogInfo';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from 'react-router-dom';
import { formatBilingualText } from '@/lib/utils';
import { MartiniIcon } from 'lucide-react';

interface ConsolidatedCocktailLogCardProps {
  logs: CocktailLog[];
}

export function ConsolidatedCocktailLogCard({
  logs,
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
      <div className="mt-6 space-y-4">
        {logs.map(log => (
          <div key={log.id}>
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
            <CommentInfo
              comments={log.comments}
              // className="text-muted-foreground"
            />
          </div>
        ))}
      </div>

      {/* Display consolidated media */}
      {consolidatedMedia.length > 0 && (
        <div
          className="mt-4"
          onClick={e => e.stopPropagation()}
        >
          <CocktailLogMedia
            media={consolidatedMedia}
            size="lg"
          />
        </div>
      )}
    </div>
  );
}
