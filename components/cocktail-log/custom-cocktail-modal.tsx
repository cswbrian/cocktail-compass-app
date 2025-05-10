import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { translations } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

interface CustomCocktailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomCocktailValues: (values: { 
    nameEn: string;
    nameZh: string;
  }) => void;
}

export function CustomCocktailModal({
  isOpen,
  onClose,
  onCustomCocktailValues,
}: CustomCocktailModalProps) {
  const [customCocktailName, setCustomCocktailName] = useState("");
  const [customCocktailNameZh, setCustomCocktailNameZh] = useState("");
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  const handleSubmit = () => {
    if (!customCocktailName || !customCocktailNameZh) {
      toast({
        title: t.error,
        description: t.errorCreatingCocktail,
        variant: "destructive",
      });
      return;
    }

    onCustomCocktailValues({
      nameEn: customCocktailName,
      nameZh: customCocktailNameZh
    });
    
    // Reset form
    setCustomCocktailName("");
    setCustomCocktailNameZh("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[60]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[60]"
          >
            <div className="bg-background p-6 rounded-lg w-full max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-4">{t.createCustomCocktail}</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customCocktailName">{t.cocktailNameEn}</Label>
                  <Input
                    id="customCocktailName"
                    value={customCocktailName}
                    onChange={(e) => setCustomCocktailName(e.target.value)}
                    placeholder={t.cocktailNameEn}
                  />
                </div>
                <div>
                  <Label htmlFor="customCocktailNameZh">{t.cocktailNameZh}</Label>
                  <Input
                    id="customCocktailNameZh"
                    value={customCocktailNameZh}
                    onChange={(e) => setCustomCocktailNameZh(e.target.value)}
                    placeholder={t.cocktailNameZh}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={onClose}
                  >
                    {t.cancel}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!customCocktailName || !customCocktailNameZh}
                  >
                    {t.create}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 