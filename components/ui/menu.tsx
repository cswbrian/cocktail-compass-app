"use client";

import Link from "next/link";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import Image from "next/image";
import { Menu as MenuIcon } from "lucide-react";

export function Menu() {
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];
  return (
    <div className="fixed top-4 right-4 z-50">
      <Sheet>
        <SheetTrigger asChild>
          <MenuIcon className="h-6 w-6" />
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:w-[540px]">
          <SheetHeader className="p-0">
            <SheetTitle className="font-normal text-left text-base">
              <SheetClose asChild>
                <Link href="/">{t.appName}</Link>
              </SheetClose>
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t.language}</span>
              <Tabs defaultValue={language} className="w-[200px]">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="en"
                    onClick={() => language !== "en" && toggleLanguage()}
                    aria-label="English"
                  >
                    English
                  </TabsTrigger>
                  <TabsTrigger
                    value="zh"
                    onClick={() => language !== "zh" && toggleLanguage()}
                    aria-label="Chinese"
                  >
                    中文
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 flex flex-col gap-2">
            <div className="flex gap-2">
              <a
                href="https://github.com/cswbrian/cocktail-compass-app"
                className="hover:text-gray-400 flex items-center gap-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image src="/github.svg" alt="GitHub" width={24} height={24} />
              </a>
              <a
                href="https://www.threads.net/@coolsunwind"
                className="hover:text-gray-400 flex items-center gap-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/threads.svg"
                  alt="Threads"
                  width={24}
                  height={24}
                />
              </a>
            </div>
            <a
              href="https://www.flaticon.com/free-icons/magic-lamp"
              title="magic lamp icons"
              className="hover:text-gray-400 text-xs text-gray-500"
            >
              Magic lamp icons created by Freepik - Flaticon
            </a>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
