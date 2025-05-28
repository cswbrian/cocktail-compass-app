'use client';

import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import {
  ListIcon,
  BarChart3Icon,
  CompassIcon,
  UserIcon,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function FeedsNav() {
  const { language } = useLanguage();
  const t = translations[language];
  const location = useLocation();
  const pathname = location.pathname;

  const handleFeedChange = (feedType: 'recommend' | 'me') => {
    localStorage.setItem('preferred-feed', feedType);
  };

  return (
    <div className="grid w-full grid-cols-2 mb-6">
      <Link
        to={`/${language}/feeds/recommend`}
        className={`flex items-center justify-center gap-2 py-2 border-b-2 ${
          pathname.includes('/feeds/recommend')
            ? 'border-primary text-primary'
            : 'border-transparent'
        }`}
        onClick={() => handleFeedChange('recommend')}
      >
        <CompassIcon className="w-4 h-4" />
        {t.recommendFeed}
      </Link>
      <Link
        to={`/${language}/feeds/me`}
        className={`flex items-center justify-center gap-2 py-2 border-b-2 ${
          pathname.includes('/feeds/me')
            ? 'border-primary text-primary'
            : 'border-transparent'
        }`}
        onClick={() => handleFeedChange('me')}
      >
        <UserIcon className="w-4 h-4" />
        {t.myLogs}
      </Link>
    </div>
  );
}
