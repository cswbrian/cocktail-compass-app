"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cocktail } from "@/types/cocktail";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { sendGAEvent } from '@next/third-parties/google';
import { calculateDistance } from "@/lib/cocktail-twist";
import { BasedCocktailCard } from "@/components/twist-finder/based-cocktail-card";
import { TwistResults } from "@/components/twist-finder/twist-results";
import { slugify } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

interface TwistFinderProps {
  cocktails: Cocktail[];
}

export function TwistFinder({ cocktails }: TwistFinderProps) {
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const t = translations[language as keyof typeof translations];
  const [selectedCocktail, setSelectedCocktail] = useState<string>("");
  const [twists, setTwists] = useState<Array<{ cocktail: Cocktail; distance: number }>>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!searchParams) return;
    const cocktailParam = searchParams.get('cocktail');
    if (cocktailParam) {
      const cocktail = cocktails.find(c => slugify(c.name.en) === cocktailParam);
      if (cocktail) {
        setSelectedCocktail(cocktail.name.en);
      }
    }
  }, [searchParams, cocktails]);

  const cocktailOptions = cocktails
    .map(cocktail => ({
      label: `${cocktail.name.en} / ${cocktail.name.zh}`,
      value: cocktail.name.en,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const selectedCocktailData = selectedCocktail 
    ? cocktails.find(c => c.name.en === selectedCocktail)
    : null;

  const findTwists = () => {
    if (!selectedCocktail) return;
    
    const baseCocktail = cocktails.find(c => c.name.en === selectedCocktail);
    if (!baseCocktail) return;

    const cocktailScores = cocktails
      .filter(c => c.name.en !== selectedCocktail)
      .map(cocktail => {
        const distance = calculateDistance(baseCocktail, cocktail);
        return { cocktail, distance };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);

    setTwists(cocktailScores);
    setShowResults(true);
    
    sendGAEvent('twist_finder', {
      action: 'find_twists',
      base_cocktail: selectedCocktail
    });
  };

  const handleFindAgain = () => {
    setShowResults(false);
    setSelectedCocktail("");
    setTwists([]);
  };

  if (showResults && selectedCocktailData) {
    return (
      <TwistResults 
        twists={twists} 
        baseCocktail={selectedCocktailData}
        onFindAgain={handleFindAgain}
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
      <motion.div
        className="max-w-md mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Combobox
          options={cocktailOptions}
          value={selectedCocktail}
          onValueChange={setSelectedCocktail}
          placeholder={t.selectCocktail}
          searchPlaceholder={t.search}
          emptyText={t.noResultsFound}
          className="mb-4"
        />

        <div className="flex gap-2 mt-4">
          <Button 
            className="flex-1" 
            onClick={findTwists}
            disabled={!selectedCocktail}
          >
            {t.findTwists}
          </Button>
          
          <Button 
            className="flex-1"
            variant="outline"
            onClick={() => window.open(`/${language}/cocktails/${slugify(selectedCocktailData?.name.en || '')}`, '_blank')}
            disabled={!selectedCocktail}
          >
            {t.seeMore}
          </Button>
        </div>

        {selectedCocktailData && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <BasedCocktailCard cocktail={selectedCocktailData} />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}