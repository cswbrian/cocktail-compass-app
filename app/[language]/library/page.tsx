import { LibraryContent } from "@/components/library/library-content";

export default function LibraryPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <LibraryContent />
    </div>
  );
}

export async function generateStaticParams() {
  return [
    { language: 'en' },
    { language: 'zh' }
  ];
} 