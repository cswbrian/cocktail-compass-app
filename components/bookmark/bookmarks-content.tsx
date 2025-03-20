'use client';

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { BookmarksList } from "./bookmarks-list";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function BookmarksContent() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) {
      // Store the current path in localStorage for redirect after login
      localStorage.setItem('returnUrl', pathname || '/');
      // Redirect to login page with the current language
      router.push(`/${language}/login`);
    }
  }, [user, language, router, pathname]);

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