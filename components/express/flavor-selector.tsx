"use client";

import { useState } from "react";
import { translations } from "@/translations";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Navigation } from "./navigation";

type Language = "en" | "zh";
type TranslationKey = keyof typeof translations.en;
type TranslationValue = (typeof translations.en)[TranslationKey];
type Translations = Record<Language, Record<TranslationKey, TranslationValue>>;

interface FlavorOption {
  id: string;
  labelKey: TranslationKey;
  emoji: string;
}

interface FlavorSelectorProps {
  options: FlavorOption[];
  titleKey: TranslationKey;
  onSelect: (flavors: string) => void;
  onBack: () => void;
}

export function FlavorSelector({
  options,
  titleKey,
  onSelect,
  onBack,
}: FlavorSelectorProps) {
  const params = useParams();
  const language = (params?.language as Language) || "en";
  const t = (translations as Translations)[language];
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);

  const handleFlavorSelect = (flavorId: string) => {
    setSelectedFlavors((prev) => {
      if (prev.includes(flavorId)) {
        return prev.filter((id) => id !== flavorId);
      }
      if (prev.length < 3) {
        return [...prev, flavorId];
      }
      return prev;
    });
  };

  const handleNext = () => {
    onSelect(selectedFlavors.join(","));
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="space-y-4">
        <h2 className="text-2xl mb-4 text-center">{t.primaryFlavor}</h2>
        <p className="text-center text-sm text-white/70 mb-4">{t[titleKey]}</p>
        <div className="grid grid-cols-2 gap-4">
          {options.map((option) => (
            <motion.button
              key={option.id}
              onClick={() => handleFlavorSelect(option.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl text-xl font-semibold transition-all duration-200 border-2 ${
                selectedFlavors.includes(option.id)
                  ? "border-white bg-white/10"
                  : "border-white/50 hover:border-white hover:bg-white/5"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-3xl mb-2">{option.emoji}</span>
              <span>{t[option.labelKey]}</span>
            </motion.button>
          ))}
        </div>
        <Navigation
          onBack={onBack}
          onNext={handleNext}
          nextDisabled={selectedFlavors.length === 0}
        />
      </div>
    </div>
  );
}
