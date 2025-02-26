"use client";

import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { translations } from '@/translations'
import { Menu } from '@/components/ui/menu'

export function Header() {
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <header className="bg-background flex justify-between items-center px-6 py-4 sticky top-0 z-50">
      <Link href="/">{t.appName}</Link>
      <Menu />
    </header>
  )
}
