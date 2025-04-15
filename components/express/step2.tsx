"use client";

import { translations } from "@/translations";
import { SpiritSelector } from "./spirit-selector";
import { SweetTartPreference } from "./sweet-tart-preference";
import { FlavorSelector } from "./flavor-selector";

type TranslationKey = keyof typeof translations.en;

// Shared interfaces
interface Step2BaseProps {
  onSelect: (value: string) => void;
  onBack: () => void;
}

// Strong & Spirit-Focused
export function Step2Strong({ onSelect, onBack }: Step2BaseProps) {
  return <SpiritSelector onSelect={onSelect} onBack={onBack} />;
}

// Sweet & Tart
export function Step2SweetTart({ onSelect, onBack }: Step2BaseProps) {
  return <SweetTartPreference onSelect={onSelect} onBack={onBack} />;
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
    <FlavorSelector
      options={TALL_BUBBLY_OPTIONS}
      titleKey="step2Title"
      onSelect={onSelect}
      onBack={onBack}
    />
  );
}

// Rich & Creamy
export function Step2Creamy({ onSelect, onBack }: Step2BaseProps) {
  return (
    <FlavorSelector
      options={RICH_CREAMY_OPTIONS}
      titleKey="step2Title"
      onSelect={onSelect}
      onBack={onBack}
    />
  );
}
