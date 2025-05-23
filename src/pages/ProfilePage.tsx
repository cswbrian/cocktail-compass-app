import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { translations } from '@/translations';
import {
  userSettingsService,
  UsernameValidationError,
} from '@/services/user-settings-service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { HighlightsContainer } from '@/components/journal/HighlightsContainer';
import { BookmarksClient } from '@/components/bookmark/bookmarks-client';
import { useLanguage } from '@/context/LanguageContext';
import {
  StarIcon,
  BarChart3Icon,
  Instagram,
} from 'lucide-react';
import { UpdateUsernameDialog } from '@/components/profile/UpdateUsernameDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const [username, setUsername] = useState('');
  const [instagramUsername, setInstagramUsername] =
    useState('');
  const [isUsernameModalOpen, setIsUsernameModalOpen] =
    useState(false);
  const [isInstagramModalOpen, setIsInstagramModalOpen] =
    useState(false);

  useEffect(() => {
    const fetchUserSettings = async () => {
      const settings =
        await userSettingsService.getUserSettings();
      if (settings) {
        setUsername(settings.username);
        // Extract username from the full Instagram URL if it exists
        if (settings.instagram_url) {
          const url = new URL(settings.instagram_url);
          setInstagramUsername(
            url.pathname.replace('/', ''),
          );
        }
      }
    };
    fetchUserSettings();
  }, []);

  const handleInstagramUsernameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setInstagramUsername(e.target.value);
  };

  const handleInstagramUsernameUpdate = async () => {
    try {
      await userSettingsService.updateInstagramUrl(
        instagramUsername,
      );
      toast.success(t.instagramUrlUpdated);
      setIsInstagramModalOpen(false);
    } catch (error: unknown) {
      console.error(
        'Error updating Instagram username:',
        error,
      );
      if (error instanceof UsernameValidationError) {
        toast.error(error.message);
      } else {
        toast.error(t.instagramUrlUpdateFailed);
      }
    }
  };

  return (
    <div className="shadow-md px-6">
      <h2 className="text-xl font-semibold">
        {user?.user_metadata?.name || t.user}
      </h2>
      <div className="flex items-center">
        <span className="mr-2">{username}</span>
        <UpdateUsernameDialog
          username={username}
          onUsernameChange={setUsername}
          isOpen={isUsernameModalOpen}
          onOpenChange={setIsUsernameModalOpen}
        />
      </div>
      <div className="flex items-center mb-4">
        <Instagram className="w-4 h-4 mr-2" />
        {instagramUsername && (
          <a
            href={`https://instagram.com/${instagramUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mr-2 text-primary hover:underline"
          >
            {instagramUsername}
          </a>
        )}
        <Dialog
          open={isInstagramModalOpen}
          onOpenChange={setIsInstagramModalOpen}
        >
          <DialogTrigger asChild>
            <Button
              variant="link"
              className="p-0 text-sm text-muted-foreground"
            >
              {t.updateInstagramUrl}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t.updateInstagramUrl}
              </DialogTitle>
            </DialogHeader>
            <Input
              type="text"
              value={instagramUsername}
              onChange={handleInstagramUsernameChange}
              className="mb-2"
              placeholder="username"
            />
            <Button onClick={handleInstagramUsernameUpdate}>
              {t.update}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

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
  const [activeTab, setActiveTab] = useState<
    'highlights' | 'bookmarks'
  >('highlights');

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
