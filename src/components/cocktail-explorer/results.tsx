import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { CocktailCard } from '@/components/cocktail-card';
import { useCocktail } from '@/context/CocktailContext';
import { sendGAEvent } from '@/lib/ga';
import { useEffect } from 'react';
import { ExternalLink } from '@/components/external-link';
import { Loading } from '@/components/ui/loading';

export default function Results() {
  const { language } = useLanguage();
  const t = translations[language];
  const {
    results,
    isLoading,
    sweetness,
    sourness,
    body,
    complexity,
    booziness,
    bubbles,
    selectedFlavors,
    selectedBaseSpirits,
    selectedIngredients,
    selectedLiqueurs,
  } = useCocktail();

  useEffect(() => {
    if (results.length > 0) {
      sendGAEvent(
        'cocktail_explorer_results',
        'view_results',
        JSON.stringify({
          cocktails: results.map(cocktail => ({
            name: cocktail.name.en,
            similarity:
              (100 - cocktail.distance).toFixed(1) + '%',
          })),
          parameters: {
            sweetness,
            sourness,
            body,
            complexity,
            booziness,
            bubbles,
            flavors: selectedFlavors,
            base_spirits: selectedBaseSpirits,
            ingredients: selectedIngredients,
            liqueurs: selectedLiqueurs,
          },
        }),
      );
    }
  }, [results, language]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col items-center justify-center py-12"
      >
        <Loading size="lg" />
        <p className="mt-4 text-muted-foreground">
          {t.loading || 'Loading...'}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <h2>{t.resultsTitle}</h2>
      <ExternalLink message={t.feedbackMessage} />
      <div
        id="results-section"
        className="mt-8 flex flex-col gap-y-6 pb-20"
      >
        {results.map((cocktail, index) => (
          <motion.div
            key={cocktail.name[language]}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.1,
            }}
          >
            <CocktailCard
              cocktail={cocktail}
              distance={cocktail.distance}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
