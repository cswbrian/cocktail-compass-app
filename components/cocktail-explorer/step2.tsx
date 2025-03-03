import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { useCocktail } from "@/context/CocktailContext";

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
];

export default function Step2() {
  const { language } = useLanguage();
  const t = translations[language];
  const { selectedFlavors, handleFlavorSelect } = useCocktail();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="space-y-8"
    >
      <h2>{t.step2Title}</h2>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {FLAVORS.map((flavor) => (
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
}; 