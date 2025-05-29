'use client';

import * as React from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sendGAEvent } from '@/lib/ga';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { bookmarkService } from '@/services/bookmark-service';
import {
  BookmarkList,
  BookmarkedItem,
} from '@/types/bookmark';
import { toast } from 'sonner';
import { cocktailService } from '@/services/cocktail-service';
import useSWR from 'swr';
import { fetchers, CACHE_KEYS } from '@/lib/swr-config';

interface BookmarkButtonProps {
  cocktailId?: string;
  placeId?: string;
}

export function BookmarkButton({
  cocktailId,
  placeId,
}: BookmarkButtonProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[language];
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Use SWR to fetch and cache bookmarks
  const { data: bookmarks = [], mutate: mutateBookmarks } = useSWR(
    user ? CACHE_KEYS.BOOKMARKS : null,
    fetchers.getBookmarks,
    {
      revalidateOnFocus: false,
      revalidateIfStale: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  // Use SWR to fetch and cache bookmarked items
  const { data: bookmarkedItems = {}, mutate: mutateBookmarkedItems } = useSWR(
    user && bookmarks.length > 0
      ? bookmarks.map(list => [CACHE_KEYS.BOOKMARKS, list.id])
      : null,
    async () => {
      const itemsMap: { [key: string]: BookmarkedItem[] } = {};
      for (const list of bookmarks) {
        const items = await bookmarkService.getBookmarkedItems(list.id);
        itemsMap[list.id] = items;
      }
      return itemsMap;
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  const handleBookmarkClick = () => {
    if (!user) {
      localStorage.setItem('returnUrl', location.pathname || '/');
      navigate(`/${language}/login`);
      return;
    }
    setOpen(true);
  };

  const toggleList = async (listId: string) => {
    try {
      setIsLoading(true);
      const items = bookmarkedItems[listId] || [];
      const isInList = items.some(item => 
        (cocktailId && item.cocktail_id === cocktailId) || 
        (placeId && item.place_id === placeId)
      );

      if (isInList) {
        await bookmarkService.removeBookmark(listId, cocktailId, placeId);
      } else {
        await bookmarkService.addBookmark(listId, cocktailId, placeId);
      }

      // Track the event
      const action = isInList ? 'remove' : 'add';
      const itemType = cocktailId ? 'cocktail' : 'place';
      sendGAEvent('bookmark', `bookmark_${action}`, `${listId}:${itemType}:${cocktailId || placeId}`);

      // Mutate both bookmarks and bookmarked items to reflect the changes
      await Promise.all([
        mutateBookmarks(),
        mutateBookmarkedItems()
      ]);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error(t.errorMigratingBookmarks);
    } finally {
      setIsLoading(false);
    }
  };

  const isInAnyList = user
    ? Object.values(bookmarkedItems).some(items =>
        items.some(item => 
          (cocktailId && item.cocktail_id === cocktailId) || 
          (placeId && item.place_id === placeId)
        )
      )
    : false;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            'h-9 w-9',
            isInAnyList && 'bg-accent text-accent-foreground'
          )}
          onClick={handleBookmarkClick}
          disabled={isLoading}
        >
          {isInAnyList ? (
            <BookmarkCheck className="h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </Button>
      </PopoverTrigger>
      {open && user && (
        <PopoverContent className="w-[200px] p-0" align="end">
          <Command>
            <CommandList>
              <CommandEmpty>{t.noResultsFound}</CommandEmpty>
              <CommandGroup>
                {bookmarks.map(list => {
                  const items = bookmarkedItems[list.id] || [];
                  const isSelected = items.some(item => 
                    (cocktailId && item.cocktail_id === cocktailId) || 
                    (placeId && item.place_id === placeId)
                  );
                  return (
                    <CommandItem
                      key={list.id}
                      onSelect={() => toggleList(list.id)}
                      disabled={isLoading}
                    >
                      <div
                        className={cn(
                          'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'opacity-50 [&_svg]:invisible'
                        )}
                      >
                        <CheckIcon className={cn('h-4 w-4')} />
                      </div>
                      <span>
                        {list.is_default
                          ? String(t[list.name_key as keyof typeof t])
                          : list.name}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      )}
    </Popover>
  );
}
