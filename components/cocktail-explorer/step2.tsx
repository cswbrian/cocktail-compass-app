import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { useCocktail } from "@/context/CocktailContext";
import { flavorClasses } from "@/components/flavor-descriptor";

type TranslationKey = keyof typeof translations.en;
type FlavorGroupKey = "flavorGroupBasic" | "flavorGroupFruit" | "flavorGroupPlant" | "flavorGroupWarm" | "flavorGroupRich" | "flavorGroupOther";

const FLAVOR_GROUPS: Record<FlavorGroupKey, string[]> = {
  flavorGroupBasic: ["Bitter", "Salty", "Umami"],
  flavorGroupFruit: ["Fruity", "Citrus", "Tropical"],
  flavorGroupPlant: ["Herbal", "Floral", "Grassy", "Woody"],
  flavorGroupWarm: ["Spicy", "Smoky"],
  flavorGroupRich: ["Coffee", "Chocolate", "Vanilla", "Nutty"],
  flavorGroupOther: ["Earth", "Savory", "Creamy", "Yeasty"],
};

// Get all flavors as a flat array when needed
const FLAVORS = Object.values(FLAVOR_GROUPS).flat();

export default function Step2() {
  const { language } = useLanguage();
  const t = translations[language] as typeof translations.en;
  const { selectedFlavors, handleFlavorSelect } = useCocktail();

  const handleReset = () => {
    FLAVORS.forEach((flavor) => {
      if (selectedFlavors.includes(flavor)) {
        handleFlavorSelect(flavor);
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="space-y-8"
    >
      <h2>{t.step2Title}</h2>
      <div className="space-y-6">
        {(Object.entries(FLAVOR_GROUPS) as [FlavorGroupKey, string[]][]).map(([groupKey, flavors]) => (
          <div key={groupKey} className="space-y-2">
            <h4 className="font-bold">{t[groupKey]}</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {flavors.map((flavor) => (
                <Button
                  key={flavor}
                  variant="outline"
                  onClick={() => handleFlavorSelect(flavor)}
                  disabled={
                    !selectedFlavors.includes(flavor) && selectedFlavors.length >= 3
                  }
                  className={`${
                    selectedFlavors.includes(flavor) &&
                    flavorClasses[flavor as keyof typeof flavorClasses]
                  }`}
                >
                  {t[flavor.toLowerCase() as TranslationKey]}
                </Button>
              ))}
            </div>
          </div>
        ))}
        {selectedFlavors.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button onClick={handleReset} className="mt-4">
              {t.reset}
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
