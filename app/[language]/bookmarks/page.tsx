import { BookmarksContent } from "@/components/bookmark/bookmarks-content";

export default async function BookmarksPage() {
  return (
    <div className="px-6">
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