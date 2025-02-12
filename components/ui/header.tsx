"use client";

import Link from 'next/link'
import { Toggle } from '@/components/ui/toggle'
import { useLanguage } from '@/context/LanguageContext'
import { translations } from '@/translations'

export function Header() {
  const { language, toggleLanguage } = useLanguage()
  const t = translations[language]

  return (
    <header className="flex justify-between items-center p-6">
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
