import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { translations } from '@/translations';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Plus } from 'lucide-react';
import { cn, formatBilingualText } from '@/lib/utils';
import {
  ingredientService,
  Ingredient,
  IngredientType,
} from '@/services/ingredient-service';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CustomIngredientModal } from './CustomIngredientModal';
import { customCocktailService } from '@/services/custom-cocktail-service';
import { AuthService } from '@/services/auth-service';
import { toast } from 'sonner';
import { useCocktailDetails } from '@/hooks/useCocktailDetails';
import { supabase } from '@/lib/supabase';

interface CustomCocktailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomCocktailValues: (values: {
    id: string;
    nameEn: string;
    nameZh?: string;
    ingredients: {
      id: string;
      type: IngredientType;
      nameEn: string;
      nameZh: string;
    }[];
  }) => void;
  initialName?: string;
}

export function CustomCocktailModal({
  isOpen,
  onClose,
  onCustomCocktailValues,
  initialName = '',
}: CustomCocktailModalProps) {
  const [customCocktailName, setCustomCocktailName] =
    useState(initialName);
  const [customCocktailNameZh, setCustomCocktailNameZh] =
    useState(initialName);
  const [ingredients, setIngredients] = useState<
    Ingredient[]
  >([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<
    Ingredient[]
  >([]);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [showNewIngredientForm, setShowNewIngredientForm] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();
  const t =
    translations[language as keyof typeof translations];
  const { mutate: mutateCocktailDetails } =
    useCocktailDetails();

  useEffect(() => {
    const fetchAllIngredients = async () => {
      try {
        const ingredients = await ingredientService.getAllIngredients();
        setAllIngredients(ingredients);
      } catch (error) {
        console.error('Error fetching all ingredients:', error);
        toast.error(t.errorSearchingIngredients);
      }
    };

    if (isOpen) {
      fetchAllIngredients();
    }
  }, [isOpen, t.errorSearchingIngredients]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const results = allIngredients.filter(ingredient => 
      ingredient.nameEn.toLowerCase().includes(query.toLowerCase()) ||
      ingredient.nameZh.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  };

  const handleAddIngredient = (ingredient: Ingredient) => {
    if (!ingredients.some(i => i.id === ingredient.id)) {
      setIngredients([...ingredients, ingredient]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleCreateIngredient = async (
    ingredient: Ingredient,
  ) => {
    handleAddIngredient(ingredient);
    setShowNewIngredientForm(false);
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    setIngredients(
      ingredients.filter(i => i.id !== ingredientId),
    );
  };

  const handleSubmit = async () => {
    if (!customCocktailName) {
      toast.error(t.errorCreatingCocktail);
      return;
    }

    try {
      setIsLoading(true);
      const user = await AuthService.getCurrentSession();
      if (!user) {
        toast.error(t.notAuthenticated);
        return;
      }

      const cocktail = await customCocktailService.createCustomCocktail(
        {
          en: customCocktailName,
          zh: customCocktailNameZh || customCocktailName,
        },
        user.id,
        ingredients.length > 0
          ? ingredients.map(ingredient => ({
              id: ingredient.id,
              type: ingredient.type,
              nameEn: ingredient.nameEn,
              nameZh: ingredient.nameZh,
            }))
          : []
      );

      // Invalidate the cocktail details cache
      await mutateCocktailDetails();

      onCustomCocktailValues({
        id: cocktail.id,
        nameEn: customCocktailName,
        nameZh: customCocktailNameZh || undefined,
        ingredients,
      });

      // Reset form
      setCustomCocktailName('');
      setCustomCocktailNameZh('');
      setIngredients([]);
      onClose();
      toast.success(t.success, {
        description: t.createCustomCocktail,
      });
    } catch (error) {
      console.error('Error creating custom cocktail:', error);
      toast.error(t.errorCreatingCocktail);
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
                    {t.createCustomCocktail}
                  </h2>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-4 space-y-4">
                  <div>
                    <Label htmlFor="customCocktailName">
                      {t.cocktailNameEn}
                    </Label>
                    <Input
                      id="customCocktailName"
                      value={customCocktailName}
                      onChange={e =>
                        setCustomCocktailName(
                          e.target.value,
                        )
                      }
                      placeholder={t.cocktailNameEn}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customCocktailNameZh">
                      {t.cocktailNameZh}
                    </Label>
                    <Input
                      id="customCocktailNameZh"
                      value={customCocktailNameZh}
                      onChange={e =>
                        setCustomCocktailNameZh(
                          e.target.value,
                        )
                      }
                      placeholder={t.cocktailNameZh}
                    />
                  </div>

                  <div>
                    <Label>{t.ingredients}</Label>
                    <div className="space-y-2">
                      {ingredients.map(ingredient => (
                        <div
                          key={ingredient.id}
                          className="flex items-center justify-between bg-secondary/50 p-2 rounded"
                        >
                          <span>
                            {formatBilingualText(
                              {
                                en: ingredient.nameEn,
                                zh: ingredient.nameZh,
                              },
                              language,
                            )}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleRemoveIngredient(
                                ingredient.id,
                              )
                            }
                          >
                            ×
                          </Button>
                        </div>
                      ))}

                      <div className="relative">
                        <Search className="absolute left-2 top-2 h-5 w-5 text-muted-foreground" />
                        <Input
                          placeholder={t.searchIngredients}
                          value={searchQuery}
                          onChange={e =>
                            handleSearch(e.target.value)
                          }
                          className="pl-9 pr-9"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setSearchResults([]);
                            }}
                            className="absolute right-2 top-2 h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>

                      {searchQuery && (
                        <ScrollArea className="h-[200px] border rounded-md">
                          <div className="p-2 space-y-1">
                            {searchResults.length > 0 && (
                              <>
                                {searchResults.map(
                                  ingredient => (
                                    <button
                                      key={ingredient.id}
                                      onClick={() =>
                                        handleAddIngredient(
                                          ingredient,
                                        )
                                      }
                                      className={cn(
                                        'w-full text-left p-2 rounded-md hover:bg-accent transition-colors',
                                        'flex flex-col',
                                      )}
                                    >
                                      <span className="font-medium">
                                        {formatBilingualText(
                                          {
                                            en: ingredient.nameEn,
                                            zh: ingredient.nameZh,
                                          },
                                          language,
                                        )}
                                      </span>
                                      <span className="text-sm text-muted-foreground">
                                        {
                                          t[
                                            ingredient.type ===
                                            'base_spirit'
                                              ? 'baseSpirit'
                                              : ingredient.type
                                          ]
                                        }
                                      </span>
                                    </button>
                                  ),
                                )}
                                <div className="pt-2 border-t" />
                              </>
                            )}
                            <div className="text-center text-sm text-muted-foreground mb-2">
                              {t.cannotFindIngredient}
                            </div>
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() =>
                                setShowNewIngredientForm(
                                  true,
                                )
                              }
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              {t.createNewIngredient}
                            </Button>
                          </div>
                        </ScrollArea>
                      )}
                    </div>
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
                    onClick={handleSubmit}
                    disabled={
                      !customCocktailName || isLoading
                    }
                    className="flex-1"
                  >
                    {isLoading ? t.saving : t.create}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {showNewIngredientForm && (
            <CustomIngredientModal
              isOpen={showNewIngredientForm}
              onClose={() =>
                setShowNewIngredientForm(false)
              }
              onIngredientCreated={handleCreateIngredient}
              initialName={searchQuery}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}
