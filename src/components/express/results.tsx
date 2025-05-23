'use client';

import { motion } from 'framer-motion';
import { translations } from '@/translations';
import { useParams } from 'react-router-dom';
import { CocktailCard } from '@/components/cocktail-card';
import { sendGAEvent } from '@/lib/ga';
import { useEffect, useState } from 'react';
import { cocktailService } from '@/services/cocktail-service';
import { Navigation } from './navigation';
import { Button } from '@/components/ui/button';
import { RefreshCw, Home } from 'lucide-react';

type Language = 'en' | 'zh';
type TranslationKey = keyof typeof translations.en;
type TranslationValue =
  (typeof translations.en)[TranslationKey];
type Translations = Record<
  Language,
  Record<TranslationKey, TranslationValue>
>;

type Category =
  | 'Strong & Spirit-Focused'
  | 'Sweet & Tart'
  | 'Tall & Bubbly'
  | 'Rich & Creamy';

interface ResultsProps {
  category: Category;
  preference?: string;
  spirit?: string;
  onBack: () => void;
  onRestart: () => void;
}

export function Results({
  category,
  preference,
  spirit,
  onBack,
  onRestart,
}: ResultsProps) {
  const params = useParams();
  const language = (params?.language as Language) || 'en';
  const t = (translations as Translations)[language];
  const [results, setResults] = useState(() =>
    cocktailService.getCocktailsByMood(
      category,
      spirit,
      preference,
    ),
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const newResults = cocktailService.getCocktailsByMood(
        category,
        spirit,
        preference,
      );
      setResults(newResults);
      setIsRefreshing(false);
    }, 1000);
  };

  const handleRestart = () => {
    onRestart();
  };

  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    if (results.length > 0) {
      sendGAEvent(
        'express_suggestion_results',
        'view_results',
        JSON.stringify({
          category,
          preference,
          spirit,
          cocktails: results.map(cocktail => ({
            name: cocktail.name[language],
          })),
        }),
      );
    }
  }, [results, language, category, preference, spirit]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="p-4"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl mb-8 text-center text-white">
          {t.expressResultsTitle}
        </h2>
        <div className="mt-8 flex flex-col gap-y-6">
          {results.map((cocktail, index) => (
            <motion.div
              key={cocktail.name[language]}
              initial={
                isInitialLoad
                  ? { opacity: 0, y: 20 }
                  : false
              }
              animate={{
                opacity: 1,
                y: 0,
                rotateY: isRefreshing ? 360 : 0,
                scale: isRefreshing ? [1, 1.1, 1] : 1,
              }}
              transition={{
                duration: 1,
                delay: isInitialLoad ? index * 0.1 : 0,
                rotateY: { duration: 1, ease: 'easeInOut' },
                scale: { duration: 1, times: [0, 0.5, 1] },
              }}
            >
              <CocktailCard
                cocktail={cocktail}
                distance={cocktail.distance}
              />
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 mt-8">
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <motion.div
              animate={{ rotate: isRefreshing ? 360 : 0 }}
              transition={{
                duration: 1,
                repeat: isRefreshing ? Infinity : 0,
              }}
            >
              <RefreshCw className="mr-2 h-5 w-5" />
            </motion.div>
            {t.suggestAnother}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleRestart}
          >
            <Home className="mr-2 h-5 w-5" />
            {t.startOver}
          </Button>
        </div>
        <Navigation onBack={onBack} />
      </div>
    </motion.div>
  );
}
