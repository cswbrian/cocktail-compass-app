"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookmarksList } from "@/components/bookmark/bookmarks-list";
import { LibraryNoteList } from "@/components/library/library-note-list";
import { useAuth } from "@/context/AuthContext";
import { translations } from "@/translations";
import { useLanguage } from "@/context/LanguageContext";

export function LibraryContent() {
  const [activeTab, setActiveTab] = useState("bookmarks");
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">{t.signInToViewLibrary}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t.library}</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bookmarks">{t.bookmarks}</TabsTrigger>
          <TabsTrigger value="notes">{t.notes}</TabsTrigger>
        </TabsList>
        <TabsContent value="bookmarks">
          <BookmarksList />
        </TabsContent>
        <TabsContent value="notes">
          <LibraryNoteList />
        </TabsContent>
      </Tabs>
    </div>
  );
} 