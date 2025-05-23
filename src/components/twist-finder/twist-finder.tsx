'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Cocktail } from '@/types/cocktail';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { sendGAEvent } from '@/lib/ga';
import { calculateDistance } from '@/lib/cocktail-twist';
import { TwistResults } from '@/components/twist-finder/twist-results';
import { slugify } from '@/lib/utils';
import {
  useSearchParams,
  useNavigate,
} from 'react-router-dom';

interface TwistFinderProps {
  cocktails: Cocktail[];
}

export function TwistFinder({
  cocktails,
}: TwistFinderProps) {
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const navigate = useNavigate();
  const t =
    translations[language as keyof typeof translations];
  const [selectedCocktail, setSelectedCocktail] =
    useState<string>('');
  const [twists, setTwists] = useState<
    Array<{ cocktail: Cocktail; distance: number }>
  >([]);

  const findTwists = useCallback(
    (cocktailName: string) => {
      const baseCocktail = cocktails.find(
        c => c.name.en === cocktailName,
      );
      if (!baseCocktail) return;

      const cocktailScores = cocktails
        .filter(c => c.name.en !== cocktailName)
        .map(cocktail => {
          const distance = calculateDistance(
            baseCocktail,
            cocktail,
          );
          return { cocktail, distance };
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10);

      setTwists(cocktailScores);

      sendGAEvent(
        'twist_finder',
        'find_twists',
        cocktailName,
      );
    },
    [cocktails],
  );

  useEffect(() => {
    if (!searchParams) return;
    const cocktailParam = searchParams.get('cocktail');
    if (!cocktailParam) {
      navigate(`/${language}`);
      return;
    }

    const cocktail = cocktails.find(
      c => slugify(c.name.en) === cocktailParam,
    );
    if (cocktail) {
      setSelectedCocktail(cocktail.name.en);
      findTwists(cocktail.name.en);
    }
  }, [
    searchParams,
    cocktails,
    language,
    navigate,
    findTwists,
  ]);

  const selectedCocktailData = selectedCocktail
    ? cocktails.find(c => c.name.en === selectedCocktail)
    : null;

  if (selectedCocktailData && twists.length > 0) {
    return (
      <TwistResults
        twists={twists}
        baseCocktail={selectedCocktailData}
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
