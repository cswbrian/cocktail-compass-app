"use client";

import { motion } from "framer-motion";
import { translations } from "@/translations";
import { useParams } from "next/navigation";
import { CocktailCard } from "@/components/cocktail-card";
import { sendGAEvent } from "@next/third-parties/google";
import { useEffect } from "react";
import { cocktailService } from "@/services/cocktail-service";
import { Navigation } from "./navigation";

type Language = "en" | "zh";
type TranslationKey = keyof typeof translations.en;
type TranslationValue = (typeof translations.en)[TranslationKey];
type Translations = Record<Language, Record<TranslationKey, TranslationValue>>;

type Category =
  | "Strong & Spirit-Focused"
  | "Sweet & Tart"
  | "Tall & Bubbly"
  | "Rich & Creamy";

interface ResultsProps {
  category: Category;
  preference?: string;
  spirit?: string;
  onBack: () => void;
}

export function Results({
  category,
  preference,
  spirit,
  onBack,
}: ResultsProps) {
  const params = useParams();
  const language = (params?.language as Language) || "en";
  const t = (translations as Translations)[language];

  const results = cocktailService.getCocktailsByMood(
    category,
    spirit,
    preference
  );

  useEffect(() => {
    if (results.length > 0) {
      sendGAEvent("express_suggestion_results", {
        category,
        preference,
        spirit,
        cocktails: results.map((cocktail) => ({
          name: cocktail.name[language],
        })),
      });
    }
  }, [results, language, category, preference, spirit]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="p-4"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl mb-8 text-center text-white">
          {t.expressResultsTitle}
        </h2>
        <div className="mt-8 flex flex-col gap-y-6">
          {results.map((cocktail, index) => (
            <motion.div
              key={cocktail.name[language]}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <CocktailCard cocktail={cocktail} distance={cocktail.distance} />
            </motion.div>
          ))}
        </div>
        <Navigation onBack={onBack} />
      </div>
    </motion.div>
  );
}
