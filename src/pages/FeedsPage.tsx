import { FeedsNav } from "@/components/feeds/FeedsNav";
import { Outlet } from "react-router-dom";

export default function JournalPage() {
  return (
    <div className="container mx-auto pb-20">
      <FeedsNav />
      <Outlet />
    </div>
  );
} 