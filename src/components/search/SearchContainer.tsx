"use client";

import { useState, useEffect } from 'react';
import { CocktailPreview } from "@/types/cocktail";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { useNavigate } from "react-router-dom";
import { normalizeText, formatBilingualText } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Clock, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCocktailDetails } from "@/hooks/useCocktailDetails";
import { useIngredients } from "@/hooks/useIngredients";

interface SearchClientProps {
  cocktails: CocktailPreview[];
}

interface SearchItem {
  id: string;
  name: string;
  value: string;
  type: 'cocktail' | 'ingredient';
  category: string;
}

interface RecentSearch {
  id: string;
  type: 'cocktail' | 'ingredient';
  timestamp: number;
}

interface SearchItemProps {
  item: SearchItem;
  onSelect: (value: string, item: SearchItem) => void;
  showCloseButton?: boolean;
  onClose?: (value: string) => void;
  t: Record<string, string>;
}

function SearchItem({ item, onSelect, showCloseButton, onClose, t }: SearchItemProps) {
  return (
    <div className="group flex items-center">
      <button
        onClick={() => onSelect(item.value, item)}
        className={cn(
          "flex-1 text-left p-2 rounded-md hover:bg-accent transition-colors",
          "flex flex-col"
        )}
      >
        <span className="font-medium">{item.name}</span>
        <span className="text-sm text-muted-foreground">{t[item.category]}</span>
      </button>
      {showCloseButton && (
        <button
          onClick={() => onClose?.(item.id)}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function SearchContainer({ cocktails }: SearchClientProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const { cocktailDetails } = useCocktailDetails();
  const { baseSpirits, liqueurs, otherIngredients } = useIngredients();

  useEffect(() => {
    const storedSearches = localStorage.getItem('recentSearches');
    if (storedSearches) {
      setRecentSearches(JSON.parse(storedSearches));
    }
  }, []);

  const updateRecentSearches = (newSearch: Omit<RecentSearch, 'timestamp'>) => {
    const updatedSearches = [
      { ...newSearch, timestamp: Date.now() },
      ...recentSearches.filter(item => item.id !== newSearch.id)
    ].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  const removeRecentSearch = (id: string) => {
    const updatedSearches = recentSearches.filter(item => item.id !== id);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const searchItems: SearchItem[] = [
    ...cocktails.map(cocktail => ({
      id: cocktail.id,
      name: formatBilingualText(cocktail.name, language),
      value: `cocktail:${cocktail.name.en}`,
      type: 'cocktail' as const,
      category: 'cocktail',
    })),
    ...baseSpirits.map(spirit => ({
      id: spirit.id,
      name: formatBilingualText({ en: spirit.nameEn, zh: spirit.nameZh }, language),
      value: `ingredient:${spirit.nameEn}`,
      type: 'ingredient' as const,
      category: 'baseSpirit',
    })),
    ...liqueurs.map(liqueur => ({
      id: liqueur.id,
      name: formatBilingualText({ en: liqueur.nameEn, zh: liqueur.nameZh }, language),
      value: `ingredient:${liqueur.nameEn}`,
      type: 'ingredient' as const,
      category: 'liqueur',
    })),
    ...otherIngredients.map(ingredient => ({
      id: ingredient.id,
      name: formatBilingualText({ en: ingredient.nameEn, zh: ingredient.nameZh }, language),
      value: `ingredient:${ingredient.nameEn}`,
      type: 'ingredient' as const,
      category: 'ingredient',
    }))
  ].sort((a, b) => a.name.localeCompare(b.name));

  const filteredItems = searchItems.filter(item => {
    const normalizedSearch = normalizeText(searchQuery);
    const normalizedName = normalizeText(item.name);
    return normalizedName.includes(normalizedSearch);
  });

  const handleItemSelect = (value: string, item: SearchItem) => {
    updateRecentSearches({ id: item.id, type: item.type });
    const [type, name] = value.split(':');
    
    if (type === 'cocktail') {
      navigate(`/${language}/cocktails/${item.id}`);
    } else if (type === 'ingredient') {
      navigate(`/${language}/ingredients/${item.id}`);
    }
  };

  const getItemDetails = (recentSearch: RecentSearch): SearchItem | null => {
    const item = searchItems.find(item => item.id === recentSearch.id);
    if (!item) return null;
    return item;
  };

  return (
    <div className="flex flex-col h-full">
      <div className='mt-1'>
        <div className="relative">
          <Search className="absolute left-2 top-2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder={t.search}
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4">
          {searchQuery ? (
            filteredItems.length === 0 ? (
              <div className="text-center text-muted-foreground">
                {t.noResultsFound}
              </div>
            ) : (
              <>
                {[
                  { key: 'cocktail', translation: t.cocktail },
                  { key: 'baseSpirit', translation: t.baseSpirit },
                  { key: 'liqueur', translation: t.liqueur },
                  { key: 'ingredient', translation: t.ingredient }
                ].map(({ key, translation }) => {
                  const categoryItems = filteredItems.filter(item => item.category === key);
                  if (categoryItems.length === 0) return null;

                  return (
                    <div key={key}>
                      <h2 className="font-bold px-2 mt-4">{translation}</h2>
                      {categoryItems.map((item) => (
                        <SearchItem
                          key={item.id}
                          item={item}
                          onSelect={handleItemSelect}
                          t={t}
                        />
                      ))}
                    </div>
                  );
                })}
              </>
            )
          ) : recentSearches.length > 0 ? (
            <div className="space-y-2">
              <h2 className="font-bold px-2 mt-4 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t.recentSearches}
              </h2>
              <div className="space-y-1">
                {recentSearches.map((recentSearch) => {
                  const itemDetails = getItemDetails(recentSearch);
                  if (!itemDetails) return null;
                  
                  return (
                    <SearchItem
                      key={recentSearch.id}
                      item={itemDetails}
                      onSelect={handleItemSelect}
                      showCloseButton
                      onClose={removeRecentSearch}
                      t={t}
                    />
                  );
                })}
              </div>
              <div className="px-2 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t.clearRecentSearches}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              {t.searchPlaceholder}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 