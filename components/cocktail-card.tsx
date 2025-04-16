"use client";

import { slugify } from "@/lib/utils";
import { Cocktail } from "@/types/cocktail";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { FlavorDescriptor } from "@/components/flavor-descriptor";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/share-button";
import { sendGAEvent } from "@next/third-parties/google";
import Link from "next/link";

interface CocktailCardProps {
  cocktail: Cocktail;
  distance?: number;
  variant?: 'default' | 'compact';
}

export function CocktailCard({ cocktail, distance, variant = 'default' }: CocktailCardProps) {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  const cocktailPath = `/${language}/cocktails/${slugify(cocktail.name.en)}`;
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${cocktailPath}`
      : "";

  const handleClick = () => {
    sendGAEvent("cocktail_card", {
      action: "view_details",
      cocktail_name: cocktail.name.en,
      source: "card_click",
    });
  };

  const handleSeeMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sendGAEvent("cocktail_card", {
      action: "view_details",
      cocktail_name: cocktail.name.en,
      source: "see_more_button",
    });
  };

  if (variant === 'compact') {
    return (
      <Link href={cocktailPath} onClick={handleClick}>
        <div className="border rounded-3xl bg-neutral-900 p-4 cursor-pointer hover:bg-neutral-800 transition-colors">
          <div className="flex justify-between items-start gap-x-2">
            <div>
              <h3 className="text-xl mb-1">{cocktail.name.en}</h3>
              {language === "zh" && (
                <div className="text-gray-400">{cocktail.name.zh}</div>
              )}
            </div>
            {typeof distance === "number" && (
              <div className="text-sm px-2 py-1 bg-neutral-800 rounded-full whitespace-nowrap">
                {`${t.similarity}: ${(100 - Math.min(distance, 100)).toFixed(1)}`}
              </div>
            )}
          </div>
          {cocktail.flavor_descriptors && (
            <div className="mt-2">
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
        </div>
      </Link>
    );
  }

  return (
    <Link href={cocktailPath} onClick={handleClick}>
      <div className="relative border border-white/20 rounded-3xl bg-white/5 backdrop-blur-sm p-6 cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:scale-[1.02] group">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-500/20 to-teal-500/20 blur-xl group-hover:blur-2xl transition-all duration-300 opacity-50 group-hover:opacity-70" />
        <div className="relative">
          <div className="mb-4 flex justify-between items-start gap-x-2">
            <div>
              <h3 className="text-2xl mb-1 text-white/90">{cocktail.name.en}</h3>
              {language === "zh" && (
                <div className="text-white/60">{cocktail.name.zh}</div>
              )}
            </div>
            {typeof distance === "number" && (
              <div className="text-sm px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full whitespace-nowrap text-white/80">
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
            <h4 className="text-white/60">{t.ingredients}</h4>
            <ul className="mt-1">
              {[
                ...cocktail.base_spirits,
                ...cocktail.liqueurs,
                ...cocktail.ingredients,
              ].map((item, index) => (
                <li key={index} className="flex justify-between text-white/80">
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
              <h4 className="text-white/60">{t.preparation}</h4>
              <p className="mt-1 text-white/80">{cocktail.technique[language]}</p>
            </div>
          )}

          {cocktail.garnish && (
            <div className="mt-4">
              <h4 className="text-white/60">{t.garnish}</h4>
              <p className="mt-1 text-white/80">{cocktail.garnish[language]}</p>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <Button
              onClick={handleSeeMoreClick}
              variant="secondary"
              className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-sm"
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
