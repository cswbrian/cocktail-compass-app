"use client";

import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { ListIcon, BarChart3Icon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function JournalNav() {
  const { language } = useLanguage();
  const t = translations[language];
  const pathname = usePathname() ?? "";

  return (
    <div className="grid w-full grid-cols-2 mb-6">
      <Link
        href={`/${language}/journal/feeds`}
        className={`flex items-center justify-center gap-2 p-4 border-b-2 ${
          pathname.includes("/feeds")
            ? "border-primary text-primary"
            : "border-transparent"
        }`}
      >
        <ListIcon className="w-4 h-4" />
        {t.yourLogs}
      </Link>
      <Link
        href={`/${language}/journal/highlights`}
        className={`flex items-center justify-center gap-2 p-4 border-b-2 ${
          pathname.includes("/highlights")
            ? "border-primary text-primary"
            : "border-transparent"
        }`}
      >
        <BarChart3Icon className="w-4 h-4" />
        {t.highlights}
      </Link>
    </div>
  );
} 