import { cocktailLogService } from '@/services/cocktail-log-service';
import { userStatsService } from '@/services/user-stats-service';
import { CocktailLog } from '@/types/cocktail-log';
import { bookmarkService } from '@/services/bookmark-service';
import { cocktailService } from '@/services/cocktail-service';
import { Cocktail } from '@/types/cocktail';
import { BookmarkList } from '@/types/bookmark';
import { AuthService } from '@/services/auth-service';
import { mutate } from 'swr';
import { visitService } from '@/services/visit-service';

interface UserStats {
  basicStats: {
    totalCocktailsDrunk: number;
    uniqueCocktails: number;
    uniquePlaces: number;
  };
  drinksByMonth: Record<string, number>;
  topPlaces: Array<{
    name: string;
    count: number;
    place_id: string;
  }>;
  recentPhotos: Array<{
    url: string;
    type: 'image' | 'video';
  }>;
  mostLoggedCocktails: Array<{
    name: string;
    count: number;
  }>;
}

// Cache keys
export const CACHE_KEYS = {
  COCKTAIL_LOGS: (
    visibility?: 'public' | 'private',
  ) =>
    visibility
      ? ['cocktail-logs', visibility]
      : 'cocktail-logs',
  OWN_LOGS: (page?: number) =>
    page ? ['own-logs', page] : 'own-logs',
  PUBLIC_LOGS: (page?: number) =>
    page ? ['public-logs', page] : 'public-logs',
  USER_STATS: 'user-stats',
  PLACE_LOGS: (placeId: string) => ['place-logs', placeId],
  PLACE_VISITS: (placeId: string) => ['place-visits', placeId],
  COCKTAIL_LOGS_BY_ID: (cocktailId: string) => [
    'cocktail-logs-by-id',
    cocktailId,
  ],
  BOOKMARKS: 'bookmarks',
  COCKTAILS: 'cocktails',
  COCKTAIL_DETAILS: 'cocktail-details',
  COCKTAIL_LIST: 'cocktail-list',
  VISITS: (visibility?: 'public' | 'private') =>
    visibility ? ['visits', visibility] : 'visits',
  OWN_VISITS: (page?: number) =>
    page ? ['own-visits', page] : 'own-visits',
  PUBLIC_VISITS: (page?: number) => ['public-visits', page],
  USER_VISITS: (userId: string, page?: number) => ['user-visits', userId, page],
} as const;

// Helper functions for cache invalidation
export const invalidateCache = {
  allLogs: async () => {
    // Invalidate all pages of both public and own logs
    await Promise.all([
      mutate(
        key =>
          Array.isArray(key) && key[0] === 'public-logs',
      ),
      mutate(
        key => Array.isArray(key) && key[0] === 'own-logs',
      ),
      mutate(CACHE_KEYS.USER_STATS),
    ]);
  },
  publicLogs: async () => {
    // Invalidate all pages of public logs
    await mutate(
      key => Array.isArray(key) && key[0] === 'public-logs',
    );
    // Also invalidate the specific cache key
    await mutate(CACHE_KEYS.PUBLIC_LOGS());
  },
  ownLogs: async () => {
    // Invalidate all pages of own logs
    await mutate(
      key => Array.isArray(key) && key[0] === 'own-logs',
    );
    // Also invalidate the specific cache key
    await mutate(CACHE_KEYS.OWN_LOGS());
  },
  userStats: async () => {
    await mutate(CACHE_KEYS.USER_STATS);
  },
  allVisits: () => mutate(CACHE_KEYS.PUBLIC_VISITS()),
  userVisits: (userId: string) => mutate(CACHE_KEYS.USER_VISITS(userId)),
};

// Fetcher functions
export const fetchers = {
  getOwnCocktailLogs: async (
    page: number = 1,
    pageSize: number = 10,
  ) => {
    try {
      const user = await AuthService.getCurrentSession();
      if (!user) {
        return { logs: [], hasMore: false };
      }
      const result = await cocktailLogService.getOwnLogs(
        user.id,
        page,
        pageSize,
      );
      return result;
    } catch (error) {
      throw error;
    }
  },

  getCocktailList: () => cocktailService.getCocktailList(),

  getUserStats: () => userStatsService.getUserStats(),

  getPlaceLogs: async (
    placeId: string,
    page: number = 1,
    pageSize: number = 10,
  ) => {
    try {
      const result =
        await cocktailLogService.getLogsByPlaceId(
          placeId,
          page,
          pageSize,
        );
      return result;
    } catch (error) {
      throw error;
    }
  },

  getCocktailLogsById: async (
    cocktailId: string,
    page: number = 1,
    pageSize: number = 10,
  ) => {
    try {
      const result =
        await cocktailLogService.getLogsByCocktailId(
          cocktailId,
          page,
          pageSize,
        );
      return result;
    } catch (error) {
      throw error;
    }
  },

  getPublicLogsByUserId: async (
    userId: string,
    page: number = 1,
    pageSize: number = 10,
  ) => {
    try {
      const result =
        await cocktailLogService.getPublicLogsByUserId(
          userId,
          page,
          pageSize,
        );
      return result;
    } catch (error) {
      throw error;
    }
  },

  getBookmarks: async () => {
    try {
      const bookmarks =
        await bookmarkService.getBookmarks();
      return bookmarks;
    } catch (error) {
      throw error;
    }
  },

  getCocktails: async () => {
    try {
      const cocktails =
        await cocktailService.getAllCocktailsWithDetails();
      return cocktails;
    } catch (error) {
      throw error;
    }
  },

  getPublicCocktailLogs: async (
    page: number = 1,
    pageSize: number = 10,
  ) => {
    try {
      const result = await cocktailLogService.getPublicLogs(
        page,
        pageSize,
      );
      return result;
    } catch (error) {
      throw error;
    }
  },

  getPublicVisits: (page = 1, pageSize = 10) =>
    visitService.getPublicVisits(page, pageSize),

  getUserVisits: (userId: string, page = 1, pageSize = 10) =>
    visitService.getVisitsByUserId(userId, page, pageSize),

  getPublicVisitsByUserId: (userId: string, page = 1, pageSize = 10) =>
    visitService.getPublicVisitsByUserId(userId, page, pageSize),

  getPlaceVisits: async (
    placeId: string,
    page: number = 1,
    pageSize: number = 10,
    isRecommendFeed: boolean = true,
  ) => {
    try {
      if (isRecommendFeed) {
        return visitService.getPublicVisitsByPlaceId(placeId, page, pageSize);
      } else {
        const user = await AuthService.getCurrentSession();
        if (!user) {
          return { visits: [], hasMore: false };
        }
        return visitService.getVisitsByPlaceIdAndUserId(placeId, user.id, page, pageSize);
      }
    } catch (error) {
      throw error;
    }
  },
};

// Default fallback data
const defaultFallbackData = {
  'cocktail-logs': [] as CocktailLog[],
  'user-stats': {
    basicStats: {
      totalCocktailsDrunk: 0,
      uniqueCocktails: 0,
      uniquePlaces: 0,
    },
    drinksByMonth: {},
    topPlaces: [],
    recentPhotos: [],
    mostLoggedCocktails: [],
  } as UserStats,
  bookmarks: [] as BookmarkList[],
  cocktails: [] as Cocktail[],
};

// SWR configuration
export const swrConfig = {
  revalidateOnFocus: false,
  revalidateIfStale: true,
  revalidateOnReconnect: true,
  dedupingInterval: 5000,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  refreshInterval: 0,
  shouldRetryOnError: true,
  focusThrottleInterval: 5000,
  loadingTimeout: 3000,
} as const;

// Export default fallback data separately
export const defaultData = defaultFallbackData;
