"use client";

import { slugify } from "@/lib/utils";
import { Cocktail } from "@/types/cocktail";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";

interface CocktailCardProps {
  cocktail: Cocktail;
}

export function CocktailCard({ cocktail }: CocktailCardProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  const handleClick = () => {
    router.push(`/${language}/cocktails/${slugify(cocktail.name.en)}`);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/${language}/cocktails/${slugify(cocktail.name.en)}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div 
      className="border rounded-3xl bg-neutral-900 p-6 cursor-pointer hover:bg-neutral-800 transition-colors"
      onClick={handleClick}
    >
      <div className="mb-4">
        <h3 className="text-2xl mb-1">{cocktail.name.en}</h3>
        {language === "zh" && (
          <div className="text-gray-400 text-xs">{cocktail.name.zh}</div>
        )}
      </div>
      {cocktail.flavor_descriptors && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {cocktail.flavor_descriptors.map((descriptor, i) => (
              <Link 
                href={`/${language}/flavours/${slugify(descriptor.en)}`}
                key={i}
                className="bg-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-600 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {descriptor[language]}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <h4 className="text-gray-400">{t.ingredients}</h4>
        <ul className="mt-1">
          {[...cocktail.base_spirits, ...cocktail.liqueurs, ...cocktail.ingredients].map(
            (item, index) => (
              <li key={index} className="flex justify-between">
                {item.name[language]}
                <span className="text-gray-400">
                  {item.amount} {item.unit[language]}
                </span>
              </li>
            )
          )}
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

      <button 
        onClick={(e) => {
          e.stopPropagation();
          handleShare();
        }}
        className="mt-4 w-full px-3 py-2 text-sm bg-neutral-700 hover:bg-neutral-600 rounded-full"
      >
        {t.share}
      </button>
    </div>
  );
} 