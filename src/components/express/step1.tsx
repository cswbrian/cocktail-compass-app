"use client";

import { useState } from "react";
import { translations } from "@/translations";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center p-4 h-[calc(100vh-8rem)] overflow-hidden"
    >
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-3xl mb-8 text-center"
      >
        {t.expressTitle}
      </motion.h1>
      <div className="grid grid-cols-2 gap-2 w-full max-w-4xl">
        {CATEGORIES.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              onClick={() => handleSelect(category.id)}
              className={`flex flex-col items-center justify-center p-6 rounded-xl text-xl font-semibold transition-all duration-200 border-2 bg-white/5 backdrop-blur-xs min-h-[200px] w-full
                ${
                  selectedCategory === category.id
                    ? "border-white bg-white/15 text-white scale-105"
                    : "border-white/50 text-white/80 hover:bg-white/10 hover:border-white"
                }`}
            >
              <span className="text-3xl mb-2">{category.emoji}</span>
              <span className="text-center font-bold text-2xl">{t[category.labelKey]}</span>
              <span className="text-sm font-bold mt-2 text-center opacity-80">
                {t[category.descKey]}
              </span>
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
