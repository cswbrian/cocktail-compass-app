"use client";

import { useState } from "react";
import { translations } from "@/translations";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

type Language = "en" | "zh";
type TranslationKey = keyof typeof translations.en;
type TranslationValue = (typeof translations.en)[TranslationKey];
type Translations = Record<Language, Record<TranslationKey, TranslationValue>>;

type Category =
  | "Strong & Spirit-Focused"
  | "Sweet & Tart"
  | "Tall & Bubbly"
  | "Rich & Creamy";

const CATEGORIES = [
  {
    id: "Strong & Spirit-Focused" as Category,
    labelKey: "expressStrong" as TranslationKey,
    descKey: "expressStrongDesc" as TranslationKey,
    emoji: "🥃",
  },
  {
    id: "Sweet & Tart" as Category,
    labelKey: "expressSweet" as TranslationKey,
    descKey: "expressSweetDesc" as TranslationKey,
    emoji: "🍹",
  },
  {
    id: "Tall & Bubbly" as Category,
    labelKey: "expressBubbly" as TranslationKey,
    descKey: "expressBubblyDesc" as TranslationKey,
    emoji: "🥂",
  },
  {
    id: "Rich & Creamy" as Category,
    labelKey: "expressCreamy" as TranslationKey,
    descKey: "expressCreamyDesc" as TranslationKey,
    emoji: "🍸",
  },
];

interface Step1Props {
  onSelect: (category: Category) => void;
}

export function Step1({ onSelect }: Step1Props) {
  const params = useParams();
  const language = (params?.language as Language) || "en";
  const t = (translations as Translations)[language];
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const handleSelect = (category: Category) => {
    setSelectedCategory(category);
    onSelect(category);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl mb-8 text-center">{t.expressTitle}</h1>
      <div className="grid grid-cols-2 gap-4 w-full max-w-4xl">
        {CATEGORIES.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => handleSelect(category.id)}
            className={`flex flex-col items-center justify-center p-6 rounded-xl text-xl font-semibold transition-all duration-200 border-2
              ${
                selectedCategory === category.id
                  ? "border-white bg-white/10 text-white scale-105"
                  : "border-white/50 text-white/80 hover:bg-white/5 hover:border-white"
              }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-3xl mb-2">{category.emoji}</span>
            <span className="text-center">{t[category.labelKey]}</span>
            <span className="text-sm mt-2 text-center opacity-80">
              {t[category.descKey]}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
