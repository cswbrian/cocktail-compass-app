import { motion } from "framer-motion";
import { MultiSelect } from "@/components/ui/multi-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { useCocktail } from "@/context/CocktailContext";
import summary from "@/data/summary.json";
import { Button } from "../ui/button";

const getUniqueOptions = (
  items: { name: { [key: string]: string } }[],
  language: string
) => {
  const uniqueMap = new Map<string, { label: string; value: string }>();
  items.forEach((item) => {
    const label = language === 'zh' 
      ? `${item.name.en} / ${item.name.zh}`
      : item.name[language];
    const value = item.name.en;
    if (!uniqueMap.has(label)) {
      uniqueMap.set(label, { label, value });
    }
  });
  return Array.from(uniqueMap.values());
};

export default function Step3() {
  const { language } = useLanguage();
  const t = translations[language];
  const {
    selectedBaseSpirits,
    selectedLiqueurs,
    selectedIngredients,
    setSelectedBaseSpirits,
    setSelectedLiqueurs,
    setSelectedIngredients,
    bubbles,
    setBubbles,
  } = useCocktail();

  const handleSpiritButtonClick = (spirit: string) => {
    const matchingSpirits = summary.base_spirits
      .filter(item => item.name.en.toLowerCase().includes(spirit.toLowerCase()))
      .map(item => item.name.en);
    
    // Toggle selection
    const isSelected = matchingSpirits.every(spirit => selectedBaseSpirits.includes(spirit));
    if (isSelected) {
      setSelectedBaseSpirits(selectedBaseSpirits.filter(s => !matchingSpirits.includes(s)));
    } else {
      setSelectedBaseSpirits([...new Set([...selectedBaseSpirits, ...matchingSpirits])]);
    }
  };

  const spirits = [
    { en: 'Brandy', key: 'spiritBrandy' },
    { en: 'Gin', key: 'spiritGin' },
    { en: 'Rum', key: 'spiritRum' },
    { en: 'Tequila', key: 'spiritTequila' },
    { en: 'Vodka', key: 'spiritVodka' },
    { en: 'Whisky', key: 'spiritWhisky' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="space-y-8"
    >
      <h2>{t.step3Title || "Select Ingredients"}</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {spirits.map((spirit) => {
          const matchingSpirits = summary.base_spirits
            .filter(item => item.name.en.toLowerCase().includes(spirit.en.toLowerCase()))
            .map(item => item.name.en);
          const isSelected = matchingSpirits.every(s => selectedBaseSpirits.includes(s));
          
          return (
            <Button
              key={spirit.en}
              onClick={() => handleSpiritButtonClick(spirit.en)}
              variant={isSelected ? "default" : "outline"}
            >
              {t[spirit.key as keyof typeof t]}
            </Button>
          );
        })}
      </div>
      <div className="space-y-4">
        <MultiSelect
          options={getUniqueOptions(summary.base_spirits, language)}
          onValueChange={setSelectedBaseSpirits}
          placeholder={t.pleaseSelectBaseSpirits}
          enableSelectAll={false}
          value={selectedBaseSpirits}
        />
        <MultiSelect
          options={getUniqueOptions(summary.liqueurs, language)}
          onValueChange={setSelectedLiqueurs}
          placeholder={t.pleaseSelectLiqueurs}
          enableSelectAll={false}
          value={selectedLiqueurs}
        />
        <MultiSelect
          options={getUniqueOptions(summary.ingredients, language)}
          onValueChange={setSelectedIngredients}
          placeholder={t.pleaseSelectIngredients}
          enableSelectAll={false}
          value={selectedIngredients}
        />
      </div>
      <div className="space-y-2">
        <Label>{t.withBubbles}</Label>
        <RadioGroup
          defaultValue="no-preference"
          value={bubbles === null ? "no-preference" : bubbles ? "with-bubbles" : "no-bubbles"}
          onValueChange={(value: "no-preference" | "with-bubbles" | "no-bubbles") => {
            const bubblesState = {
              "no-preference": null,
              "with-bubbles": true,
              "no-bubbles": false
            }[value];
            
            setBubbles(bubblesState as boolean);
          }}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no-preference" id="no-preference" />
            <Label htmlFor="no-preference">{t.noPreference}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="with-bubbles" id="with-bubbles" />
            <Label htmlFor="with-bubbles">{t.hasBubbles}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no-bubbles" id="no-bubbles" />
            <Label htmlFor="no-bubbles">{t.noBubbles}</Label>
          </div>
        </RadioGroup>
      </div>
    </motion.div>
  );
}; 