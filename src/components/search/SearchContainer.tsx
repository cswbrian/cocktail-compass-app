"use client";

import { useState, useEffect } from 'react';
import { CocktailPreview } from "@/types/cocktail";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { useNavigate } from "react-router-dom";
import { slugify, normalizeText, formatCocktailName } from "@/lib/utils";
import summary from "@/data/summary.json";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Clock, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SearchClientProps {
  cocktails: CocktailPreview[];
}

interface SearchItem {
  name: string;
  value: string;
  type: 'cocktail' | 'ingredient';
  category: string;
  slug: string;
}

interface RecentSearch {
  slug: string;
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
          onClick={() => onClose?.(item.slug)}
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

  useEffect(() => {
    const storedSearches = localStorage.getItem('recentSearches');
    if (storedSearches) {
      setRecentSearches(JSON.parse(storedSearches));
    }
  }, []);

  const updateRecentSearches = (newSearch: Omit<RecentSearch, 'timestamp'>) => {
    const updatedSearches = [
      { ...newSearch, timestamp: Date.now() },
      ...recentSearches.filter(item => item.slug !== newSearch.slug)
    ].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  const removeRecentSearch = (slug: string) => {
    const updatedSearches = recentSearches.filter(item => item.slug !== slug);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const searchItems: SearchItem[] = [
    ...cocktails.map(cocktail => ({
      name: formatCocktailName(cocktail.name, language),
      value: `cocktail:${cocktail.name.en}`,
      type: 'cocktail' as const,
      category: 'cocktail',
      slug: slugify(cocktail.name.en)
    })),
    ...summary.base_spirits.map(spirit => ({
      name: formatCocktailName(spirit.name, language),
      value: `ingredient:${spirit.name.en}`,
      type: 'ingredient' as const,
      category: 'baseSpirit',
      slug: slugify(spirit.name.en)
    })),
    ...summary.liqueurs.map(liqueur => ({
      name: formatCocktailName(liqueur.name, language),
      value: `ingredient:${liqueur.name.en}`,
      type: 'ingredient' as const,
      category: 'liqueur',
      slug: slugify(liqueur.name.en)
    })),
    ...summary.ingredients.map(ingredient => ({
      name: formatCocktailName(ingredient.name, language),
      value: `ingredient:${ingredient.name.en}`,
      type: 'ingredient' as const,
      category: 'ingredient',
      slug: slugify(ingredient.name.en)
    }))
  ].sort((a, b) => a.name.localeCompare(b.name));

  const filteredItems = searchItems.filter(item => {
    const normalizedSearch = normalizeText(searchQuery);
    const normalizedName = normalizeText(item.name);
    return normalizedName.includes(normalizedSearch);
  });

  const handleItemSelect = (value: string, item: SearchItem) => {
    updateRecentSearches({ slug: item.slug, type: item.type });
    const [type, name] = value.split(':');
    
    if (type === 'cocktail') {
      navigate(`/${language}/cocktails/${slugify(name)}`);
    } else if (type === 'ingredient') {
      navigate(`/${language}/ingredients/${slugify(name)}`);
    }
  };

  const getItemDetails = (recentSearch: RecentSearch): SearchItem | null => {
    const item = searchItems.find(item => item.slug === recentSearch.slug);
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
                          key={item.value}
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
                      key={recentSearch.slug}
                      item={itemDetails}
                      onSelect={handleItemSelect}
                      showCloseButton
                      onClose={() => removeRecentSearch(recentSearch.slug)}
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