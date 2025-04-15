"use client";

import { useState } from "react";
import { translations } from "@/translations";
import { useParams } from "next/navigation";
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
  onBack,
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
      <h2 className="text-3xl mb-8 text-center text-white">
        {t.expressSelectPreference}
      </h2>
      <div className="grid grid-cols-3 gap-4 w-full max-w-4xl">
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
          >
            <span className="text-3xl mb-2">{option.emoji}</span>
            <span className="text-center">{t[option.labelKey]}</span>
          </motion.button>
        ))}
      </div>
      <button
        onClick={onBack}
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl text-white border-2 border-white/50 hover:border-white hover:bg-white/5 transition-all duration-200"
      >
        {language === "zh" ? "返回" : "Back"}
      </button>
    </div>
  );
}
