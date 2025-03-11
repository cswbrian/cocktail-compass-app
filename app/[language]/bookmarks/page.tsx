import { translations } from "@/translations";
import { BookmarksList } from "@/components/bookmark/bookmarks-list";

type Props = {
  params: Promise<{ language: string; }>
}

export default async function BookmarksPage({
  params,
}: Props) {
  const { language } = await params;
  const t = translations[language as keyof typeof translations];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl mb-6">{t.bookmarks}</h1>
      <BookmarksList />
    </div>
  );
}

export async function generateStaticParams() {
  return [
    { language: 'en' },
    { language: 'zh' }
  ];
}