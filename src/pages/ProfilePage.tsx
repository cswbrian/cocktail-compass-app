import React, { useState, useEffect } from 'react';
import { translations } from '@/translations';
import { Toaster } from '@/components/ui/sonner';
import { HighlightsContainer } from '@/components/journal/HighlightsContainer';
import { BookmarksClient } from '@/components/bookmark/bookmarks-client';
import { useLanguage } from '@/context/LanguageContext';
import { StarIcon, BarChart3Icon } from 'lucide-react';
import { UserProfile } from '@/components/profile/UserProfile';
import { useSearchParams } from 'react-router-dom';

const ProfileTabs: React.FC<{
  activeTab: 'highlights' | 'bookmarks';
  onTabChange: (tab: 'highlights' | 'bookmarks') => void;
}> = ({ activeTab, onTabChange }) => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="grid w-full grid-cols-2 mb-6">
      <button
        onClick={() => onTabChange('highlights')}
        className={`flex items-center justify-center gap-2 py-2 border-b-2 ${
          activeTab === 'highlights'
            ? 'border-primary text-primary'
            : 'border-transparent'
        }`}
      >
        <BarChart3Icon className="w-4 h-4" />
        {t.highlights}
      </button>
      <button
        onClick={() => onTabChange('bookmarks')}
        className={`flex items-center justify-center gap-2 py-2 border-b-2 ${
          activeTab === 'bookmarks'
            ? 'border-primary text-primary'
            : 'border-transparent'
        }`}
      >
        <StarIcon className="w-4 h-4" />
        {t.bookmarks}
      </button>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'highlights' | 'bookmarks'>(() => {
    const tabFromQuery = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') : null;
    if (tabFromQuery === 'highlights' || tabFromQuery === 'bookmarks') return tabFromQuery;
    const stored = typeof window !== 'undefined' ? localStorage.getItem('profile-active-tab') : null;
    if (stored === 'highlights' || stored === 'bookmarks') return stored;
    return 'highlights';
  });

  // Persist tab in URL and localStorage; push history so Back toggles tabs
  useEffect(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev as any);
      next.set('tab', activeTab);
      return next;
    }, { replace: false });
    try {
      localStorage.setItem('profile-active-tab', activeTab);
    } catch {}
  }, [activeTab, setSearchParams]);

  return (
    <div>
      <UserProfile />
      <div>
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        {activeTab === 'highlights' ? (
          <HighlightsContainer />
        ) : (
          <BookmarksClient />
        )}
      </div>
      <Toaster />
    </div>
  );
};

export default ProfilePage;
