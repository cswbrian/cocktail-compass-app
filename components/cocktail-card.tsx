"use client";

import { slugify } from "@/lib/utils";
import { Cocktail } from "@/types/cocktail";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { FlavorDescriptor } from "@/components/flavor-descriptor";
import { toast } from "sonner";
import { Link } from "lucide-react";

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
    const url = `${window.location.origin}/${language}/cocktails/${slugify(
      cocktail.name.en
    )}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t.linkCopied || "Link copied!", {
        duration: 2000,
        position: "bottom-center",
      });
    } catch (err) {
      console.error(err);
      toast.error(t.copyFailed || "Failed to copy link");
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
        <button
          onClick={handleClick}
          className="flex-1 px-3 py-2 bg-white text-black hover:bg-gray-200 rounded-full font-medium"
        >
          {t.seeMore}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleShare();
          }}
          className="p-4 text-sm bg-neutral-700 hover:bg-neutral-600 rounded-full"
        >
          <Link className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
