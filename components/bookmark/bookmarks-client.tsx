'use client';

import { BookmarksList } from "./bookmarks-list";
import { AuthWrapper } from "@/components/auth/auth-wrapper";

export function BookmarksClient() {
  return (
    <AuthWrapper>
      <BookmarksList />
    </AuthWrapper>
  );
} 