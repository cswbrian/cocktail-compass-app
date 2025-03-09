"use client";

import { slugify } from "@/lib/utils";
import { Cocktail } from "@/types/cocktail";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { FlavorDescriptor } from "@/components/flavor-descriptor";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/share-button";
import { sendGAEvent } from '@next/third-parties/google'

interface CocktailCardProps {
  cocktail: Cocktail;
  distance?: number;
}

export function CocktailCard({ cocktail, distance }: CocktailCardProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  const cocktailPath = `/${language}/cocktails/${slugify(cocktail.name.en)}`;
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}${cocktailPath}`
    : "";

  const handleClick = () => {
    sendGAEvent('cocktail_card', {
      action: 'view_details',
      cocktail_name: cocktail.name.en,
      source: 'card_click'
    });
    router.push(cocktailPath);
  };

  const handleSeeMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sendGAEvent('cocktail_card', {
      action: 'view_details',
      cocktail_name: cocktail.name.en,
      source: 'see_more_button'
    });
    router.push(cocktailPath);
  };

  return (
    <div
      className="border rounded-3xl bg-neutral-900 p-6 cursor-pointer hover:bg-neutral-800 transition-colors"
      onClick={handleClick}
    >
      <div className="mb-4 flex justify-between items-start gap-x-2">
        <div>
          <h3 className="text-2xl mb-1">{cocktail.name.en}</h3>
          {language === "zh" && (
            <div className="text-gray-400 text-sm">{cocktail.name.zh}</div>
          )}
        </div>
        {typeof distance === 'number' && (
          <div className="text-sm px-2 py-1 bg-neutral-800 rounded-full whitespace-nowrap">
            {`${t.similarity}: ${(100 - Math.min(distance, 100)).toFixed(1)}`}
          </div>
        )}
      </div>
      {cocktail.flavor_descriptors && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {cocktail.flavor_descriptors.map((descriptor, i) => (
              <FlavorDescriptor
                key={i}
                descriptor={descriptor}
                language={language}
                onClick={(e) => e.stopPropagation()}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <h4 className="text-gray-400">{t.ingredients}</h4>
        <ul className="mt-1">
          {[
            ...cocktail.base_spirits,
            ...cocktail.liqueurs,
            ...cocktail.ingredients,
          ].map((item, index) => (
            <li key={index} className="flex justify-between">
              {item.name[language]}
              <span className="text-gray-400">
                {item.amount} {item.unit[language]}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {cocktail.technique && (
        <div className="mt-4">
          <h4 className="text-gray-400">{t.preparation}</h4>
          <p className="mt-1">{cocktail.technique[language]}</p>
        </div>
      )}

      {cocktail.garnish && (
        <div className="mt-4">
          <h4 className="text-gray-400">{t.garnish}</h4>
          <p className="mt-1">{cocktail.garnish[language]}</p>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Button
          onClick={handleSeeMoreClick}
          variant="default"
          className="flex-1 bg-white text-black hover:bg-gray-200"
        >
          {t.seeMore}
        </Button>
        <ShareButton 
          url={shareUrl} 
          onClick={(e) => e.stopPropagation()} 
        />
      </div>
    </div>
  );
}
