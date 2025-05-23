'use client';

import { BookmarksList } from './bookmarks-list';
import { AuthWrapper } from '@/components/auth/auth-wrapper';
import { Skeleton } from '@/components/ui/skeleton';
import useSWR from 'swr';
import { useEffect } from 'react';
import {
  CACHE_KEYS,
  fetchers,
  swrConfig,
  defaultData,
} from '@/lib/swr-config';

function BookmarksSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="px-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Bookmarks Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="rounded-lg border p-4 space-y-3"
          >
            {/* Image Skeleton */}
            <Skeleton className="h-48 w-full rounded-md" />

            {/* Title and Description */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            {/* Tags and Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BookmarksClient() {
  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      await Promise.all([
        fetchers.getBookmarks(),
        fetchers.getCocktails(),
      ]);
    };
    initializeServices();
  }, []);

  // Fetch bookmarks using SWR
  const {
    data: bookmarks = defaultData[CACHE_KEYS.BOOKMARKS],
    isLoading: isLoadingBookmarks,
  } = useSWR(
    CACHE_KEYS.BOOKMARKS,
    fetchers.getBookmarks,
    swrConfig,
  );

  // Fetch cocktails using SWR
  const {
    data: cocktails = defaultData[CACHE_KEYS.COCKTAILS],
    isLoading: isLoadingCocktails,
  } = useSWR(
    CACHE_KEYS.COCKTAILS,
    fetchers.getCocktails,
    swrConfig,
  );

  const isLoading =
    isLoadingBookmarks || isLoadingCocktails;

  return (
    <AuthWrapper customLoading={<BookmarksSkeleton />}>
      <BookmarksList
        bookmarks={bookmarks}
        cocktails={cocktails}
        isLoading={isLoading}
      />
    </AuthWrapper>
  );
}
