import { Cocktail } from "@/types/cocktail";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { CocktailCard } from "@/components/cocktail-card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface TwistResultsProps {
  twists: Array<{ cocktail: Cocktail; distance: number }>;
  baseCocktail: Cocktail;
  onFindAgain: () => void;
}

export function TwistResults({
  twists,
  baseCocktail,
  onFindAgain,
}: TwistResultsProps) {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <h2 className="text-3xl mb-2">
        <span className="font-medium">{baseCocktail.name.en}</span>
        <span className="font-extralight"> {t.twists}</span>
      </h2>
      {language === "zh" && (
        <p className="text-muted-foreground mb-4">{baseCocktail.name.zh}</p>
      )}

      <Button className="mb-8" onClick={onFindAgain}>
        {t.reset}
      </Button>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {twists.map(({ cocktail, distance }, index) => (
          <motion.div
            key={cocktail.name.en}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <CocktailCard cocktail={cocktail} distance={distance} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
