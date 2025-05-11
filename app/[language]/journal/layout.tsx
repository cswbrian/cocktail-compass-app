import { JournalNav } from "@/components/journal/journal-nav";

export default function JournalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto pb-20">
      <JournalNav />
      {children}
    </div>
  );
}
