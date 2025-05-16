"use client";

import { useState } from "react";
import { translations } from "@/translations";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Navigation } from "./navigation";

type Language = "en" | "zh";
type TranslationKey = keyof typeof translations.en;
type TranslationValue = (typeof translations.en)[TranslationKey];
type Translations = Record<Language, Record<TranslationKey, TranslationValue>>;

const SPIRITS = [
  { id: "brandy", key: "spiritBrandy" as TranslationKey, emoji: "🍇" },
  { id: "gin", key: "spiritGin" as TranslationKey, emoji: "🌿" },
  { id: "rum", key: "spiritRum" as TranslationKey, emoji: "🏝️" },
  { id: "tequila", key: "spiritTequila" as TranslationKey, emoji: "🌵" },
  { id: "vodka", key: "spiritVodka" as TranslationKey, emoji: "🥔" },
  { id: "whisky", key: "spiritWhisky" as TranslationKey, emoji: "🥃" },
];

interface SpiritSelectorProps {
  onSelect: (spirit: string) => void;
  onBack: () => void;
}

export function SpiritSelector({ onSelect, onBack }: SpiritSelectorProps) {
  const params = useParams();
  const language = (params?.language as Language) || "en";
  const t = (translations as Translations)[language];
  const [selectedSpirit, setSelectedSpirit] = useState<string | null>(null);

  const handleSelect = (spirit: string) => {
    setSelectedSpirit(spirit);
    onSelect(spirit);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl mb-8 text-center text-white">
        {t.expressStep2SpiritTitle}
      </h1>
      <p className="text-lg mb-8 text-center text-white/80">{t.expressStep2SpiritSubtitle}</p>
      <div className="grid grid-cols-2 gap-2 w-full max-w-4xl">
        {SPIRITS.map((spirit) => (
          <motion.button
            key={spirit.id}
            onClick={() => handleSelect(spirit.id)}
            className={`flex flex-col items-center justify-center p-8 rounded-xl text-xl font-semibold transition-all duration-200 border-2
              ${
                selectedSpirit === spirit.id
                  ? "border-white bg-white/10 text-white scale-105"
                  : "border-white/50 text-white/80 hover:bg-white/5 hover:border-white"
              }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-4xl mb-4">{spirit.emoji}</span>
            <span className="text-center text-2xl">{t[spirit.key]}</span>
          </motion.button>
        ))}
      </div>
      <Navigation onBack={onBack} />
    </div>
  );
}
