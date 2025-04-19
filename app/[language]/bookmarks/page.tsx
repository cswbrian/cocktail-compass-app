import { BookmarksContent } from "@/components/bookmark/bookmarks-content";

export default async function BookmarksPage() {
  return (
    <div className="max-w-4xl mx-auto">
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