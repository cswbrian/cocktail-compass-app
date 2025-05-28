import { useLanguage } from '@/context/LanguageContext';
import { useLocation, Link } from 'react-router-dom';
import { translations } from '@/translations';
import { CompassIcon, UserIcon } from 'lucide-react';

export function PlaceDetailNav() {
  const { language } = useLanguage();
  const location = useLocation();
  const t = translations[language];
  const pathname = location.pathname;

  const isRecommendFeed = pathname.includes('/feeds/recommend');
  const isMyFeed = pathname.includes('/feeds/me');

  const handleFeedChange = (feedType: 'recommend' | 'me') => {
    localStorage.setItem('preferred-feed', feedType);
  };

  return (
    <div className="grid w-full grid-cols-2 mb-6">
      <Link
        to={`/${language}/places/${location.pathname.split('/')[3]}/feeds/recommend`}
        className={`flex items-center justify-center gap-2 py-2 border-b-2 ${
          isRecommendFeed
            ? 'border-primary text-primary'
            : 'border-transparent'
        }`}
        onClick={() => handleFeedChange('recommend')}
      >
        <CompassIcon className="w-4 h-4" />
        {t.recommendFeed}
      </Link>
      <Link
        to={`/${language}/places/${location.pathname.split('/')[3]}/feeds/me`}
        className={`flex items-center justify-center gap-2 py-2 border-b-2 ${
          isMyFeed
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