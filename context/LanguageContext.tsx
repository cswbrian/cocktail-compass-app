"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

type Language = "en" | "zh";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>(() => {
    // Check localStorage for saved language preference, default to "zh"
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('language') as Language) || 'zh';
    }
    return 'zh';
  });

  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "zh" : "en";
    setLanguage(newLanguage);
    // Save the new language preference to localStorage
    localStorage.setItem('language', newLanguage);
    
    const currentPath = window.location.pathname;
    const newPath = currentPath.match(/\/(en|zh)/) 
      ? currentPath.replace(/\/(en|zh)/, `/${newLanguage}`)
      : `/${newLanguage}${currentPath}`;
    router.push(newPath);
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
} 