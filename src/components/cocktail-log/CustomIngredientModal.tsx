import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { translations } from '@/translations';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import {
  ingredientService,
  Ingredient,
  IngredientType,
} from '@/services/ingredient-service';
import { AuthService } from '@/services/auth-service';
import { toast } from 'sonner';

interface CustomIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngredientCreated: (ingredient: Ingredient) => void;
  initialName?: string;
}

export function CustomIngredientModal({
  isOpen,
  onClose,
  onIngredientCreated,
  initialName = '',
}: CustomIngredientModalProps) {
  const [nameEn, setNameEn] = useState(initialName);
  const [nameZh, setNameZh] = useState(initialName);
  const [type, setType] =
    useState<IngredientType>('base_spirit');
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();
  const t =
    translations[language as keyof typeof translations];

  const handleCreate = async () => {
    if (!nameEn) {
      toast.error(t.errorCreatingIngredient);
      return;
    }

    try {
      setIsLoading(true);
      const user = await AuthService.getCurrentSession();
      if (!user) {
        toast.error(t.notAuthenticated);
        return;
      }

      const ingredient =
        await ingredientService.createIngredient(
          nameEn,
          nameZh || nameEn,
          type,
        );

      onIngredientCreated(ingredient);

      // Reset form
      setNameEn('');
      setNameZh('');
      setType('base_spirit');
      onClose();
      toast.success(t.success, {
        description: t.createNewIngredient,
      });
    } catch (error) {
      console.error('Error creating ingredient:', error);
      toast.error(t.errorCreatingIngredient);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
            }}
            className="fixed inset-0 z-50 bg-background"
          >
            <div className="h-full flex flex-col">
              <div className="px-4 py-3 border-b">
                <div className="flex items-center relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-0"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  <h2 className="flex-1 text-center text-lg font-semibold">
                    {t.createNewIngredient}
                  </h2>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-4 space-y-4">
                  <div>
                    <Label htmlFor="nameEn">
                      {t.ingredientNameEn}
                    </Label>
                    <Input
                      id="nameEn"
                      value={nameEn}
                      onChange={e => {
                        const value = e.target.value;
                        setNameEn(value);
                        setNameZh(value);
                      }}
                      placeholder={t.ingredientNameEn}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nameZh">
                      {t.ingredientNameZh}
                    </Label>
                    <Input
                      id="nameZh"
                      value={nameZh}
                      onChange={e =>
                        setNameZh(e.target.value)
                      }
                      placeholder={t.ingredientNameZh}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.ingredientType}</Label>
                    <RadioGroup
                      value={type}
                      onValueChange={value =>
                        setType(value as IngredientType)
                      }
                      className="mt-4 flex flex-col space-y-2"
                    >
                      <Label
                        htmlFor="base_spirit"
                        className="cursor-pointer"
                      >
                        <div className="flex items-top space-x-2">
                          <RadioGroupItem
                            value="base_spirit"
                            id="base_spirit"
                          />
                          <div className="flex flex-col gap-y-1">
                            <span>{t.baseSpirit}</span>
                            <span className="text-sm text-muted-foreground">
                              {t.baseSpiritDescription}
                            </span>
                          </div>
                        </div>
                      </Label>
                      <Label
                        htmlFor="liqueur"
                        className="cursor-pointer"
                      >
                        <div className="flex items-top space-x-2">
                          <RadioGroupItem
                            value="liqueur"
                            id="liqueur"
                          />
                          <div className="flex flex-col gap-y-1">
                            <span>{t.liqueur}</span>
                            <span className="text-sm text-muted-foreground">
                              {t.liqueurDescription}
                            </span>
                          </div>
                        </div>
                      </Label>
                      <Label
                        htmlFor="ingredient"
                        className="cursor-pointer"
                      >
                        <div className="flex items-top space-x-2">
                          <RadioGroupItem
                            value="ingredient"
                            id="ingredient"
                          />
                          <div className="flex flex-col gap-y-1">
                            <span>{t.ingredient}</span>
                            <span className="text-sm text-muted-foreground">
                              {t.ingredientDescription}
                            </span>
                          </div>
                        </div>
                      </Label>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t mt-auto">
                <div className="flex w-full gap-2">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    {t.cancel}
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={!nameEn || isLoading}
                    className="flex-1"
                  >
                    {isLoading ? t.saving : t.create}
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
