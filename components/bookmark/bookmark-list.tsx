"use client";

import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import type { BookmarkList as BookmarkListType } from "@/types/bookmark";
import { Card } from "@/components/ui/card";
import { cocktailService } from "@/services/cocktail-service";

interface BookmarkListProps {
  lists: BookmarkListType[];
}

export function BookmarkList({ lists }: BookmarkListProps) {
  const { language } = useLanguage();
  const t = translations[language];

  if (lists.length === 0) {
    return <p className="text-muted-foreground">{t.noBookmarksYet}</p>;
  }

  return (
    <div className="space-y-4">
      {lists.map((list) => (
        <Card key={list.id} className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {list.name_key ? t[list.name_key as keyof typeof t] : list.name}
          </h3>
          <div className="space-y-2">
            {list.items?.map((item) => {
              const cocktail = cocktailService.getCocktailById(item.cocktail_id);
              if (!cocktail) return null;
              
              return (
                <div key={item.id} className="flex justify-between items-center">
                  <span>{cocktail.name[language]}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(item.added_at).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
} 