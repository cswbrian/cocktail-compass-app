import { BookmarksContent } from "@/components/bookmark/bookmarks-content";

export default async function BookmarksPage() {
  return (
    <div className="container mx-auto p-6">
      <BookmarksContent />
    </div>
  );
}

export async function generateStaticParams() {
  return [
    { language: 'en' },
    { language: 'zh' }
  ];
}