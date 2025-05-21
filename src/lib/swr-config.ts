import { cocktailLogService } from '@/services/cocktail-log-service';
import { userStatsService } from '@/services/user-stats-service';
import { CocktailLog } from '@/types/cocktail-log';
import { bookmarkService } from '@/services/bookmark-service';
import { cocktailService } from '@/services/cocktail-service';
import { Cocktail } from '@/types/cocktail';
import { BookmarkList } from '@/types/bookmark';
import { AuthService } from '@/services/auth-service';
import { mutate } from 'swr';

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
  recentPhotos: Array<{ url: string; type: 'image' | 'video' }>;
  mostLoggedCocktails: Array<{
    name: string;
    count: number;
  }>;
}

// Cache keys
export const CACHE_KEYS = {
  COCKTAIL_LOGS: (visibility?: 'public' | 'private' | 'friends') => 
    visibility ? ['cocktail-logs', visibility] : 'cocktail-logs',
  OWN_LOGS: (page?: number) => 
    page ? ['own-logs', page] : 'own-logs',
  PUBLIC_LOGS: (page?: number) => 
    page ? ['public-logs', page] : 'public-logs',
  USER_STATS: 'user-stats',
  PLACE_LOGS: (placeId: string) => ['place-logs', placeId],
  COCKTAIL_LOGS_BY_ID: (cocktailId: string) => ['cocktail-logs-by-id', cocktailId],
  BOOKMARKS: 'bookmarks',
  COCKTAILS: 'cocktails',
} as const;

// Helper functions for cache invalidation
export const invalidateCache = {
  allLogs: async () => {
    // Invalidate all pages of both public and own logs
    await Promise.all([
      mutate((key) => Array.isArray(key) && key[0] === 'public-logs'),
      mutate((key) => Array.isArray(key) && key[0] === 'own-logs'),
      mutate(CACHE_KEYS.USER_STATS)
    ]);
  },
  publicLogs: async () => {
    // Invalidate all pages of public logs
    await mutate((key) => Array.isArray(key) && key[0] === 'public-logs');
    // Also invalidate the specific cache key
    await mutate(CACHE_KEYS.PUBLIC_LOGS());
  },
  ownLogs: async () => {
    // Invalidate all pages of own logs
    await mutate((key) => Array.isArray(key) && key[0] === 'own-logs');
    // Also invalidate the specific cache key
    await mutate(CACHE_KEYS.OWN_LOGS());
  },
  userStats: async () => {
    await mutate(CACHE_KEYS.USER_STATS);
  }
};

// Fetcher functions
export const fetchers = {
  getOwnCocktailLogs: async (page: number = 1, pageSize: number = 10) => {
    console.log('SWR Config - Fetching own cocktail logs, page:', page, 'pageSize:', pageSize);
    try {
      const user = await AuthService.getCurrentSession();
      if (!user) {
        return { logs: [], hasMore: false };
      }
      const result = await cocktailLogService.getOwnLogs(user.id, page, pageSize);
      console.log('SWR Config - Own cocktail logs fetched:', result);
      return result;
    } catch (error) {
      console.error('SWR Config - Error fetching own cocktail logs:', error);
      throw error;
    }
  },
  
  getUserStats: () => userStatsService.getUserStats(),
  
  getPlaceLogs: async (placeId: string, page: number = 1, pageSize: number = 10) => {
    console.log('SWR Config - Fetching place logs for:', placeId, 'page:', page, 'pageSize:', pageSize);
    try {
      const result = await cocktailLogService.getLogsByPlaceId(placeId, page, pageSize);
      console.log('SWR Config - Place logs fetched:', result);
      return result;
    } catch (error) {
      console.error('SWR Config - Error fetching place logs:', error);
      throw error;
    }
  },
  
  getCocktailLogsById: async (cocktailId: string, page: number = 1, pageSize: number = 10) => {
    console.log('SWR Config - Fetching cocktail logs for ID:', cocktailId, 'page:', page, 'pageSize:', pageSize);
    try {
      const result = await cocktailLogService.getLogsByCocktailId(cocktailId, page, pageSize);
      console.log('SWR Config - Cocktail logs by ID fetched:', result);
      return result;
    } catch (error) {
      console.error('SWR Config - Error fetching cocktail logs by ID:', error);
      throw error;
    }
  },

  getPublicLogsByUserId: async (userId: string, page: number = 1, pageSize: number = 10) => {
    console.log('SWR Config - Fetching public logs for user:', userId, 'page:', page, 'pageSize:', pageSize);
    try {
      const result = await cocktailLogService.getPublicLogsByUserId(userId, page, pageSize);
      console.log('SWR Config - Public logs by user ID fetched:', result);
      return result;
    } catch (error) {
      console.error('SWR Config - Error fetching public logs by user ID:', error);
      throw error;
    }
  },

  getBookmarks: async () => {
    console.log('SWR Config - Fetching bookmarks');
    try {
      const bookmarks = await bookmarkService.getBookmarks();
      console.log('SWR Config - Bookmarks fetched:', bookmarks);
      return bookmarks;
    } catch (error) {
      console.error('SWR Config - Error fetching bookmarks:', error);
      throw error;
    }
  },

  getCocktails: async () => {
    console.log('SWR Config - Fetching all cocktails');
    try {
      const cocktails = await cocktailService.getAllCocktailsWithDetails();
      console.log('SWR Config - All cocktails fetched:', cocktails);
      return cocktails;
    } catch (error) {
      console.error('SWR Config - Error fetching all cocktails:', error);
      throw error;
    }
  },

  getPublicCocktailLogs: async (page: number = 1, pageSize: number = 10) => {
    console.log('SWR Config - Fetching public cocktail logs, page:', page, 'pageSize:', pageSize);
    try {
      const result = await cocktailLogService.getPublicLogs(page, pageSize);
      console.log('SWR Config - Public cocktail logs fetched:', result);
      return result;
    } catch (error) {
      console.error('SWR Config - Error fetching public cocktail logs:', error);
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
      uniquePlaces: 0
    },
    drinksByMonth: {},
    topPlaces: [],
    recentPhotos: [],
    mostLoggedCocktails: []
  } as UserStats,
  'bookmarks': [] as BookmarkList[],
  'cocktails': [] as Cocktail[],
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