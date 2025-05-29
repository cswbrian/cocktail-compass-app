import { Visit } from '@/types/visit';
import { ConsolidatedCocktailLogCard } from '@/components/cocktail-log/ConsolidatedCocktailLogCard';
import { LocationInfo } from '../cocktail-log/CocktailLogInfo';
import { CommentInfo } from '../cocktail-log/CocktailLogInfo';
import { DateInfo } from '../cocktail-log/CocktailLogInfo';
import { useLanguage } from '@/context/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import { VisibilityIndicator } from '../common/VisibilityIndicator';

interface VisitCardProps {
  visit: Visit;
  feedType?: 'recommend' | 'my';
}

export function VisitCard({
  visit,
  feedType = 'recommend',
}: VisitCardProps) {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/${language}/visits/${visit.id}`);
  };

  return (
    <div
      className="bg-background border-b rounded-none px-6 py-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            {feedType === 'recommend' && (
              <Link
                to={`/${language}/drinkers/${visit.user.username}`}
                className="font-bold"
                onClick={e => e.stopPropagation()}
              >
                <span>{visit.user.username}</span>
              </Link>
            )}
            {visit.visitDate && (
              <DateInfo
                date={new Date(visit.visitDate)}
                className="text-base text-muted-foreground"
              />
            )}
            {feedType === 'my' && (
              <VisibilityIndicator visibility={visit.visibility} />
            )}
          </div>
          {visit.location && (
            <LocationInfo location={visit.location} />
          )}
          {visit.comments && (
            <CommentInfo
              comments={visit.comments}
              className="mt-4"
            />
          )}
        </div>
      </div>
      {visit.logs.length > 0 && (
        <div className="mt-4">
          <ConsolidatedCocktailLogCard logs={visit.logs} />
        </div>
      )}
    </div>
  );
}
