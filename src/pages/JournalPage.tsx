import { JournalNav } from "@/components/journal/journal-nav";
import { Outlet } from "react-router-dom";

export default function JournalPage() {
  return (
    <div className="container mx-auto pb-20">
      <JournalNav />
      <Outlet />
    </div>
  );
} 