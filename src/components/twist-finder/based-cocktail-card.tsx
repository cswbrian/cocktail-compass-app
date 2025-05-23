import { Cocktail } from '@/types/cocktail';
import FlavorRadar from '@/components/flavor-radar';
import { flavorColorMap } from '@/constants';
import { useLanguage } from '@/context/LanguageContext';
import { FlavorDescriptor } from '@/components/flavor-descriptor';
import { translations } from '@/translations';

interface BasedCocktailCardProps {
  cocktail: Cocktail;
  hideTitle?: boolean;
}

export function BasedCocktailCard({
  cocktail,
  hideTitle = false,
}: BasedCocktailCardProps) {
  const { language } = useLanguage();
  const t =
    translations[language as keyof typeof translations];
  const getColor = (cocktail: Cocktail) => {
    if (!cocktail.flavor_descriptors?.length)
      return 'rgba(255, 185, 0, 0.5)';
    const firstFlavor =
      cocktail.flavor_descriptors[0].en.toLowerCase();
    return (
      flavorColorMap[firstFlavor] ||
      'rgba(255, 185, 0, 0.5)'
    );
  };

  return (
    <div>
      {!hideTitle && (
        <div className="mb-4 flex justify-between items-start gap-x-2">
          <div>
            <h3 className="text-4xl mb-1">
              {cocktail.name.en}
            </h3>
            {language === 'zh' && (
              <div className="text-gray-400">
                {cocktail.name.zh}
              </div>
            )}
          </div>
        </div>
      )}
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

      <div className="mt-8">
        <FlavorRadar
          flavorProfile={cocktail.flavor_profile}
          t={t}
          color={getColor(cocktail)}
        />
      </div>

      <div className="mt-4">
        <h4 className="text-gray-400">{t.ingredients}</h4>
        <ul className="mt-1">
          {[
            ...cocktail.base_spirits,
            ...cocktail.liqueurs,
            ...cocktail.ingredients,
          ].map((item, index) => (
            <li
              key={index}
              className="flex justify-between"
            >
              {item.name[language]}
              <span className="text-gray-400">
                {item.amount} {item.unit[language]}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
