import { getLocalizedText } from '@/lib/utils';
import { Link, useParams } from 'react-router-dom';
import FlavorRadar from '@/components/flavor-radar';
import { translations } from '@/translations';
import ReactMarkdown from 'react-markdown';
import { FlavorDescriptor } from '@/components/flavor-descriptor';
import { ShareButton } from '@/components/ShareButton';
import { BookmarkButton } from '@/components/bookmark/bookmark-button';
import { ExternalLink } from '@/components/external-link';
import { Search } from 'lucide-react';
import { flavorColorMap } from '@/constants';
import { TwistButton } from '@/components/twist-button';
import { cocktailService } from '@/services/cocktail-service';
import { CocktailLogList } from '@/components/cocktail-log/CocktailLogList';
import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { cocktailLogService } from '@/services/cocktail-log-service';
import { CocktailLog } from '@/types/cocktail-log';
import { Cocktail } from '@/types/cocktail';
import { BackButton } from '@/components/common/BackButton';

interface CocktailIngredientsProps {
  cocktail: Cocktail;
  language: string;
  t: (typeof translations)['en'];
}

function CocktailIngredients({
  cocktail,
  language,
  t,
}: CocktailIngredientsProps) {
  const hasIngredients = 
    cocktail.base_spirits.length > 0 || 
    cocktail.liqueurs.length > 0 || 
    cocktail.ingredients.length > 0;

  if (!hasIngredients) return null;

  return (
    <div className="grid grid-cols-1 gap-8">
      <div>
        <h2 className="font-bold mb-2">{t.ingredients}</h2>
        <ul className="space-y-2">
          {cocktail.base_spirits.map((spirit, i) => (
            <li key={i} className="flex justify-between">
              <Link
                to={`/${language || 'en'}/ingredients/${spirit.slug}`}
                className="hover:text-blue-400 transition-colors flex flex-wrap items-center gap-x-1"
              >
                {getLocalizedText(
                  spirit.name,
                  language || 'en',
                )}
                <Search className="w-4 h-4 text-muted-foreground" />
              </Link>
              <span className="text-gray-400">
                {spirit.amount}{' '}
                {getLocalizedText(
                  spirit.unit,
                  language || 'en',
                )}
              </span>
            </li>
          ))}
          {cocktail.liqueurs.map((liqueur, i) => (
            <li key={i} className="flex justify-between">
              <Link
                to={`/${language || 'en'}/ingredients/${liqueur.id}`}
                className="hover:text-blue-400 transition-colors flex flex-wrap items-center gap-x-1"
              >
                {getLocalizedText(
                  liqueur.name,
                  language || 'en',
                )}
                <Search className="w-4 h-4 text-muted-foreground" />
              </Link>
              <span className="text-gray-400">
                {liqueur.amount}{' '}
                {getLocalizedText(
                  liqueur.unit,
                  language || 'en',
                )}
              </span>
            </li>
          ))}
          {cocktail.ingredients.map((ingredient, i) => (
            <li key={i} className="flex justify-between">
              <Link
                to={`/${language || 'en'}/ingredients/${ingredient.id}`}
                className="hover:text-blue-400 transition-colors flex flex-wrap items-center gap-x-1"
              >
                {getLocalizedText(
                  ingredient.name,
                  language || 'en',
                )}
                <Search className="w-4 h-4 text-muted-foreground" />
              </Link>
              <span className="text-gray-400">
                {ingredient.amount}{' '}
                {getLocalizedText(
                  ingredient.unit,
                  language || 'en',
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {cocktail.garnish && (
        <div>
          <h4 className="text-gray-400">{t.garnish}</h4>
          <p className="text-gray-300">
            {getLocalizedText(
              cocktail.garnish,
              language || 'en',
            )}
          </p>
        </div>
      )}

      <ExternalLink message={t.feedbackMessage} />
    </div>
  );
}

export default function CocktailDetails() {
  const { language, slug } = useParams();
  const t =
    translations[language as keyof typeof translations] ||
    translations.en;
  const [page, setPage] = useState(1);
  const [accumulatedLogs, setAccumulatedLogs] = useState<
    CocktailLog[]
  >([]);
  const PAGE_SIZE = 10;

  const { data: cocktail, isLoading: isLoadingCocktail } =
    useSWR(['cocktail', slug], async () => {
      if (!slug) return null;
      return await cocktailService.getCocktailBySlug(slug);
    });

  const { data: logsData, isLoading: isLoadingLogs } =
    useSWR(
      ['cocktail-logs', cocktail?.id, page],
      async () => {
        if (!cocktail?.id)
          return { logs: [], hasMore: false };
        const result =
          await cocktailLogService.getLogsByCocktailId(
            cocktail.id,
            page,
            PAGE_SIZE,
          );
        return result;
      },
      {
        fallbackData: { logs: [], hasMore: false },
        onSuccess: data => {
          if (page === 1) {
            setAccumulatedLogs(data.logs);
          } else {
            setAccumulatedLogs(prev => [
              ...prev,
              ...data.logs,
            ]);
          }
        },
      },
    );

  const loadMore = useCallback(() => {
    if (logsData?.hasMore && !isLoadingLogs) {
      setPage(prev => prev + 1);
    }
  }, [logsData?.hasMore, isLoadingLogs]);

  if (isLoadingCocktail) return <div>Loading...</div>;
  if (!cocktail) return null;

  // Get the first flavor descriptor's color
  const color =
    cocktail.flavor_descriptors &&
    cocktail.flavor_descriptors.length > 0
      ? flavorColorMap[
          cocktail.flavor_descriptors[0].en.toLowerCase()
        ] || 'rgba(255, 185, 0, 0.5)'
      : 'rgba(255, 185, 0, 0.5)';

  return (
    <div>
      <div className="px-6">
        <BackButton to={`/${language}/feeds`} />
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-4xl mb-2">
              {cocktail.name.en}
            </h1>
            {language === 'zh' && (
              <div className="text-gray-400">
                {cocktail.name.zh}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 items-end">
            <div className="flex gap-2">
              <BookmarkButton cocktailId={cocktail.id} />
              <ShareButton
                url={window.location.href}
              />
            </div>
            {cocktail.is_custom ? null : (
              <TwistButton cocktailSlug={cocktail.slug}>
                {t.findTwists}
              </TwistButton>
            )}
          </div>
        </div>

        {cocktail.is_custom ? (
          <>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-4">
                {t.customCocktailDescription}
              </p>
            </div>
            <CocktailIngredients
              cocktail={cocktail}
              language={language || 'en'}
              t={t}
            />
          </>
        ) : (
          <>
            {cocktail.flavor_descriptors && (
              <div className="mb-6">
                <h2 className="font-bold mb-2">
                  {t.flavorNotes}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {cocktail.flavor_descriptors.map(
                    (descriptor, i) => (
                      <FlavorDescriptor
                        key={i}
                        descriptor={descriptor}
                        language={language || 'en'}
                      />
                    ),
                  )}
                </div>
              </div>
            )}

            <div className="mt-8">
              <FlavorRadar
                flavorProfile={cocktail.flavor_profile}
                t={t}
                color={color}
              />
            </div>

            <CocktailIngredients
              cocktail={cocktail}
              language={language || 'en'}
              t={t}
            />

            <div>
              <h2 className="font-bold mb-4">
                {t.instructions}
              </h2>
              <p className="text-gray-300">
                {cocktail.technique
                  ? getLocalizedText(
                      cocktail.technique,
                      language || 'en',
                    )
                  : ''}
              </p>
            </div>

            {cocktail.description && (
              <div className="mt-8 text-gray-300 prose prose-invert">
                <ReactMarkdown>
                  {getLocalizedText(
                    cocktail.description,
                    language || 'en',
                  )}
                </ReactMarkdown>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-8">
        <CocktailLogList
          logs={accumulatedLogs}
          isLoading={isLoadingLogs}
          hasMore={logsData?.hasMore}
          onLoadMore={loadMore}
        />
      </div>
    </div>
  );
}
