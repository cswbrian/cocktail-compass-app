import { Button } from "@/components/ui/button";
import { translations } from "@/translations";
import { useParams } from "next/navigation";

type Language = "en" | "zh";
type TranslationKey = keyof typeof translations.en;
type TranslationValue = (typeof translations.en)[TranslationKey];
type Translations = Record<Language, Record<TranslationKey, TranslationValue>>;

interface NavigationProps {
  onBack: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
}

export function Navigation({
  onBack,
  onNext,
  nextDisabled = false,
}: NavigationProps) {
  const params = useParams();
  const language = (params?.language as Language) || "en";
  const t = (translations as Translations)[language];

  return (
    <div className="flex justify-between w-full mt-8 gap-4">
      <Button onClick={onBack}>{t.previous}</Button>
      {onNext && (
        <Button onClick={onNext} disabled={nextDisabled}>
          {t.next}
        </Button>
      )}
    </div>
  );
}
