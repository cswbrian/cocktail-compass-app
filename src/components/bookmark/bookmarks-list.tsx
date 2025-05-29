'use client';

import { useState } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { CocktailCard } from '@/components/cocktail-card';
import { PlaceCard } from '@/components/place/PlaceCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  BookmarkList
} from '@/types/bookmark';
import { Cocktail } from '@/types/cocktail';
import { Place } from '@/types/place';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  ArrowUpDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function BookmarksListSkeleton() {
  return (
    <div>
      <div className="sticky top-0 z-10 bg-background px-6">
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 px-6">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-6 w-32" />
      </div>

      <div className="px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="rounded-lg border p-4 space-y-3">
              <Skeleton className="h-48 w-full rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface BookmarksListProps {
  bookmarks: BookmarkList[];
  isLoading: boolean;
}

export function BookmarksList({
  bookmarks,
  isLoading,
}: BookmarksListProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language];

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<{
    cocktails: boolean;
    places: boolean;
  }>({
    cocktails: false,
    places: false,
  });
  const [sortBy, setSortBy] = useState<
    'recentlyAdded' | 'alphabetical'
  >(() => {
    if (typeof window !== 'undefined') {
      return (
        (localStorage.getItem('bookmarks-sort-by') as
          | 'recentlyAdded'
          | 'alphabetical') || 'recentlyAdded'
      );
    }
    return 'recentlyAdded';
  });
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('bookmarks-active-tab') || ''
      );
    }
    return '';
  });

  if (!user) {
    navigate(`/${language}/login`);
    return null;
  }

  if (isLoading) {
    return <BookmarksListSkeleton />;
  }

  // Set initial active tab if not set
  if (!activeTab && bookmarks.length > 0) {
    const defaultList =
      bookmarks.find(list => list.is_default) ||
      bookmarks[0];
    setActiveTab(defaultList.id);
    localStorage.setItem(
      'bookmarks-active-tab',
      defaultList.id,
    );
  }

  const getBookmarkedItems = (
    listId: string,
  ): (Cocktail | Place)[] => {
    const list = bookmarks.find(b => b.id === listId);
    if (!list?.items) return [];

    // Show all items if both filters are in the same state (both true or both false)
    const showAll = filters.cocktails === filters.places;

    const bookmarkedCocktails = (showAll || filters.cocktails)
      ? list.items
          .filter(item => item.cocktail)
          .map(item => item.cocktail)
          .filter(
            (cocktail): cocktail is Cocktail =>
              cocktail !== null,
          )
      : [];

    const bookmarkedPlaces = (showAll || filters.places)
      ? list.items
          .filter(item => item.place)
          .map(item => item.place)
          .filter((place): place is Place => place !== null)
      : [];

    const allItems = [
      ...bookmarkedCocktails,
      ...bookmarkedPlaces,
    ];

    if (sortBy === 'alphabetical') {
      return allItems.sort((a, b) => {
        const aName =
          'name' in a && typeof a.name === 'object'
            ? a.name.en
            : a.name;
        const bName =
          'name' in b && typeof b.name === 'object'
            ? b.name.en
            : b.name;
        return String(aName).localeCompare(String(bName));
      });
    } else {
      return allItems.sort((a, b) => {
        const aItem = list.items?.find(
          item =>
            ('id' in a && item.cocktail_id === a.id) ||
            ('place_id' in a &&
              item.place_id === a.place_id),
        );
        const bItem = list.items?.find(
          item =>
            ('id' in b && item.cocktail_id === b.id) ||
            ('place_id' in b &&
              item.place_id === b.place_id),
        );
        return (
          new Date(bItem?.added_at || 0).getTime() -
          new Date(aItem?.added_at || 0).getTime()
        );
      });
    }
  };

  return (
    <div>
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
        <div className="sticky top-0 z-10 bg-background px-6">
          <TabsList className="mb-4">
            {bookmarks.map(list => (
              <TabsTrigger key={list.id} value={list.id}>
                {list.is_default
                  ? t[list.name_key as keyof typeof t]
                  : list.name}
                <span className="ml-2 text-xs">
                  ({(list.items || []).length})
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="mb-6 flex flex-col gap-4 px-6">
          <div className="flex gap-2">
            <Button
              variant={filters.cocktails ? "default" : "secondary"}
              size="sm"
              onClick={() => setFilters(prev => ({
                ...prev,
                cocktails: !prev.cocktails
              }))}
            >
              {t.cocktails}
            </Button>
            <Button
              variant={filters.places ? "default" : "secondary"}
              size="sm"
              onClick={() => setFilters(prev => ({
                ...prev,
                places: !prev.places
              }))}
            >
              {t.places}
            </Button>
          </div>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setIsDrawerOpen(true)}
          >
            <ArrowUpDown className="h-4 w-4 text-white" />
            <span className="text-sm text-white">
              {sortBy === 'recentlyAdded'
                ? t.recentlyAdded
                : t.alphabetical}
            </span>
          </div>
        </div>

        <Drawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
        >
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{t.sortBy}</DrawerTitle>
            </DrawerHeader>
            <div className="p-4">
              <RadioGroup
                value={sortBy}
                onValueChange={value => {
                  const newSortBy = value as
                    | 'recentlyAdded'
                    | 'alphabetical';
                  setSortBy(newSortBy);
                  localStorage.setItem(
                    'bookmarks-sort-by',
                    newSortBy,
                  );
                  setIsDrawerOpen(false);
                }}
              >
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem
                    value="recentlyAdded"
                    id="recentlyAdded"
                  />
                  <Label
                    htmlFor="recentlyAdded"
                    className="text-base cursor-pointer"
                  >
                    {t.recentlyAdded}
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <RadioGroupItem
                    value="alphabetical"
                    id="alphabetical"
                  />
                  <Label
                    htmlFor="alphabetical"
                    className="text-base cursor-pointer"
                  >
                    {t.alphabetical}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </DrawerContent>
        </Drawer>

        {bookmarks.map(list => (
          <TabsContent
            key={list.id}
            value={list.id}
            className="px-6"
          >
            {!list.items || list.items.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                {t.noBookmarksYet}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getBookmarkedItems(list.id).map(item =>
                  'place_id' in item ? (
                    <PlaceCard
                      key={(item as Place).place_id}
                      place={item as Place}
                      variant="compact"
                    />
                  ) : (
                    <CocktailCard
                      key={item.id}
                      cocktail={item as Cocktail}
                      variant="compact"
                    />
                  ),
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
