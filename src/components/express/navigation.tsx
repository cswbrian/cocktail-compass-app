import { Button } from '@/components/ui/button';
import { translations } from '@/translations';
import { useParams } from 'react-router-dom';

type Language = 'en' | 'zh';
type TranslationKey = keyof typeof translations.en;
type TranslationValue =
  (typeof translations.en)[TranslationKey];
type Translations = Record<
  Language,
  Record<TranslationKey, TranslationValue>
>;

interface NavigationProps {
  onBack: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
}

export function Navigation({
  onNext,
  nextDisabled = false,
}: NavigationProps) {
  const params = useParams();
  const language = (params?.language as Language) || 'en';
  const t = (translations as Translations)[language];

  return (
    <div className="flex justify-end w-full mt-8">
      {onNext && (
        <Button
          variant="outline"
          onClick={onNext}
          disabled={nextDisabled}
          className="w-full"
          size="lg"
        >
          {t.next}
        </Button>
      )}
    </div>
  );
}
