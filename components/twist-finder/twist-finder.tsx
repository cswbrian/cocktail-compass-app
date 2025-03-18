"use client";

import { useState } from "react";
import { Cocktail } from "@/types/cocktail";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { sendGAEvent } from '@next/third-parties/google';
import { calculateDistance } from "@/lib/cocktail-twist";
import { BasedCocktailCard } from "@/components/twist-finder/based-cocktail-card";
import { TwistResults } from "@/components/twist-finder/twist-results";
import { slugify } from "@/lib/utils";

interface TwistFinderProps {
  cocktails: Cocktail[];
}

export function TwistFinder({ cocktails }: TwistFinderProps) {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];
  const [selectedCocktail, setSelectedCocktail] = useState<string[]>([]);
  const [twists, setTwists] = useState<Array<{ cocktail: Cocktail; distance: number }>>([]);
  const [showResults, setShowResults] = useState(false);

  const cocktailOptions = cocktails.map(cocktail => ({
    label: `${cocktail.name.en} / ${cocktail.name.zh}`,
    value: cocktail.name.en,
  }));

  const selectedCocktailData = selectedCocktail.length 
    ? cocktails.find(c => c.name.en === selectedCocktail[0])
    : null;

  const findTwists = () => {
    if (!selectedCocktail.length) return;
    
    const baseCocktail = cocktails.find(c => c.name.en === selectedCocktail[0]);
    if (!baseCocktail) return;

    const cocktailScores = cocktails
      .filter(c => c.name.en !== selectedCocktail[0])
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
      base_cocktail: selectedCocktail[0]
    });
  };

  const handleFindAgain = () => {
    setShowResults(false);
    setSelectedCocktail([]);
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
      <h1 className="text-3xl mb-8">{t.findTwists}</h1>
      <p className="text-muted-foreground mb-2">{t.findTwistsDescription}</p>
      <div className="max-w-md mb-8">
        <MultiSelect
          options={cocktailOptions}
          value={selectedCocktail}
          onValueChange={setSelectedCocktail}
          placeholder={t.selectCocktail}
          maxCount={1}
          enableSelectAll={false}
        />

        <div className="flex gap-2 mt-4">
          <Button 
            className="flex-1" 
            onClick={findTwists}
            disabled={!selectedCocktail.length}
          >
            {t.findTwists}
          </Button>
          
          <Button 
            className="flex-1"
            variant="outline"
            onClick={() => window.open(`/${language}/cocktails/${slugify(selectedCocktailData?.name.en || '')}`, '_blank')}
            disabled={!selectedCocktail.length}
          >
            {t.seeMore}
          </Button>
        </div>

        {selectedCocktailData && (
          <div className="mt-8">
            <BasedCocktailCard cocktail={selectedCocktailData} />
          </div>
        )}
      </div>
    </div>
  );
}