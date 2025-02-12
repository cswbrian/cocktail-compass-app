"use client";

import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import cocktailsData from "@/data/cocktails.json";
import { Cocktail } from "@/types/cocktail";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CocktailCard } from "@/components/cocktail-card";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";

interface RankedCocktail extends Cocktail {
  distance: number;
}

const cocktails = cocktailsData as Cocktail[];

export function CocktailExplorer() {
  const { language } = useLanguage();
  const t = translations[language];

  const getRandomValue = () => Math.floor(Math.random() * 11); // Generates integer from 0 to 10

  const [sweetness, setSweetness] = useState(getRandomValue());
  const [sourness, setSourness] = useState(getRandomValue());
  const [body, setBody] = useState(getRandomValue());
  const [complexity, setComplexity] = useState(getRandomValue());
  const [booziness, setBooziness] = useState(getRandomValue());
  const [bubbles, setBubbles] = useState(false);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [results, setResults] = useState<RankedCocktail[]>([]);

  const calculateDistance = (cocktail: Cocktail) => {
    const profile = cocktail.flavor_profile;
    const bubbleDifference = profile.bubbles === bubbles ? 0 : 5;

    // Calculate flavor match score
    const flavorMatch =
      selectedFlavors.length > 0
        ? selectedFlavors.filter((flavor) =>
            cocktail.flavor_descriptors.includes(flavor.toLowerCase())
          ).length / selectedFlavors.length
        : 0;

    return Math.sqrt(
      Math.pow(profile.sweetness - sweetness, 2) +
        Math.pow(profile.sourness - sourness, 2) +
        Math.pow(profile.body - body, 2) +
        Math.pow(profile.complexity - complexity, 2) +
        Math.pow(profile.booziness - booziness, 2) +
        Math.pow(bubbleDifference, 2) +
        Math.pow((1 - flavorMatch) * 5, 2) // Scale flavor match to similar range as other factors
    );
  };

  const handleSubmit = () => {
    const rankedCocktails: RankedCocktail[] = cocktails
      .map((cocktail) => ({
        ...cocktail,
        distance: calculateDistance(cocktail),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    setResults(rankedCocktails);
    
    // Scroll to results after a short delay to allow state to update
    setTimeout(() => {
      const resultsElement = document.getElementById('results-section');
      if (resultsElement) {
        const offset = 100; // 100px margin top
        const elementPosition = resultsElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 50);
  };

  const handleFlavorSelect = (flavor: string) => {
    setSelectedFlavors((prev) => {
      if (prev.includes(flavor)) {
        return prev.filter((f) => f !== flavor);
      } else if (prev.length < 3) {
        return [...prev, flavor];
      }
      return prev;
    });
  };

  return (
    <div className="mt-12 space-y-8">
      <h1 className="text-4xl">{t.chooseYourPreference}</h1>
      
      <div>
        <h2 className="mb-2">{t.sweetness}</h2>
        <Slider
          defaultValue={[5]}
          max={10}
          step={1}
          className="w-full"
          rangeClassName="bg-rose-500"
          onValueChange={(value) => setSweetness(value[0])}
        />
        <div className="grid grid-cols-5 text-xs text-muted-foreground mt-1">
          <span className="text-left">{t.noSweet}</span>
          <span className="text-center">{t.lightSweet}</span>
          <span className="text-center">{t.mediumSweet}</span>
          <span className="text-center">{t.sweet}</span>
          <span className="text-right">{t.verySweet}</span>
        </div>
      </div>

      <div>
        <h2 className="mb-2">{t.sourness}</h2>
        <Slider
          defaultValue={[5]}
          max={10}
          step={1}
          className="w-full"
          rangeClassName="bg-yellow-500"
          onValueChange={(value) => setSourness(value[0])}
        />
        <div className="grid grid-cols-5 text-xs text-muted-foreground mt-1">
          <span className="text-left">{t.noSour}</span>
          <span className="text-center">{t.lightSour}</span>
          <span className="text-center">{t.mediumSour}</span>
          <span className="text-center">{t.sour}</span>
          <span className="text-right">{t.verySour}</span>
        </div>
      </div>

      <div>
        <h2 className="mb-2">{t.body}</h2>
        <Slider
          defaultValue={[5]}
          max={10}
          step={1}
          className="w-full"
          rangeClassName="bg-emerald-500"
          onValueChange={(value) => setBody(value[0])}
        />
        <div className="grid grid-cols-5 text-xs text-muted-foreground mt-1">
          <span className="text-left">{t.thinBody}</span>
          <span className="text-center">{t.lightBody}</span>
          <span className="text-center">{t.mediumBody}</span>
          <span className="text-center">{t.heavyBody}</span>
          <span className="text-right">{t.fullBody}</span>
        </div>
      </div>

      <div>
        <h2 className="mb-2">{t.complexity}</h2>
        <Slider
          defaultValue={[5]}
          max={10}
          step={1}
          className="w-full"
          rangeClassName="bg-sky-500"
          onValueChange={(value) => setComplexity(value[0])}
        />
        <div className="grid grid-cols-5 text-xs text-muted-foreground mt-1">
          <span className="text-left">{t.simpleComplex}</span>
          <span className="text-center">{t.someComplex}</span>
          <span className="text-center">{t.mediumComplex}</span>
          <span className="text-center">{t.complex}</span>
          <span className="text-right">{t.veryComplex}</span>
        </div>
      </div>

      <div>
        <h2 className="mb-2">{t.booziness}</h2>
        <Slider
          defaultValue={[5]}
          max={10}
          step={1}
          className="w-full"
          rangeClassName="bg-orange-500"
          onValueChange={(value) => setBooziness(value[0])}
        />
        <div className="grid grid-cols-5 text-xs text-muted-foreground mt-1">
          <span className="text-left">{t.noAlcohol}</span>
          <span className="text-center">{t.lightAlcohol}</span>
          <span className="text-center">{t.mediumAlcohol}</span>
          <span className="text-center">{t.strongAlcohol}</span>
          <span className="text-right">{t.veryStrong}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="bubbles" checked={bubbles} onCheckedChange={setBubbles} />
        <Label htmlFor="bubbles">{t.withBubbles}</Label>
      </div>

      <div className="space-y-2">
        <h2 className="mb-2">{t.primaryFlavor}</h2>
        <div className="flex flex-wrap gap-2">
          {[
            "Bitter",
            "Salty",
            "Umami",
            "Fruity",
            "Citrus",
            "Herbal",
            "Spicy",
            "Floral",
            "Tropical",
            "Nutty",
            "Chocolate",
            "Coffee",
            "Vanilla",
            "Smoky",
            "Earth",
            "Savory",
            "Creamy",
            "Woody",
            "Grassy",
            "Yeasty",
          ].map((flavor) => (
            <Button
              key={flavor}
              variant={selectedFlavors.includes(flavor) ? "default" : "outline"}
              onClick={() => handleFlavorSelect(flavor)}
              disabled={
                !selectedFlavors.includes(flavor) && selectedFlavors.length >= 3
              }
            >
              {t[flavor.toLowerCase() as keyof typeof t]}
            </Button>
          ))}
        </div>
      </div>

      <Button className="w-full" onClick={handleSubmit}>
        {t.findCocktail}
      </Button>
        
      {results.length > 0 && (
        <div id="results-section" className="mt-8 flex flex-col gap-y-6">
          {results.map((cocktail) => (
            <CocktailCard key={cocktail.name} cocktail={cocktail} />
          ))}
        </div>
      )}
    </div>
  );
}
