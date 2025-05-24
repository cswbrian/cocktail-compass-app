import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { translations } from '@/translations';
import { userSettingsService } from '@/services/user-settings-service';
import { useLanguage } from '@/context/LanguageContext';
import {
  Instagram,
} from 'lucide-react';
import { UpdateProfileDialog } from './UpdateProfileDialog';
import { Button } from '../ui/button';

export const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const [username, setUsername] = useState('');
  const [instagramUsername, setInstagramUsername] =
    useState('');
  const [threadsUsername, setThreadsUsername] =
    useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] =
    useState(false);

  useEffect(() => {
    const fetchUserSettings = async () => {
      const settings =
        await userSettingsService.getUserSettings();
      if (settings) {
        setUsername(settings.username || '');
        if (settings.instagram_handle) {
          const url = new URL(
            `https://instagram.com/${settings.instagram_handle}`,
          );
          setInstagramUsername(
            url.pathname.replace('/', ''),
          );
        }
        if (settings.threads_handle) {
          setThreadsUsername(settings.threads_handle);
        }
      }
    };
    fetchUserSettings();
  }, []);

  return (
    <div className="shadow-md px-6">  
      <h2 className="mt-4 text-3xl font-semibold">{username}</h2>
      <div className="flex items-center text-muted-foreground mb-2">
        {user?.user_metadata?.name || t.user}
      </div>
      <div className="flex items-center gap-x-4">
        {instagramUsername && (
          <div className="flex items-center gap-2">
            <a
              href={`https://instagram.com/${instagramUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-muted-foreground gap-2"
            >
              <Instagram className="w-4 h-4" />
              <span>{instagramUsername}</span>
            </a>
          </div>
        )}
        {threadsUsername && (
          <div className="flex items-center gap-2">
            <a
              href={`https://threads.net/${threadsUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-muted-foreground gap-2"
            >
              <img
                src="/threads.svg"
                alt="Threads"
                width={16}
                height={16}
              />
              <span>{threadsUsername}</span>
            </a>
          </div>
        )}
      </div>
      <Button
        onClick={() => setIsProfileModalOpen(true)}
        variant="link"
        className="p-0 text-muted-foreground"
      >
        {t.editProfile}
      </Button>
      <UpdateProfileDialog
        username={username}
        instagramHandle={instagramUsername}
        threadsHandle={threadsUsername}
        onUsernameChange={setUsername}
        onInstagramChange={setInstagramUsername}
        onThreadsChange={setThreadsUsername}
        isOpen={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
      />
    </div>
  );
};
