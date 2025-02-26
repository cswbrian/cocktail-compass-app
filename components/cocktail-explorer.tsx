"use client";

import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import cocktailsData from "@/data/cocktails.json";
import summary from "@/data/summary.json";
import { Cocktail } from "@/types/cocktail";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CocktailCard } from "@/components/cocktail-card";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { MultiSelect } from "@/components/ui/multi-select";
import { motion, AnimatePresence } from "framer-motion";

interface RankedCocktail extends Cocktail {
  distance: number;
  flavorMatches: number;
}

const cocktails = cocktailsData as Cocktail[];

export function CocktailExplorer() {
  const { language } = useLanguage();
  const t = translations[language];

  const [sweetness, setSweetness] = useState(5);
  const [sourness, setSourness] = useState(5);
  const [body, setBody] = useState(5);
  const [complexity, setComplexity] = useState(5);
  const [booziness, setBooziness] = useState(5);
  const [bubbles, setBubbles] = useState(false);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [results, setResults] = useState<RankedCocktail[]>([]);
  const [noSweetness, setNoSweetness] = useState(false);
  const [noSourness, setNoSourness] = useState(false);
  const [noBody, setNoBody] = useState(false);
  const [noComplexity, setNoComplexity] = useState(false);
  const [noBooziness, setNoBooziness] = useState(false);
  const [selectedBaseSpirits, setSelectedBaseSpirits] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedLiqueurs, setSelectedLiqueurs] = useState<string[]>([]);

  // Add step navigation state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const calculateDistance = (cocktail: Cocktail) => {
    const profile = cocktail.flavor_profile;
    const bubbleDifference = profile.bubbles === bubbles ? 0 : 1;

    // Calculate penalty for mismatched base spirits (higher weight)
    const baseSpiritPenalty =
      selectedBaseSpirits.length > 0 &&
      !selectedBaseSpirits.some((spirit) =>
        cocktail.base_spirits.some(
          (cocktailBaseSpirit) => cocktailBaseSpirit.name[language] === spirit
        )
      )
        ? 10
        : 0;

    // Calculate penalty for mismatched ingredients (higher weight)
    const ingredientPenalty =
      selectedIngredients.length > 0 &&
      !selectedIngredients.some((ingredient) =>
        cocktail.ingredients.some(
          (cocktailIngredient) =>
            cocktailIngredient.name[language] === ingredient
        )
      )
        ? 10
        : 0;

    // Calculate penalty for mismatched liqueurs (higher weight)
    const liqueurPenalty =
      selectedLiqueurs.length > 0 &&
      !selectedLiqueurs.some((liqueur) =>
        cocktail.liqueurs.some(
          (cocktailLiqueur) => cocktailLiqueur.name[language] === liqueur
        )
      )
        ? 10
        : 0;

    return Math.sqrt(
      (noSweetness ? 0 : Math.pow(profile.sweetness - sweetness, 2)) +
        (noSourness ? 0 : Math.pow(profile.sourness - sourness, 2)) +
        (noBody ? 0 : Math.pow(profile.body - body, 2)) +
        (noComplexity ? 0 : Math.pow(profile.complexity - complexity, 2)) +
        (noBooziness ? 0 : Math.pow(profile.booziness - booziness, 2)) +
        Math.pow(bubbleDifference, 2) +
        Math.pow(baseSpiritPenalty, 2) +
        Math.pow(ingredientPenalty, 2) +
        Math.pow(liqueurPenalty, 2)
    );
  };

  const handleSubmit = () => {
    const rankedCocktails: RankedCocktail[] = cocktails
      .map((cocktail) => {
        // Calculate flavor penalty (higher weight)
        const flavorPenalty =
          selectedFlavors.length > 0 &&
          !selectedFlavors.some((flavor) => {
            const selectedFlavorLower = flavor.toLowerCase();
            const cocktailFlavorsLower = cocktail.flavor_descriptors.map((f) =>
              f[language].toLowerCase()
            );
            return cocktailFlavorsLower.includes(selectedFlavorLower);
          })
            ? 10
            : 0;

        return {
          ...cocktail,
          distance: calculateDistance(cocktail) + Math.pow(flavorPenalty, 2),
          flavorMatches: selectedFlavors.filter((flavor) => {
            const selectedFlavorLower = flavor.toLowerCase();
            const cocktailFlavorsLower = cocktail.flavor_descriptors.map((f) =>
              f[language].toLowerCase()
            );
            return cocktailFlavorsLower.includes(selectedFlavorLower);
          }).length,
        };
      })
      .sort((a, b) => {
        if (b.flavorMatches !== a.flavorMatches) {
          return b.flavorMatches - a.flavorMatches;
        }
        return a.distance - b.distance;
      });

    // Select top 20 and then randomize to pick 5
    const top20 = rankedCocktails.slice(0, 20);
    const random5 = top20
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
      .slice(0, 5);

    setResults(random5);

    setTimeout(() => {
      const resultsElement = document.getElementById("results-section");
      if (resultsElement) {
        const offset = 100;
        const elementPosition = resultsElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
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

  const getUniqueOptions = (
    items: { name: { [key: string]: string } }[],
    language: string
  ) => {
    const uniqueMap = new Map<string, { label: string; value: string }>();
    items.forEach((item) => {
      const label = item.name[language];
      const value = item.name.en;
      if (!uniqueMap.has(label)) {
        uniqueMap.set(label, { label, value });
      }
    });
    return Array.from(uniqueMap.values());
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToResults = () => {
    handleSubmit();
    setCurrentStep(totalSteps + 1);
  };

  const renderStep1 = () => (
    <>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className={noSweetness ? "text-gray-700" : ""}>
                {t.sweetness}
              </h2>
              <div className="flex items-center space-x-2">
                <Switch
                  id="no-sweetness"
                  checked={noSweetness}
                  onCheckedChange={(checked) => {
                    setNoSweetness(checked);
                    if (checked) setSweetness(5);
                  }}
                />
                <Label htmlFor="no-sweetness">{t.noPreference}</Label>
              </div>
            </div>
            <Slider
              value={[sweetness]}
              max={10}
              step={1}
              className="w-full"
              rangeClassName={noSweetness ? "bg-gray-700" : "bg-rose-500"}
              onValueChange={(value) => setSweetness(value[0])}
              disabled={noSweetness}
            />
            <div
              className={`grid grid-cols-5 text-xs mt-1 ${
                noSweetness ? "text-gray-700" : "text-muted-foreground"
              }`}
            >
              <span className="text-left">{t.noSweet}</span>
              <span className="text-center">{t.lightSweet}</span>
              <span className="text-center">{t.mediumSweet}</span>
              <span className="text-center">{t.sweet}</span>
              <span className="text-right">{t.verySweet}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className={noSourness ? "text-gray-700" : ""}>
                {t.sourness}
              </h2>
              <div className="flex items-center space-x-2">
                <Switch
                  id="no-sourness"
                  checked={noSourness}
                  onCheckedChange={(checked) => {
                    setNoSourness(checked);
                    if (checked) setSourness(5);
                  }}
                />
                <Label htmlFor="no-sourness">{t.noPreference}</Label>
              </div>
            </div>
            <Slider
              value={[sourness]}
              max={10}
              step={1}
              className="w-full"
              rangeClassName={noSourness ? "bg-gray-700" : "bg-yellow-500"}
              onValueChange={(value) => setSourness(value[0])}
              disabled={noSourness}
            />
            <div
              className={`grid grid-cols-5 text-xs mt-1 ${
                noSourness ? "text-gray-700" : "text-muted-foreground"
              }`}
            >
              <span className="text-left">{t.noSour}</span>
              <span className="text-center">{t.lightSour}</span>
              <span className="text-center">{t.mediumSour}</span>
              <span className="text-center">{t.sour}</span>
              <span className="text-right">{t.verySour}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className={noBody ? "text-gray-700" : ""}>{t.body}</h2>
              <div className="flex items-center space-x-2">
                <Switch
                  id="no-body"
                  checked={noBody}
                  onCheckedChange={(checked) => {
                    setNoBody(checked);
                    if (checked) setBody(5);
                  }}
                />
                <Label htmlFor="no-body">{t.noPreference}</Label>
              </div>
            </div>
            <Slider
              value={[body]}
              max={10}
              step={1}
              className="w-full"
              rangeClassName={noBody ? "bg-gray-700" : "bg-emerald-500"}
              onValueChange={(value) => setBody(value[0])}
              disabled={noBody}
            />
            <div
              className={`grid grid-cols-5 text-xs mt-1 ${
                noBody ? "text-gray-700" : "text-muted-foreground"
              }`}
            >
              <span className="text-left">{t.thinBody}</span>
              <span className="text-center">{t.lightBody}</span>
              <span className="text-center">{t.mediumBody}</span>
              <span className="text-center">{t.heavyBody}</span>
              <span className="text-right">{t.fullBody}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className={noComplexity ? "text-gray-700" : ""}>
                {t.complexity}
              </h2>
              <div className="flex items-center space-x-2">
                <Switch
                  id="no-complexity"
                  checked={noComplexity}
                  onCheckedChange={(checked) => {
                    setNoComplexity(checked);
                    if (checked) setComplexity(5);
                  }}
                />
                <Label htmlFor="no-complexity">{t.noPreference}</Label>
              </div>
            </div>
            <Slider
              value={[complexity]}
              max={10}
              step={1}
              className="w-full"
              rangeClassName={noComplexity ? "bg-gray-700" : "bg-sky-500"}
              onValueChange={(value) => setComplexity(value[0])}
              disabled={noComplexity}
            />
            <div
              className={`grid grid-cols-5 text-xs mt-1 ${
                noComplexity ? "text-gray-700" : "text-muted-foreground"
              }`}
            >
              <span className="text-left">{t.simpleComplex}</span>
              <span className="text-center">{t.someComplex}</span>
              <span className="text-center">{t.mediumComplex}</span>
              <span className="text-center">{t.complex}</span>
              <span className="text-right">{t.veryComplex}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className={noBooziness ? "text-gray-700" : ""}>
                {t.booziness}
              </h2>
              <div className="flex items-center space-x-2">
                <Switch
                  id="no-booziness"
                  checked={noBooziness}
                  onCheckedChange={(checked) => {
                    setNoBooziness(checked);
                    if (checked) setBooziness(5);
                  }}
                />
                <Label htmlFor="no-booziness">{t.noPreference}</Label>
              </div>
            </div>
            <Slider
              value={[booziness]}
              max={10}
              step={1}
              className="w-full"
              rangeClassName={noBooziness ? "bg-gray-700" : "bg-orange-500"}
              onValueChange={(value) => setBooziness(value[0])}
              disabled={noBooziness}
            />
            <div
              className={`grid grid-cols-5 text-xs mt-1 ${
                noBooziness ? "text-gray-700" : "text-muted-foreground"
              }`}
            >
              <span className="text-left">{t.noAlcohol}</span>
              <span className="text-center">{t.lightAlcohol}</span>
              <span className="text-center">{t.mediumAlcohol}</span>
              <span className="text-center">{t.strongAlcohol}</span>
              <span className="text-right">{t.veryStrong}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="space-y-8"
    >
      <h2>{t.step2Title}</h2>
      <div className="space-y-2">
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
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="space-y-8"
    >
      <h2>{t.step3Title || "Select Ingredients"}</h2>
      <div className="space-y-4">
        <MultiSelect
          options={getUniqueOptions(summary.base_spirits, language)}
          onValueChange={(values) => setSelectedBaseSpirits(values)}
          placeholder={t.pleaseSelectBaseSpirits}
          enableSelectAll={false}
        />
        <MultiSelect
          options={getUniqueOptions(summary.liqueurs, language)}
          onValueChange={(values) => setSelectedLiqueurs(values)}
          placeholder={t.pleaseSelectLiqueurs}
          enableSelectAll={false}
        />
        <MultiSelect
          options={getUniqueOptions(summary.ingredients, language)}
          onValueChange={(values) => setSelectedIngredients(values)}
          placeholder={t.pleaseSelectIngredients}
          enableSelectAll={false}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="bubbles" checked={bubbles} onCheckedChange={setBubbles} />
        <Label htmlFor="bubbles">{t.withBubbles}</Label>
      </div>
    </motion.div>
  );

  const renderResults = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="space-y-8"
    >
      <h2>{t.resultsTitle || "Your Cocktail Matches"}</h2>
      <div id="results-section" className="flex flex-col gap-y-6">
        {results.map((cocktail, index) => (
          <motion.div
            key={cocktail.name[language]}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <CocktailCard cocktail={cocktail} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderCurrentStep = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {(() => {
            switch (currentStep) {
              case 1:
                return renderStep1();
              case 2:
                return renderStep2();
              case 3:
                return renderStep3();
              case 4:
                return renderResults();
              default:
                return renderStep1();
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  const Navigation = () => {
    return (
      <div className="bg-background py-4 flex justify-between">
        {currentStep > 1 && (
          <Button variant="outline" onClick={prevStep}>
            {t.previous || "Previous"}
          </Button>
        )}

        {currentStep < totalSteps && (
          <Button onClick={nextStep} className="ml-auto">
            {t.next || "Next"}
          </Button>
        )}

        {currentStep === totalSteps && (
          <Button onClick={goToResults} className="ml-auto">
            {t.findCocktail}
          </Button>
        )}

        {currentStep === totalSteps + 1 && (
          <Button
            variant="outline"
            onClick={() => setCurrentStep(1)}
            className="ml-auto"
          >
            {t.startOver || "Start Over"}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="px-6">
        <motion.h1
          className="mt-8 text-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t.chooseYourPreference}
        </motion.h1>
        <div className="mt-8 flex-1 overflow-y-auto">{renderCurrentStep()}</div>
      </div>
      <div className="fixed bottom-0 w-full px-6">
        <Navigation />
      </div>
    </div>
  );
}
