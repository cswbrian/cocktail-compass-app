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

interface BookmarkButtonProps {
  cocktailId: string;
}

export function BookmarkButton({
  cocktailId,
}: BookmarkButtonProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[language];
  const [open, setOpen] = React.useState(false);
  const [bookmarks, setBookmarks] = React.useState<
    BookmarkList[]
  >([]);
  const [bookmarkedItems, setBookmarkedItems] =
    React.useState<{ [key: string]: BookmarkedItem[] }>({});
  const [isLoading, setIsLoading] = React.useState(false);

  const handleBookmarkClick = () => {
    if (!user) {
      localStorage.setItem(
        'returnUrl',
        location.pathname || '/',
      );
      navigate(`/${language}/login`);
      return;
    }
    setOpen(true);
  };

  // Load bookmarks from Supabase on component mount
  React.useEffect(() => {
    if (!user) return;
    loadBookmarks();
  }, [user]);

  const loadBookmarks = async () => {
    try {
      setIsLoading(true);
      const lists = await bookmarkService.getBookmarks();
      setBookmarks(lists);

      const itemsMap: { [key: string]: BookmarkedItem[] } =
        {};
      for (const list of lists) {
        const items =
          await bookmarkService.getBookmarkedItems(list.id);
        itemsMap[list.id] = items;
      }
      setBookmarkedItems(itemsMap);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      toast.error(t.errorLoadingBookmarks);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleList = async (listId: string) => {
    try {
      setIsLoading(true);
      const items = bookmarkedItems[listId] || [];
      const isInList = items.some(
        item => item.cocktail_id === cocktailId,
      );

      if (isInList) {
        await bookmarkService.removeBookmark(
          listId,
          cocktailId,
        );
      } else {
        await bookmarkService.addBookmark(
          listId,
          cocktailId,
        );
      }

      // Track the event
      const action = isInList ? 'remove' : 'add';
      sendGAEvent(
        'bookmark',
        `bookmark_${action}`,
        `${listId}:${cocktailId}`,
      );

      // Reload bookmarks to get the updated state
      await loadBookmarks();
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error(t.errorMigratingBookmarks);
    } finally {
      setIsLoading(false);
    }
  };

  const isInAnyList = user
    ? Object.values(bookmarkedItems).some(items =>
        items.some(item => item.cocktail_id === cocktailId),
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
            isInAnyList &&
              'bg-accent text-accent-foreground',
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
        <PopoverContent
          className="w-[200px] p-0"
          align="end"
        >
          <Command>
            <CommandList>
              <CommandEmpty>
                {t.noResultsFound}
              </CommandEmpty>
              <CommandGroup>
                {bookmarks.map(list => {
                  const items =
                    bookmarkedItems[list.id] || [];
                  const isSelected = items.some(
                    item => item.cocktail_id === cocktailId,
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
                            : 'opacity-50 [&_svg]:invisible',
                        )}
                      >
                        <CheckIcon
                          className={cn('h-4 w-4')}
                        />
                      </div>
                      <span>
                        {list.is_default
                          ? String(
                              t[
                                list.name_key as keyof typeof t
                              ],
                            )
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
