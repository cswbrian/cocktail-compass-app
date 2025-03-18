"use client";

import { useState } from "react";
import { Cocktail } from "@/types/cocktail";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { CocktailCard } from "@/components/cocktail-card";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { sendGAEvent } from '@next/third-parties/google';
import { calculateDistance } from "@/lib/cocktail-twist";
import { BasedCocktailCard } from "@/components/twist-finder/based-cocktail-card";
interface TwistFinderProps {
  cocktails: Cocktail[];
}

export function TwistFinder({ cocktails }: TwistFinderProps) {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];
  const [selectedCocktail, setSelectedCocktail] = useState<string[]>([]);
  const [twists, setTwists] = useState<Array<{ cocktail: Cocktail; distance: number }>>([]);

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
    
    sendGAEvent('twist_finder', {
      action: 'find_twists',
      base_cocktail: selectedCocktail[0]
    });
  };

  return (
    <div>
      <div className="max-w-md mb-8">
        <MultiSelect
          options={cocktailOptions}
          value={selectedCocktail}
          onValueChange={setSelectedCocktail}
          placeholder={t.selectCocktail}
          maxCount={1}
          enableSelectAll={false}
        />

        {selectedCocktailData && (
          <div className="mt-4 mb-4">
            <BasedCocktailCard cocktail={selectedCocktailData} />
          </div>
        )}

        <Button 
          className="w-full mt-4" 
          onClick={findTwists}
          disabled={!selectedCocktail.length}
        >
          {t.findTwists}
        </Button>
      </div>

      {twists.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">{t.suggestedTwists}</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {twists.map(({ cocktail, distance }) => (
              <CocktailCard
                key={cocktail.name.en}
                cocktail={cocktail}
                distance={distance}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}