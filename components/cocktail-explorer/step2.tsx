import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { useCocktail } from "@/context/CocktailContext";
import { flavorClasses } from "@/components/flavor-descriptor";

const FLAVORS = [
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
  "Coffee",
  "Vanilla",
  "Smoky",
  "Earth",
  "Savory",
  "Creamy",
  "Woody",
  "Grassy",
  "Yeasty",
  "Chocolate",
];

export default function Step2() {
  const { language } = useLanguage();
  const t = translations[language];
  const { selectedFlavors, handleFlavorSelect } = useCocktail();

  const handleReset = () => {
    FLAVORS.forEach(flavor => {
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
      <div className="space-y-4">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {FLAVORS.map((flavor) => (
            <Button
              key={flavor}
              variant="ghost"
              onClick={() => handleFlavorSelect(flavor)}
              disabled={
                !selectedFlavors.includes(flavor) && selectedFlavors.length >= 3
              }
              className={`${
                selectedFlavors.includes(flavor)
                  ? flavorClasses[flavor as keyof typeof flavorClasses]
                  : "border border-gray-200"
              }`}
            >
              {t[flavor.toLowerCase() as keyof typeof t]}
            </Button>
          ))}
        </div>
        {selectedFlavors.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={handleReset}
              className="mt-4"
            >
              {t.reset || 'Reset'}
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}; 