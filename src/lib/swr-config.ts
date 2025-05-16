import { cocktailLogService } from '@/services/cocktail-log-service';
import { userStatsService } from '@/services/user-stats-service';
import { CocktailLog } from '@/types/cocktail-log';
import { bookmarkService } from '@/services/bookmark-service';
import { cocktailService } from '@/services/cocktail-service';
import { Cocktail } from '@/types/cocktail';
import { BookmarkList } from '@/types/bookmark';

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
  COCKTAIL_LOGS: 'cocktail-logs',
  USER_STATS: 'user-stats',
  PLACE_LOGS: (placeId: string) => ['place-logs', placeId],
  COCKTAIL_LOGS_BY_ID: (cocktailId: string) => ['cocktail-logs-by-id', cocktailId],
  BOOKMARKS: 'bookmarks',
  COCKTAILS: 'cocktails',
} as const;

// Fetcher functions
export const fetchers = {
  getCocktailLogs: async () => {
    console.log('SWR Config - Fetching cocktail logs');
    try {
      const logs = await cocktailLogService.getLogsByUserId();
      console.log('SWR Config - Cocktail logs fetched:', logs);
      return logs;
    } catch (error) {
      console.error('SWR Config - Error fetching cocktail logs:', error);
      throw error;
    }
  },
  
  getUserStats: async () => {
    console.log('SWR Config - Fetching user stats');
    try {
      const data = await userStatsService.getUserStats();
      console.log('SWR Config - User stats fetched:', data);
      return data;
    } catch (error) {
      console.error('SWR Config - Error fetching user stats:', error);
      throw error;
    }
  },
  
  getPlaceLogs: async (placeId: string) => {
    console.log('SWR Config - Fetching place logs for:', placeId);
    try {
      const logs = await cocktailLogService.getLogsByPlaceId(placeId);
      console.log('SWR Config - Place logs fetched:', logs);
      return logs;
    } catch (error) {
      console.error('SWR Config - Error fetching place logs:', error);
      throw error;
    }
  },
  
  getCocktailLogsById: async (cocktailId: string) => {
    console.log('SWR Config - Fetching cocktail logs for ID:', cocktailId);
    try {
      const logs = await cocktailLogService.getLogsByCocktailId(cocktailId);
      console.log('SWR Config - Cocktail logs by ID fetched:', logs);
      return logs;
    } catch (error) {
      console.error('SWR Config - Error fetching cocktail logs by ID:', error);
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
};

// Default fallback data
const defaultFallbackData = {
  [CACHE_KEYS.COCKTAIL_LOGS]: [] as CocktailLog[],
  [CACHE_KEYS.USER_STATS]: {
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
  [CACHE_KEYS.BOOKMARKS]: [] as BookmarkList[],
  [CACHE_KEYS.COCKTAILS]: [] as Cocktail[],
};

// SWR configuration
export const swrConfig = {
  revalidateOnFocus: false, // Disable revalidation on window focus
  revalidateIfStale: true, // Revalidate if data is stale
  revalidateOnReconnect: true, // Revalidate when reconnecting
  dedupingInterval: 2000, // Dedupe requests within 2 seconds
  errorRetryCount: 3, // Retry failed requests 3 times
  errorRetryInterval: 5000, // Wait 5 seconds between retries
  refreshInterval: 0, // Disable automatic refresh
  shouldRetryOnError: true, // Retry on error
  focusThrottleInterval: 5000, // Throttle focus events
  loadingTimeout: 3000, // Timeout for loading state
} as const;

// Export default fallback data separately
export const defaultData = defaultFallbackData; 