import * as React from 'react';
import {
  Bookmark,
  BookmarkCheck,
  CheckIcon,
} from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { sendGAEvent } from '@/lib/ga';
import {
  COCKTAIL_BOOKMARK_LISTS,
  CocktailBookmarkList,
  getCocktailBookmarks,
  isCocktailInAnyList,
  toggleCocktailBookmark,
} from '@/lib/cocktail-bookmarks';

interface CocktailBookmarkButtonProps {
  cocktailSlug: string;
  cocktailName: string;
}

export function CocktailBookmarkButton({
  cocktailSlug,
  cocktailName,
}: CocktailBookmarkButtonProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const [open, setOpen] = React.useState(false);
  const [bookmarks, setBookmarks] = React.useState<
    CocktailBookmarkList[]
  >([]);

  React.useEffect(() => {
    setBookmarks(getCocktailBookmarks());
  }, []);

  const toggleList = (
    listId: (typeof COCKTAIL_BOOKMARK_LISTS)[number]['id'],
  ) => {
    const next = toggleCocktailBookmark(
      listId,
      cocktailSlug,
    );
    const added = next
      .find(list => list.key === listId)
      ?.items.includes(cocktailSlug);
    sendGAEvent(
      'bookmark',
      `bookmark_${added ? 'add' : 'remove'}`,
      `${listId}:cocktail:${cocktailSlug}:${cocktailName}`,
    );
    setBookmarks(next);
  };

  const isInAnyList = isCocktailInAnyList(
    bookmarks,
    cocktailSlug,
  );

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
        >
          {isInAnyList ? (
            <BookmarkCheck className="h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="end">
        <Command>
          <CommandList>
            <CommandEmpty>{t.noResultsFound}</CommandEmpty>
            <CommandGroup>
              {COCKTAIL_BOOKMARK_LISTS.map(list => {
                const bookmarkList = bookmarks.find(
                  b => b.key === list.id,
                );
                const isSelected =
                  bookmarkList?.items.includes(
                    cocktailSlug,
                  ) ?? false;
                return (
                  <CommandItem
                    key={list.id}
                    onSelect={() => toggleList(list.id)}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible',
                      )}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </div>
                    <span>
                      {String(
                        t[list.nameKey as keyof typeof t],
                      )}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
