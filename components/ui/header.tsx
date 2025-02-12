"use client";

import Link from 'next/link'
import { Toggle } from '@/components/ui/toggle'
import { useLanguage } from '@/context/LanguageContext'
import { translations } from '@/translations'

export function Header() {
  const { language, toggleLanguage } = useLanguage()
  const t = translations[language]

  return (
    <header className="bg-background flex justify-between items-center px-6 py-4 sticky top-0 z-50">
      <Link href="/">{t.appName}</Link>
      <Toggle
        pressed={language === "zh"}
        onPressedChange={toggleLanguage}
        aria-label="Toggle language"
      >
        {language === "en" ? "中" : "ENG"}
      </Toggle>
    </header>
  )
}
