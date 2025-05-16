"use client";

import { useState } from "react";
import { translations } from "@/translations";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

type Language = "en" | "zh";
type TranslationKey = keyof typeof translations.en;
type TranslationValue = (typeof translations.en)[TranslationKey];
type Translations = Record<Language, Record<TranslationKey, TranslationValue>>;

const PREFERENCE_OPTIONS = [
  {
    id: "sweet",
    labelKey: "moreSweet" as TranslationKey,
    emoji: "🍬",
  },
  {
    id: "balanced",
    labelKey: "balanced" as TranslationKey,
    emoji: "⚖️",
  },
  {
    id: "tart",
    labelKey: "moreTart" as TranslationKey,
    emoji: "🍋",
  },
];

interface SweetTartPreferenceProps {
  onSelect: (preference: string) => void;
  onBack: () => void;
}

export function SweetTartPreference({
  onSelect,
}: SweetTartPreferenceProps) {
  const params = useParams();
  const language = (params?.language as Language) || "en";
  const t = (translations as Translations)[language];
  const [selectedPreference, setSelectedPreference] = useState<string | null>(
    null
  );

  const handleSelect = (preference: string) => {
    setSelectedPreference(preference);
    onSelect(preference);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h2 className="text-3xl mb-4 text-center text-white">
        {t.expressSelectPreference}
      </h2>
      <p className="text-lg mb-8 text-center text-white/80">
        {t.expressPreferenceQuestion}
      </p>
      <div className="flex flex-col gap-4 w-full max-w-4xl">
        {PREFERENCE_OPTIONS.map((option) => (
          <motion.button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={`flex flex-col items-center justify-center p-6 rounded-xl text-xl font-semibold transition-all duration-200 border-2
              ${
                selectedPreference === option.id
                  ? "border-white bg-white/10 text-white scale-105"
                  : "border-white/50 text-white/80 hover:bg-white/5 hover:border-white"
              }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Select ${option.id} preference`}
          >
            <span className="text-3xl mb-2">{option.emoji}</span>
            <span className="text-center font-bold">{t[option.labelKey]}</span>
            <span className="mt-2 text-center opacity-80">
              {option.id === "sweet" && t.expressSweetDescription}
              {option.id === "balanced" && t.expressBalancedDescription}
              {option.id === "tart" && t.expressTartDescription}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
