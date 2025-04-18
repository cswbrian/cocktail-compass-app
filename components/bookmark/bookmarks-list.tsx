"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { CocktailCard } from "@/components/cocktail-card";
import { slugify } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { cocktailService } from "@/services/cocktail-service";
import { Loading } from "@/components/ui/loading";
import { bookmarkService, BookmarkList } from "@/services/bookmark-service";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowUpDown, LayoutGrid, List } from "lucide-react";

const BOOKMARK_LISTS = [
  { id: "want-to-try", nameKey: "wantToTry" },
  { id: "favorites", nameKey: "favorites" },
  { id: "dont-like", nameKey: "dontLike" },
];

export function BookmarksList() {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const t = translations[language];
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("bookmarks-active-tab") || "want-to-try";
    }
    return "want-to-try";
  });
  const [bookmarks, setBookmarks] = useState<BookmarkList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [sortBy, setSortBy] = useState<"recentlyAdded" | "alphabetical">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("bookmarks-sort-by") as "recentlyAdded" | "alphabetical") || "recentlyAdded";
    }
    return "recentlyAdded";
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"default" | "compact">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("bookmarks-view-mode") as "default" | "compact") || "compact";
    }
    return "compact";
  });

  useEffect(() => {
    // Check for migration success parameter in URL
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("migrated") === "true") {
        toast.success(
          t.bookmarksMigratedToCloud ||
            "Your bookmarks are now stored in the cloud and accessible everywhere!",
          {
            duration: 6000,
          }
        );
        // Remove the parameter from URL without page reload
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, []); // Run once when component mounts

  const migrateLocalStorageToCloud = async () => {
    try {
      setIsMigrating(true);

      // Check for local bookmarks with the single 'bookmarks' key
      const localBookmarksStr = localStorage.getItem("bookmarks");
      if (!localBookmarksStr) {
        return false; // No local bookmarks to migrate
      }

      // Parse the local bookmarks
      const localBookmarks = JSON.parse(localBookmarksStr).map(
        (list: { key: string; items: string[] }) => ({
          key: list.key,
          items: list.items.map((cocktailId: string) => ({
            cocktailId,
            addedAt: new Date(),
          })),
        })
      );

      if (localBookmarks.length === 0) {
        return false; // No local bookmarks to migrate
      }

      // Check if there are any cloud bookmarks
      const cloudBookmarks = await bookmarkService.getBookmarks();
      if (cloudBookmarks.length > 0) {
        return false; // Already has cloud bookmarks, skip migration
      }

      // Migrate local bookmarks to cloud
      await bookmarkService.migrateFromLocalStorage(localBookmarks);

      // Clear local storage bookmarks
      localStorage.removeItem("bookmarks");

      // Instead of showing toast here, redirect with parameter
      const currentPath = window.location.pathname;
      window.location.href = `${currentPath}?migrated=true`;
      return true;
    } catch (error) {
      console.error("Error migrating bookmarks:", error);
      toast.error(
        t.errorMigratingBookmarks || "Error migrating bookmarks to cloud"
      );
      return false;
    } finally {
      setIsMigrating(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      localStorage.setItem("returnUrl", pathname || "/");
      router.push(`/${language}/login`);
      return;
    }

    if (user) {
      const initializeBookmarks = async () => {
        setIsLoading(true);
        try {
          // Attempt migration first
          const migrated = await migrateLocalStorageToCloud();
          console.log("migrated", migrated);
          // Load cloud bookmarks (whether migration happened or not)
          const firestoreBookmarks = await bookmarkService.getBookmarks();
          setBookmarks(firestoreBookmarks);
        } catch (error) {
          console.error("Error initializing bookmarks:", error);
          toast.error(t.errorLoadingBookmarks);
        } finally {
          setIsLoading(false);
        }
      };

      initializeBookmarks();
    }
  }, [user, loading, language, router, pathname]);

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

  const getBookmarkedCocktails = (listId: string) => {
    const bookmarkList = bookmarks.find((b) => b.id === listId);
    if (!bookmarkList) return [];

    const allCocktails = cocktailService.getAllCocktails();
    const cocktails = allCocktails.filter((cocktail) =>
      bookmarkList.items.some(
        (item) => item.cocktailId === slugify(cocktail.name.en)
      )
    );

    // Sort cocktails based on selected sort option
    if (sortBy === "alphabetical") {
      return cocktails.sort((a, b) => a.name.en.localeCompare(b.name.en));
    } else {
      // Sort by recently added (default)
      return cocktails.sort((a, b) => {
        const aItem = bookmarkList.items.find(
          (item) => item.cocktailId === slugify(a.name.en)
        );
        const bItem = bookmarkList.items.find(
          (item) => item.cocktailId === slugify(b.name.en)
        );
        // Convert Firestore Timestamp to milliseconds for comparison
        const aTime = aItem?.addedAt?.toDate?.()?.getTime() || 0;
        const bTime = bItem?.addedAt?.toDate?.()?.getTime() || 0;
        return bTime - aTime;
      });
    }
  };

  return (
    <div>
      <Tabs
        defaultValue="want-to-try"
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          localStorage.setItem("bookmarks-active-tab", value);
        }}
      >
        <div className="sticky top-0 z-10 bg-background px-6">
          <TabsList className="mb-4">
            {BOOKMARK_LISTS.map((list) => {
              const bookmarkList = bookmarks.find((b) => b.id === list.id);
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
        </div>

        <div className="mb-6 flex justify-between items-center px-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsDrawerOpen(true)}>
            <ArrowUpDown className="h-4 w-4 text-white" />
            <span className="text-sm text-white">
              {sortBy === "recentlyAdded" ? t.recentlyAdded : t.alphabetical}
            </span>
          </div>

          <div 
            className="flex items-center cursor-pointer"
            onClick={() => {
              const newViewMode = viewMode === "default" ? "compact" : "default";
              setViewMode(newViewMode);
              localStorage.setItem("bookmarks-view-mode", newViewMode);
            }}
          >
            {viewMode === "default" ? (
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
                  const newSortBy = value as "recentlyAdded" | "alphabetical";
                  setSortBy(newSortBy);
                  localStorage.setItem("bookmarks-sort-by", newSortBy);
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

        {BOOKMARK_LISTS.map((list) => {
          const bookmarkList = bookmarks.find((b) => b.id === list.id);
          return (
            <TabsContent key={list.id} value={list.id} className="px-6">
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
                      variant={viewMode}
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
