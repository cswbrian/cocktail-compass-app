"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

type Language = "en" | "zh";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { lang } = useParams();
  const [language, setLanguage] = useState<Language>(() => {
    // Check localStorage for saved language preference, default to "zh"
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('language') as Language) || 'zh';
    }
    return 'zh';
  });

  // Sync language with URL parameter
  useEffect(() => {
    if (lang && (lang === 'en' || lang === 'zh') && lang !== language) {
      setLanguage(lang);
      localStorage.setItem('language', lang);
    }
  }, [lang, language]);

  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "zh" : "en";
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    
    // Update URL with new language
    const currentPath = window.location.pathname;
    const pathWithoutLang = currentPath.replace(/^\/(en|zh)/, '');
    navigate(`/${newLanguage}${pathWithoutLang}`);
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