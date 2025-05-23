'use client';

import { Cocktail } from '@/types/cocktail';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { FlavorDescriptor } from '@/components/flavor-descriptor';
import { Button } from '@/components/ui/button';
import { ShareButton } from '@/components/share-button';
import { sendGAEvent } from '@/lib/ga';
import { Link } from 'react-router-dom';

interface CocktailCardProps {
  cocktail: Cocktail;
  distance?: number;
  variant?: 'default' | 'compact';
}

export function CocktailCard({
  cocktail,
  distance,
  variant = 'default',
}: CocktailCardProps) {
  const { language } = useLanguage();
  const t =
    translations[language as keyof typeof translations];

  const cocktailPath = `/${language}/cocktails/${cocktail.slug}`;
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${cocktailPath}`
      : '';

  const handleClick = () => {
    sendGAEvent(
      'cocktail_card',
      'view_details',
      `card_click:${cocktail.name.en}`,
    );
  };

  const handleSeeMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sendGAEvent(
      'cocktail_card',
      'view_details',
      `see_more_button:${cocktail.name.en}`,
    );
  };

  if (variant === 'compact') {
    return (
      <Link to={cocktailPath} onClick={handleClick}>
        <div className="relative border border-white/20 rounded-3xl bg-white/5 backdrop-blur-xs p-4 cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:scale-[1.02] group">
          <div className="absolute inset-0 rounded-3xl bg-linear-to-r from-orange-500/20 to-teal-500/20 blur-xl group-hover:blur-2xl transition-all duration-300 opacity-50 group-hover:opacity-70" />
          <div className="relative">
            <div className="flex justify-between items-start gap-x-2">
              <div>
                <h3 className="text-xl mb-1 text-white/90">
                  {cocktail.name.en}
                </h3>
                {language === 'zh' && (
                  <div className="text-white/60">
                    {cocktail.name.zh}
                  </div>
                )}
              </div>
              {typeof distance === 'number' && (
                <div className="text-sm px-2 py-1 bg-white/10 backdrop-blur-xs rounded-full whitespace-nowrap text-white/80">
                  {`${t.similarity}: ${(100 - Math.min(distance, 100)).toFixed(1)}`}
                </div>
              )}
            </div>
            {cocktail.flavor_descriptors && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-2">
                  {cocktail.flavor_descriptors.map(
                    (descriptor, i) => (
                      <FlavorDescriptor
                        key={i}
                        descriptor={descriptor}
                        language={language}
                        onClick={e => e.stopPropagation()}
                      />
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={cocktailPath} onClick={handleClick}>
      <div className="relative border border-white/20 rounded-3xl bg-white/5 backdrop-blur-xs p-6 cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:scale-[1.02] group">
        <div className="absolute inset-0 rounded-3xl bg-linear-to-r from-orange-500/20 to-teal-500/20 blur-xl group-hover:blur-2xl transition-all duration-300 opacity-50 group-hover:opacity-70" />
        <div className="relative">
          <div className="mb-4 flex justify-between items-start gap-x-2">
            <div>
              <h3 className="text-2xl mb-1 text-white/90">
                {cocktail.name.en}
              </h3>
              {language === 'zh' && (
                <div className="text-white/60">
                  {cocktail.name.zh}
                </div>
              )}
            </div>
            {typeof distance === 'number' && (
              <div className="text-sm px-3 py-1.5 bg-white/10 backdrop-blur-xs rounded-full whitespace-nowrap text-white/80">
                {`${t.similarity}: ${(100 - Math.min(distance, 100)).toFixed(1)}`}
              </div>
            )}
          </div>
          {cocktail.flavor_descriptors && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {cocktail.flavor_descriptors.map(
                  (descriptor, i) => (
                    <FlavorDescriptor
                      key={i}
                      descriptor={descriptor}
                      language={language}
                      onClick={e => e.stopPropagation()}
                    />
                  ),
                )}
              </div>
            </div>
          )}

          <div className="mt-4">
            <h4 className="text-white/60">
              {t.ingredients}
            </h4>
            <ul className="mt-1">
              {[
                ...cocktail.base_spirits,
                ...cocktail.liqueurs,
                ...cocktail.ingredients,
              ].map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between text-white/80"
                >
                  {item.name[language]}
                  <span className="text-white/60">
                    {item.amount} {item.unit[language]}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {cocktail.technique && (
            <div className="mt-4">
              <h4 className="text-white/60">
                {t.preparation}
              </h4>
              <p className="mt-1 text-white/80">
                {cocktail.technique[language]}
              </p>
            </div>
          )}

          {cocktail.garnish && (
            <div className="mt-4">
              <h4 className="text-white/60">{t.garnish}</h4>
              <p className="mt-1 text-white/80">
                {cocktail.garnish[language]}
              </p>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <Button
              onClick={handleSeeMoreClick}
              variant="secondary"
              className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-xs"
            >
              {t.seeMore}
            </Button>
            <ShareButton url={shareUrl} />
          </div>
        </div>
      </div>
    </Link>
  );
}
