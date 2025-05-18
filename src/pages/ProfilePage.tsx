import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { translations } from "@/translations";
import { userSettingsService } from "@/services/user-settings-service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { HighlightsContainer } from "@/components/journal/HighlightsContainer";
import { BookmarksClient } from "@/components/bookmark/bookmarks-client";
import { useLanguage } from "@/context/LanguageContext";
import { StarIcon, BarChart3Icon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const [username, setUsername] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserSettings = async () => {
      const settings = await userSettingsService.getUserSettings();
      if (settings) {
        setUsername(settings.username);
      }
    };
    fetchUserSettings();
  }, []);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleUsernameUpdate = async () => {
    try {
      await userSettingsService.updateUsername(username);
      toast.success(t.usernameUpdated);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating username:", error);
      toast.error(t.usernameUpdateFailed);
    }
  };

  return (
    <div className="shadow-md px-6">
      <h2 className="text-xl font-semibold">
        {user?.user_metadata?.name || t.user}
      </h2>
      <div className="flex items-center mb-2">
        <span className="mr-2">{username}</span>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button variant="link" className="p-0 text-sm">{t.edit}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.updateUsername}</DialogTitle>
            </DialogHeader>
            <Input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              className="mb-2"
              placeholder={t.enterNewUsername}
            />
            <Button onClick={handleUsernameUpdate}>{t.update}</Button>
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
            ? "border-primary text-primary"
            : "border-transparent"
        }`}
      >
        <BarChart3Icon className="w-4 h-4" />
        {t.highlights}
      </button>
      <button
        onClick={() => onTabChange('bookmarks')}
        className={`flex items-center justify-center gap-2 py-2 border-b-2 ${
          activeTab === 'bookmarks'
            ? "border-primary text-primary"
            : "border-transparent"
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
        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
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
