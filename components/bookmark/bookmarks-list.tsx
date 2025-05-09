"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { CocktailCard } from "@/components/cocktail-card";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cocktailService } from "@/services/cocktail-service";
import { bookmarkService } from "@/services/bookmark-service";
import { BookmarkList } from "@/types/bookmark";
import { Cocktail } from "@/types/cocktail";
import { Loading } from "@/components/ui/loading";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowUpDown, LayoutGrid, List } from "lucide-react";

// Default lists are now managed by the bookmark service

export function BookmarksList() {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const t = translations[language];

  const [bookmarks, setBookmarks] = useState<BookmarkList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'default' | 'compact'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('bookmarks-view-mode') as 'default' | 'compact') || 'compact';
    }
    return 'compact';
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'recentlyAdded' | 'alphabetical'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('bookmarks-sort-by') as 'recentlyAdded' | 'alphabetical') || 'recentlyAdded';
    }
    return 'recentlyAdded';
  });
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bookmarks-active-tab') || '';
    }
    return '';
  });
  const [isMigrating, setIsMigrating] = useState(false);
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);

  console.log('setIsMigrating', setIsMigrating);
  useEffect(() => {
    if (!user) {
      router.push(`/${language}/login`);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        // Initialize both services
        await Promise.all([
          bookmarkService.initializeDefaultLists(),
          cocktailService.initialize()
        ]);

        // Get bookmarks and cocktails
        const [lists, allCocktails] = await Promise.all([
          bookmarkService.getBookmarks(),
          cocktailService.getAllCocktailsWithDetails()
        ]);

        setBookmarks(lists);
        setCocktails(allCocktails);

        // Set initial active tab if not set
        if (!activeTab && lists.length > 0) {
          const defaultList = lists.find(list => list.is_default) || lists[0];
          setActiveTab(defaultList.id);
          localStorage.setItem('bookmarks-active-tab', defaultList.id);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error(t.errorLoadingBookmarks);
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading) {
      loadData();
    }
  }, [user, loading, language, router, t, activeTab]);

  if (loading || isLoading || isMigrating) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loading size="md" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getBookmarkedCocktails = (listId: string): Cocktail[] => {
    const list = bookmarks.find(b => b.id === listId);
    if (!list?.items) return [];

    const bookmarkedCocktails = list.items
      .map(item => {
        const cocktail = cocktails.find(c => c.id === item.cocktail_id);
        return cocktail || null;
      })
      .filter((cocktail): cocktail is Cocktail => cocktail !== null);

    if (sortBy === 'alphabetical') {
      return [...bookmarkedCocktails].sort((a, b) => a.name.en.localeCompare(b.name.en));
    } else {
      return [...bookmarkedCocktails].sort((a, b) => {
        const aItem = list.items?.find(item => item.cocktail_id === a.id);
        const bItem = list.items?.find(item => item.cocktail_id === b.id);
        return new Date(bItem?.added_at || 0).getTime() - new Date(aItem?.added_at || 0).getTime();
      });
    }
  };

  return (
    <div>
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          localStorage.setItem('bookmarks-active-tab', value);
        }}
      >
        <div className="sticky top-0 z-10 bg-background px-6">
          <TabsList className="mb-4">
            {bookmarks.map((list) => (
              <TabsTrigger key={list.id} value={list.id}>
                {list.is_default ? t[list.name_key as keyof typeof t] : list.name}
                <span className="ml-2 text-xs">
                  ({(list.items || []).length})
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="mb-6 flex justify-between items-center px-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsDrawerOpen(true)}>
            <ArrowUpDown className="h-4 w-4 text-white" />
            <span className="text-sm text-white">
              {sortBy === 'recentlyAdded' ? t.recentlyAdded : t.alphabetical}
            </span>
          </div>

          <div 
            className="flex items-center cursor-pointer"
            onClick={() => {
              const newViewMode = viewMode === 'default' ? 'compact' : 'default';
              setViewMode(newViewMode);
              localStorage.setItem('bookmarks-view-mode', newViewMode);
            }}
          >
            {viewMode === 'default' ? (
              <List className="h-4 w-4 text-white" />
            ) : (
              <LayoutGrid className="h-4 w-4 text-white" />
            )}
          </div>
        </div>

        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{t.sortBy}</DrawerTitle>
            </DrawerHeader>
            <div className="p-4">
              <RadioGroup
                value={sortBy}
                onValueChange={(value) => {
                  const newSortBy = value as 'recentlyAdded' | 'alphabetical';
                  setSortBy(newSortBy);
                  localStorage.setItem('bookmarks-sort-by', newSortBy);
                  setIsDrawerOpen(false);
                }}
              >
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="recentlyAdded" id="recentlyAdded" />
                  <Label htmlFor="recentlyAdded" className="text-base cursor-pointer">{t.recentlyAdded}</Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value="alphabetical" id="alphabetical" />
                  <Label htmlFor="alphabetical" className="text-base cursor-pointer">{t.alphabetical}</Label>
                </div>
              </RadioGroup>
            </div>
          </DrawerContent>
        </Drawer>

        {bookmarks.map((list) => (
          <TabsContent key={list.id} value={list.id} className="px-6">
            {(!list.items || list.items.length === 0) ? (
              <div className="text-center text-muted-foreground py-8">
                {t.noBookmarksYet}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getBookmarkedCocktails(list.id).map((cocktail) => (
                  <CocktailCard
                    key={cocktail.id}
                    cocktail={cocktail}
                    variant={viewMode}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
