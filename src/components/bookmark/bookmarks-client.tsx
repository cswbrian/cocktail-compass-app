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
  // Fetch bookmarks using SWR with immediate data fetching
  const {
    data: bookmarks = defaultData[CACHE_KEYS.BOOKMARKS],
    isLoading: isLoadingBookmarks,
    error: bookmarksError,
    mutate: mutateBookmarks
  } = useSWR(
    CACHE_KEYS.BOOKMARKS,
    fetchers.getUserBookmarksWithItems,
    {
      ...swrConfig,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
      revalidateOnMount: true, // Ensure revalidation on mount
      refreshInterval: 0, // Disable automatic refresh
    },
  );

  // Initialize and refresh data on mount
  useEffect(() => {
    const initializeBookmarks = async () => {
      try {
        await mutateBookmarks(); // This will trigger a fresh fetch
      } catch (error) {
        console.error('Failed to initialize bookmarks:', error);
      }
    };
    initializeBookmarks();
  }, [mutateBookmarks]);

  // Handle error state
  if (bookmarksError) {
    console.error('Error loading bookmarks:', bookmarksError);
  }

  return (
    <AuthWrapper customLoading={<BookmarksSkeleton />}>
      <BookmarksList
        bookmarks={bookmarks}
        isLoading={isLoadingBookmarks}
      />
    </AuthWrapper>
  );
}
