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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import Image from "next/image";
import { Menu as MenuIcon } from "lucide-react";
import { BUY_ME_A_DRINK_URL, FEEDBACK_FORM_URL } from "@/constants";

export function Menu() {
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];
  return (
    <div className="fixed top-4 right-4 z-50">
      <Sheet>
        <SheetTrigger asChild>
          <MenuIcon className="h-6 w-6" />
        </SheetTrigger>
        <SheetContent side="right" className="h-full w-full sm:w-[540px]">
          <div className="flex flex-col justify-between h-full">
            <div>
              <SheetHeader className="p-0">
                <SheetTitle className="font-normal text-left text-base">
                  <SheetClose asChild>
                    <Link href="/">{t.appName}</Link>
                  </SheetClose>
                </SheetTitle>
              </SheetHeader>
              <ul className="mt-4">
                <li className="flex items-center justify-between py-2">
                  <span className="font-medium">{t.language}</span>
                  <SheetClose asChild>
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
                  </SheetClose>
                </li>
                <li className="py-2">
                  <Separator />
                </li>
                <li className="py-2">
                  <SheetClose asChild>
                    <Link
                      href={`/${language}/bookmarks`}
                      className="font-medium"
                    >
                      {t.bookmarks} 🔖
                    </Link>
                  </SheetClose>
                </li>
              </ul>
            </div>
            <div className="mt-4">
              <SheetClose asChild>
                <a
                  href={FEEDBACK_FORM_URL}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 w-full mb-4"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.giveMeFeedback} 📝
                </a>
              </SheetClose>
              <SheetClose asChild>
                <a
                  href={BUY_ME_A_DRINK_URL}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 w-full"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.buyMeADrink} 🍸
                </a>
              </SheetClose>
              <div className="mt-4 flex gap-2">
                <SheetClose asChild>
                  <a
                    href="https://github.com/cswbrian/cocktail-compass-app"
                    className="hover:text-gray-400 flex items-center gap-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src="/github.svg"
                      alt="GitHub"
                      width={24}
                      height={24}
                    />
                  </a>
                </SheetClose>
                <SheetClose asChild>
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
                </SheetClose>
              </div>
              <SheetClose asChild>
                <a
                  href="https://www.flaticon.com/free-icons/magic-lamp"
                  title="magic lamp icons"
                  className="hover:text-gray-400 text-xs text-gray-500"
                >
                  Magic lamp icons created by Freepik - Flaticon
                </a>
              </SheetClose>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
