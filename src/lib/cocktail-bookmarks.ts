export const COCKTAIL_BOOKMARKS_KEY = 'bookmarks';

export const COCKTAIL_BOOKMARK_LISTS = [
  { id: 'want-to-try', nameKey: 'wantToTry' },
  { id: 'favorites', nameKey: 'favorites' },
  { id: 'dont-like', nameKey: 'dontLike' },
] as const;

export type CocktailBookmarkListId =
  (typeof COCKTAIL_BOOKMARK_LISTS)[number]['id'];

export type CocktailBookmarkListNameKey =
  (typeof COCKTAIL_BOOKMARK_LISTS)[number]['nameKey'];

export interface CocktailBookmarkList {
  key: CocktailBookmarkListId;
  items: string[];
}

function emptyLists(): CocktailBookmarkList[] {
  return COCKTAIL_BOOKMARK_LISTS.map(list => ({
    key: list.id,
    items: [],
  }));
}

function isValidLists(
  value: unknown,
): value is CocktailBookmarkList[] {
  if (!Array.isArray(value)) return false;
  return COCKTAIL_BOOKMARK_LISTS.every(list =>
    value.some(
      entry =>
        entry &&
        typeof entry === 'object' &&
        (entry as CocktailBookmarkList).key === list.id &&
        Array.isArray(
          (entry as CocktailBookmarkList).items,
        ),
    ),
  );
}

export function getCocktailBookmarks(): CocktailBookmarkList[] {
  try {
    const raw = localStorage.getItem(
      COCKTAIL_BOOKMARKS_KEY,
    );
    if (!raw) {
      const initial = emptyLists();
      localStorage.setItem(
        COCKTAIL_BOOKMARKS_KEY,
        JSON.stringify(initial),
      );
      return initial;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!isValidLists(parsed)) {
      const initial = emptyLists();
      localStorage.setItem(
        COCKTAIL_BOOKMARKS_KEY,
        JSON.stringify(initial),
      );
      return initial;
    }

    return COCKTAIL_BOOKMARK_LISTS.map(list => {
      const existing = parsed.find(
        entry => entry.key === list.id,
      );
      return {
        key: list.id,
        items:
          existing?.items.filter(
            (slug): slug is string =>
              typeof slug === 'string',
          ) ?? [],
      };
    });
  } catch {
    const initial = emptyLists();
    try {
      localStorage.setItem(
        COCKTAIL_BOOKMARKS_KEY,
        JSON.stringify(initial),
      );
    } catch {
      // ignore quota / private mode write failures
    }
    return initial;
  }
}

export function setCocktailBookmarks(
  bookmarks: CocktailBookmarkList[],
): void {
  localStorage.setItem(
    COCKTAIL_BOOKMARKS_KEY,
    JSON.stringify(bookmarks),
  );
}

export function toggleCocktailBookmark(
  listId: CocktailBookmarkListId,
  cocktailSlug: string,
): CocktailBookmarkList[] {
  const bookmarks = getCocktailBookmarks().map(list => {
    if (list.key !== listId) return list;
    const items = list.items.includes(cocktailSlug)
      ? list.items.filter(slug => slug !== cocktailSlug)
      : [...list.items, cocktailSlug];
    return { ...list, items };
  });
  setCocktailBookmarks(bookmarks);
  return bookmarks;
}

export function isCocktailInAnyList(
  bookmarks: CocktailBookmarkList[],
  cocktailSlug: string,
): boolean {
  return bookmarks.some(list =>
    list.items.includes(cocktailSlug),
  );
}
