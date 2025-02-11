"use client";

import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import cocktailsData from "@/data/cocktails.json";
import { Cocktail } from "@/types/cocktail";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CocktailCard } from "@/components/cocktail-card";

interface RankedCocktail extends Cocktail {
  distance: number;
}

const cocktails = cocktailsData as Cocktail[];

export function CocktailExplorer() {
  const [sweetness, setSweetness] = useState(5);
  const [sourness, setSourness] = useState(5);
  const [body, setBody] = useState(5);
  const [complexity, setComplexity] = useState(5);
  const [booziness, setBooziness] = useState(5);
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
    <div className="space-y-8">
      <h1 className="text-4xl">Choose your preference</h1>
      <div>
        <h2 className="mb-2">Sweetness</h2>
        <Slider
          defaultValue={[5]}
          max={10}
          step={1}
          className="w-full"
          onValueChange={(value) => setSweetness(value[0])}
        />
        <div className="grid grid-cols-5 text-xs text-muted-foreground mt-1">
          <span className="text-left">None</span>
          <span className="text-center">Light</span>
          <span className="text-center">Medium</span>
          <span className="text-center">Sweet</span>
          <span className="text-right">Very Sweet</span>
        </div>
      </div>

      <div>
        <h2 className="mb-2">Sourness</h2>
        <Slider
          defaultValue={[5]}
          max={10}
          step={1}
          className="w-full"
          onValueChange={(value) => setSourness(value[0])}
        />
        <div className="grid grid-cols-5 text-xs text-muted-foreground mt-1">
          <span className="text-left">None</span>
          <span className="text-center">Light</span>
          <span className="text-center">Medium</span>
          <span className="text-center">Sour</span>
          <span className="text-right">Very Sour</span>
        </div>
      </div>

      <div>
        <h2 className="mb-2">Body</h2>
        <Slider
          defaultValue={[5]}
          max={10}
          step={1}
          className="w-full"
          onValueChange={(value) => setBody(value[0])}
        />
        <div className="grid grid-cols-5 text-xs text-muted-foreground mt-1">
          <span className="text-left">Thin</span>
          <span className="text-center">Light</span>
          <span className="text-center">Medium</span>
          <span className="text-center">Full</span>
          <span className="text-right">Heavy</span>
        </div>
      </div>

      <div>
        <h2 className="mb-2">Complexity</h2>
        <Slider
          defaultValue={[5]}
          max={10}
          step={1}
          className="w-full"
          onValueChange={(value) => setComplexity(value[0])}
        />
        <div className="grid grid-cols-5 text-xs text-muted-foreground mt-1">
          <span className="text-left">Simple</span>
          <span className="text-center">Some</span>
          <span className="text-center">Medium</span>
          <span className="text-center">Complex</span>
          <span className="text-right">Very Complex</span>
        </div>
      </div>

      <div>
        <h2 className="mb-2">Booziness</h2>
        <Slider
          defaultValue={[5]}
          max={10}
          step={1}
          className="w-full"
          onValueChange={(value) => setBooziness(value[0])}
        />
        <div className="grid grid-cols-5 text-xs text-muted-foreground mt-1">
          <span className="text-left">No Alcohol</span>
          <span className="text-center">Light</span>
          <span className="text-center">Medium</span>
          <span className="text-center">Strong</span>
          <span className="text-right">Very Strong</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="bubbles" checked={bubbles} onCheckedChange={setBubbles} />
        <Label htmlFor="bubbles">With bubbles</Label>
      </div>

      <div className="space-y-2">
        <h2 className="mb-2">Primary Flavor (max 3)</h2>
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
              {flavor}
            </Button>
          ))}
        </div>
      </div>

      <Button className="w-full" onClick={handleSubmit}>
        Find My Cocktail
      </Button>
        
      {results.length > 0 && (
        <div className="mt-8 flex flex-col gap-y-6">
          {results.map((cocktail) => (
            <CocktailCard key={cocktail.name} cocktail={cocktail} />
          ))}
        </div>
      )}
    </div>
  );
}
