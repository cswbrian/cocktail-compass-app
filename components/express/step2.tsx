"use client";

import { translations } from "@/translations";
import { SpiritSelector } from "./spirit-selector";
import { SweetTartPreference } from "./sweet-tart-preference";
import { FlavorSelector } from "./flavor-selector";
import { BackButton } from "./back-button";
import { motion } from "framer-motion";

type TranslationKey = keyof typeof translations.en;

// Shared interfaces
interface Step2BaseProps {
  onSelect: (value: string) => void;
  onBack: () => void;
}

// Strong & Spirit-Focused
export function Step2Strong({ onSelect, onBack }: Step2BaseProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <BackButton onClick={onBack} />
      <SpiritSelector onSelect={onSelect} onBack={onBack} />
    </motion.div>
  );
}

// Sweet & Tart
export function Step2SweetTart({ onSelect, onBack }: Step2BaseProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <BackButton onClick={onBack} />
      <SweetTartPreference onSelect={onSelect} onBack={onBack} />
    </motion.div>
  );
}

// Tall & Bubbly and Rich & Creamy shared options
const TALL_BUBBLY_OPTIONS = [
  { id: "fruity", labelKey: "fruity" as TranslationKey, emoji: "🍓" },
  { id: "citrus", labelKey: "citrus" as TranslationKey, emoji: "🍊" },
  { id: "herbal", labelKey: "herbal" as TranslationKey, emoji: "🌿" },
  { id: "spicy", labelKey: "spicy" as TranslationKey, emoji: "🌶️" },
  { id: "floral", labelKey: "floral" as TranslationKey, emoji: "🌸" },
  { id: "tropical", labelKey: "tropical" as TranslationKey, emoji: "🌴" },
];

const RICH_CREAMY_OPTIONS = [
  { id: "nutty", labelKey: "nutty" as TranslationKey, emoji: "🥜" },
  { id: "chocolate", labelKey: "chocolate" as TranslationKey, emoji: "🍫" },
  { id: "coffee", labelKey: "coffee" as TranslationKey, emoji: "☕" },
  { id: "vanilla", labelKey: "vanilla" as TranslationKey, emoji: "🌿" },
];

// Tall & Bubbly
export function Step2Bubbly({ onSelect, onBack }: Step2BaseProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <BackButton onClick={onBack} />
      <FlavorSelector
        options={TALL_BUBBLY_OPTIONS}
        titleKey="expressStep2BubblyTitle"
        subtitleKey="expressStep2BubblySubtitle"
        onSelect={onSelect}
        onBack={onBack}
      />
    </motion.div>
  );
}

// Rich & Creamy
export function Step2Creamy({ onSelect, onBack }: Step2BaseProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <BackButton onClick={onBack} />
      <FlavorSelector
        options={RICH_CREAMY_OPTIONS}
        titleKey="expressStep2CreamyTitle"
        subtitleKey="expressStep2CreamySubtitle"
        onSelect={onSelect}
        onBack={onBack}
      />
    </motion.div>
  );
}
