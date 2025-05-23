'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Cocktail } from '@/types/cocktail';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { sendGAEvent } from '@/lib/ga';
import { calculateDistance } from '@/lib/cocktail-twist';
import { TwistResults } from '@/components/twist-finder/twist-results';
import { cocktailService } from '@/services/cocktail-service';

interface TwistFinderProps {
  baseCocktail: Cocktail;
}

export function TwistFinder({
  baseCocktail,
}: TwistFinderProps) {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];
  const [twists, setTwists] = useState<Array<{ cocktail: Cocktail; distance: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const findTwists = useCallback(async () => {
    try {
      setIsLoading(true);
      const allCocktails = await cocktailService.getRecommendableCocktails();
      
      const cocktailScores = allCocktails
        .filter(c => c.id !== baseCocktail.id)
        .map(cocktail => {
          const distance = calculateDistance(baseCocktail, cocktail);
          return { cocktail, distance };
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10);

      setTwists(cocktailScores);

      sendGAEvent(
        'twist_finder',
        'find_twists',
        baseCocktail.name.en,
      );
    } catch (error) {
      console.error('Error finding twists:', error);
    } finally {
      setIsLoading(false);
    }
  }, [baseCocktail]);

  useEffect(() => {
    findTwists();
  }, [findTwists]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-muted-foreground">Loading twists...</div>
      </div>
    );
  }

  if (twists.length > 0) {
    return (
      <TwistResults
        twists={twists}
        baseCocktail={baseCocktail}
      />
    );
  }

  return (
    <div>
      <motion.h1
        className="text-4xl mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {t.findTwists}
      </motion.h1>
      <motion.p
        className="text-muted-foreground mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {t.findTwistsDescription}
      </motion.p>
    </div>
  );
}
