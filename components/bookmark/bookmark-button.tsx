"use client";

import * as React from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { sendGAEvent } from "@next/third-parties/google";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { bookmarkService, BookmarkList } from "@/services/bookmark-service";
import { toast } from "sonner";

interface BookmarkButtonProps {
  cocktailSlug: string;
  cocktailName: string;
}

const BOOKMARK_LISTS = [
  { id: "want-to-try", nameKey: "wantToTry" },
  { id: "favorites", nameKey: "favorites" },
  { id: "dont-like", nameKey: "dontLike" },
];

export function BookmarkButton({ cocktailSlug, cocktailName }: BookmarkButtonProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const t = translations[language];
  const [open, setOpen] = React.useState(false);
  const [bookmarks, setBookmarks] = React.useState<BookmarkList[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleBookmarkClick = () => {
    if (!user) {
      localStorage.setItem('returnUrl', pathname || '/');
      router.push(`/${language}/login`);
      return;
    }
    setOpen(true);
  };

  // Load bookmarks from Firestore on component mount
  React.useEffect(() => {
    if (!user) return;
    loadBookmarks();
  }, [user]);

  const loadBookmarks = async () => {
    try {
      setIsLoading(true);
      const firestoreBookmarks = await bookmarkService.getBookmarks();
      setBookmarks(firestoreBookmarks);
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
      const bookmarkList = bookmarks.find(b => b.id === listId);
      const isInList = bookmarkList?.items.some(item => item.cocktailId === cocktailSlug) ?? false;

      if (isInList) {
        await bookmarkService.removeBookmark(listId, cocktailSlug);
      } else {
        await bookmarkService.addBookmark(listId, cocktailSlug);
      }

      // Track the event
      const action = isInList ? 'remove' : 'add';
      sendGAEvent('bookmark', {
        action: `bookmark_${action}`,
        list_type: listId,
        cocktail_name: cocktailName,
        cocktail_slug: cocktailSlug
      });

      // Reload bookmarks to get the updated state
      await loadBookmarks();
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error(t.errorMigratingBookmarks);
    } finally {
      setIsLoading(false);
    }
  };

  const isInAnyList = user ? bookmarks.some(bookmark => 
    bookmark.items.some(item => item.cocktailId === cocktailSlug)
  ) : false;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-9 w-9",
            isInAnyList && "bg-accent text-accent-foreground"
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
                {BOOKMARK_LISTS.map((list) => {
                  const bookmarkList = bookmarks.find(b => b.id === list.id);
                  const isSelected = bookmarkList?.items.some(item => item.cocktailId === cocktailSlug) ?? false;
                  return (
                    <CommandItem
                      key={list.id}
                      onSelect={() => toggleList(list.id)}
                      disabled={isLoading}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <CheckIcon className={cn("h-4 w-4")} />
                      </div>
                      <span>{String(t[list.nameKey as keyof typeof t])}</span>
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