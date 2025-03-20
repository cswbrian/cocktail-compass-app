"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import cocktails from "@/data/cocktails.json";
import { CocktailCard } from "@/components/cocktail-card";
import { slugify } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";

const BOOKMARK_LISTS = [
  { id: "want-to-try", nameKey: "wantToTry" },
  { id: "favorites", nameKey: "favorites" },
  { id: "dont-like", nameKey: "dontLike" },
];

interface BookmarkItem {
  key: string;
  items: string[];
}

export function BookmarksList() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const t = translations[language];
  const [activeTab, setActiveTab] = useState("favorites");
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('returnUrl', pathname || '/');
      router.push(`/${language}/login`);
      return;
    }

    // Load bookmarks from localStorage
    const savedBookmarks = localStorage.getItem("bookmarks");
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    } else {
      // Initialize with empty lists if no bookmarks exist
      const initialBookmarks: BookmarkItem[] = BOOKMARK_LISTS.map(list => ({
        key: list.id,
        items: []
      }));
      setBookmarks(initialBookmarks);
      localStorage.setItem("bookmarks", JSON.stringify(initialBookmarks));
    }
  }, [user, language, router, pathname]);

  if (!user) {
    return null; // Return null since we're redirecting
  }

  const getBookmarkedCocktails = (listKey: string) => {
    const bookmarkList = bookmarks.find(b => b.key === listKey);
    if (!bookmarkList) return [];
    
    return cocktails.filter((cocktail) => 
      bookmarkList.items.includes(slugify(cocktail.name.en))
    );
  };

  return (
    <Tabs defaultValue="favorites" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-4">
        {BOOKMARK_LISTS.map((list) => {
          const bookmarkList = bookmarks.find(b => b.key === list.id);
          return (
            <TabsTrigger key={list.id} value={list.id}>
              {t[list.nameKey as keyof typeof t]}
              <span className="ml-2 text-xs">
                ({bookmarkList?.items.length || 0})
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {BOOKMARK_LISTS.map((list) => {
        const bookmarkList = bookmarks.find(b => b.key === list.id);
        return (
          <TabsContent key={list.id} value={list.id}>
            {!bookmarkList || bookmarkList.items.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                {t.noBookmarksYet}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getBookmarkedCocktails(list.id).map((cocktail) => (
                  <CocktailCard
                    key={slugify(cocktail.name.en)}
                    cocktail={cocktail}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
} 