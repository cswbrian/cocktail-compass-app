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

interface BookmarkButtonProps {
  cocktailSlug: string;
  cocktailName: string;
}

interface BookmarkItem {
  key: string;
  items: string[];
}

const BOOKMARK_LISTS = [
  { id: "want-to-try", nameKey: "wantToTry" },
  { id: "favorites", nameKey: "favorites" },
  { id: "dont-like", nameKey: "dontLike" },
];

export function BookmarkButton({ cocktailSlug, cocktailName }: BookmarkButtonProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const [open, setOpen] = React.useState(false);
  const [bookmarks, setBookmarks] = React.useState<BookmarkItem[]>([]);

  // Load bookmarks from localStorage on component mount
  React.useEffect(() => {
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
  }, []);

  const toggleList = (listId: string) => {
    const newBookmarks = bookmarks.map(bookmark => {
      if (bookmark.key === listId) {
        const items = bookmark.items.includes(cocktailSlug)
          ? bookmark.items.filter(slug => slug !== cocktailSlug)
          : [...bookmark.items, cocktailSlug];
        
        // Track the event
        const action = items.includes(cocktailSlug) ? 'add' : 'remove';
        sendGAEvent(`bookmark_${action}`, {
          list_type: listId,
          cocktail_name: cocktailName,
          cocktail_slug: cocktailSlug
        });
        
        return { ...bookmark, items };
      }
      return bookmark;
    });
    
    setBookmarks(newBookmarks);
    localStorage.setItem("bookmarks", JSON.stringify(newBookmarks));
  };

  const isInAnyList = bookmarks.some(bookmark => 
    bookmark.items.includes(cocktailSlug)
  );

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
              {BOOKMARK_LISTS.map((list) => {
                const bookmarkList = bookmarks.find(b => b.key === list.id);
                const isSelected = bookmarkList?.items.includes(cocktailSlug) ?? false;
                return (
                  <CommandItem
                    key={list.id}
                    onSelect={() => toggleList(list.id)}
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
                    <span>{t[list.nameKey as keyof typeof t]}</span>
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