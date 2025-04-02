'use client';

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { BookmarksList } from "./bookmarks-list";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loading } from "@/components/ui/loading";

export function BookmarksContent() {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      // Store the current path in localStorage for redirect after login
      localStorage.setItem('returnUrl', pathname || '/');
      // Redirect to login page with the current language
      router.push(`/${language}/login`);
      return;
    }
  }, [user, loading, language, router, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loading />
      </div>
    );
  }

  if (!user) {
    return null; // Return null since we're redirecting
  }

  return (
    <>
      <h1 className="text-4xl mb-6">{translations[language].bookmarks}</h1>
      <BookmarksList />
    </>
  );
} 