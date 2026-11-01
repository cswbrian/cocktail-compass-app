import { useEffect, useState } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { CocktailCard } from '@/components/cocktail-card';
import { Cocktail } from '@/types/cocktail';
import { staticCocktailService } from '@/services/static-cocktail-service';
import {
  COCKTAIL_BOOKMARK_LISTS,
  CocktailBookmarkList,
  getCocktailBookmarks,
} from '@/lib/cocktail-bookmarks';

export function CocktailBookmarksList() {
  const { language } = useLanguage();
  const t = translations[language];
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === 'undefined') return 'want-to-try';
    return (
      localStorage.getItem('bookmarks-active-tab') ||
      'want-to-try'
    );
  });
  const [bookmarks, setBookmarks] = useState<
    CocktailBookmarkList[]
  >([]);
  const [cocktailsBySlug, setCocktailsBySlug] = useState<
    Map<string, Cocktail>
  >(new Map());

  useEffect(() => {
    setBookmarks(getCocktailBookmarks());

    let cancelled = false;
    staticCocktailService
      .getStaticCocktailsWithDetails()
      .then(cocktails => {
        if (cancelled) return;
        setCocktailsBySlug(
          new Map(
            cocktails.map(cocktail => [
              cocktail.slug,
              cocktail,
            ]),
          ),
        );
      })
      .catch(error => {
        console.error(
          'Failed to load cocktails for bookmarks:',
          error,
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const getBookmarkedCocktails = (listKey: string) => {
    const bookmarkList = bookmarks.find(
      b => b.key === listKey,
    );
    if (!bookmarkList) return [];

    return bookmarkList.items
      .map(slug => cocktailsBySlug.get(slug))
      .filter((cocktail): cocktail is Cocktail =>
        Boolean(cocktail),
      );
  };

  return (
    <div className="px-6">
      <Tabs
        value={activeTab}
        onValueChange={value => {
          setActiveTab(value);
          localStorage.setItem(
            'bookmarks-active-tab',
            value,
          );
        }}
      >
        <TabsList className="mb-4">
          {COCKTAIL_BOOKMARK_LISTS.map(list => {
            const bookmarkList = bookmarks.find(
              b => b.key === list.id,
            );
            return (
              <TabsTrigger key={list.id} value={list.id}>
                {String(t[list.nameKey as keyof typeof t])}
                <span className="ml-2 text-xs">
                  ({bookmarkList?.items.length || 0})
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {COCKTAIL_BOOKMARK_LISTS.map(list => {
          const bookmarkList = bookmarks.find(
            b => b.key === list.id,
          );
          const bookmarkedCocktails =
            getBookmarkedCocktails(list.id);

          return (
            <TabsContent key={list.id} value={list.id}>
              {!bookmarkList ||
              bookmarkList.items.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  {t.noBookmarksYet}
                </div>
              ) : bookmarkedCocktails.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  {t.noBookmarksYet}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bookmarkedCocktails.map(cocktail => (
                    <CocktailCard
                      key={cocktail.slug}
                      cocktail={cocktail}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
