import React, { useState } from 'react';
import { translations } from '@/translations';
import { Toaster } from '@/components/ui/sonner';
import { HighlightsContainer } from '@/components/journal/HighlightsContainer';
import { BookmarksClient } from '@/components/bookmark/bookmarks-client';
import { useLanguage } from '@/context/LanguageContext';
import { StarIcon, BarChart3Icon } from 'lucide-react';
import { UserProfile } from '@/components/profile/UserProfile';

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
  const [activeTab, setActiveTab] = useState<'highlights' | 'bookmarks'>('highlights');

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
