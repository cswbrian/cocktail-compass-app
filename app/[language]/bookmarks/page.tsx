import { BookmarksClient } from "@/components/bookmark/bookmarks-client";

export default async function BookmarksPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <BookmarksClient />
    </div>
  );
}

export async function generateStaticParams() {
  return [
    { language: 'en' },
    { language: 'zh' }
  ];
}