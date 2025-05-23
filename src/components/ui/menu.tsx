'use client';

import { Link } from 'react-router-dom';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import {
  BUY_ME_A_DRINK_URL,
  FEEDBACK_FORM_URL,
} from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { Button } from './button';
// User Profile Component
interface UserProfileProps {
  user: {
    user_metadata?: {
      avatar_url?: string;
      name?: string;
    };
  };
  onLogout: () => void;
  t: {
    signOut: string;
    language: string;
    appName: string;
    loading: string;
    signInWithGoogle: string;
    giveMeFeedback: string;
    buyMeADrink: string;
  };
}

const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onLogout,
  t,
}) => (
  <div className="flex justify-between gap-2 items-center">
    <div className="flex items-center gap-2">
      {user.user_metadata?.avatar_url && (
        <img
          src={user.user_metadata.avatar_url}
          alt="Profile"
          width={32}
          height={32}
          className="rounded-full"
        />
      )}
      <span className="font-medium">
        Halo, {user.user_metadata?.name || 'User'}!
      </span>
    </div>
    <div
      className="text-sm text-primary"
      onClick={onLogout}
    >
      {t.signOut}
    </div>
  </div>
);

// Language Selector Component
interface LanguageSelectorProps {
  language: string;
  toggleLanguage: () => void;
  t: {
    language: string;
  };
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  language,
  toggleLanguage,
  t,
}) => (
  <li className="flex items-center justify-between py-2">
    <span className="font-medium">{t.language}</span>
    <Tabs defaultValue={language} className="w-[200px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger
          value="en"
          onClick={() =>
            language !== 'en' && toggleLanguage()
          }
          aria-label="English"
        >
          English
        </TabsTrigger>
        <TabsTrigger
          value="zh"
          onClick={() =>
            language !== 'zh' && toggleLanguage()
          }
          aria-label="Chinese"
        >
          中文
        </TabsTrigger>
      </TabsList>
    </Tabs>
  </li>
);

// Footer Links Component
interface FooterLinksProps {
  t: {
    giveMeFeedback: string;
    buyMeADrink: string;
  };
}

const FooterLinks: React.FC<FooterLinksProps> = ({ t }) => (
  <div className="mt-4">
    <SheetClose asChild>
      <a
        href={FEEDBACK_FORM_URL}
        className="inline-flex h-10 items-center justify-center rounded-full px-4 py-2 text-sm font-medium border border-primary text-primary hover:bg-primary/90 w-full mb-4"
        target="_blank"
        rel="noopener noreferrer"
      >
        {t.giveMeFeedback}
      </a>
    </SheetClose>
    <SheetClose asChild>
      <a
        href={BUY_ME_A_DRINK_URL}
        className="inline-flex h-10 items-center justify-center rounded-full px-4 py-2 text-sm font-medium border border-primary text-primary hover:bg-primary/90 w-full mb-4"
        target="_blank"
        rel="noopener noreferrer"
      >
        {t.buyMeADrink} 🍸
      </a>
    </SheetClose>
    <div className="mt-4 flex gap-2">
      <SheetClose asChild>
        <a
          href="https://github.com/cswbrian/cocktail-compass-app"
          className="hover:text-gray-400 flex items-center gap-1"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/github.svg"
            alt="GitHub"
            width={24}
            height={24}
          />
        </a>
      </SheetClose>
      <SheetClose asChild>
        <a
          href="https://www.threads.net/@coolsunwind"
          className="hover:text-gray-400 flex items-center gap-1"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/threads.svg"
            alt="Threads"
            width={24}
            height={24}
          />
        </a>
      </SheetClose>
    </div>
    <SheetClose asChild>
      <a
        href="https://www.flaticon.com/free-icons/magic-lamp"
        title="magic lamp icons"
        className="hover:text-gray-400 text-xs text-gray-500"
      >
        Magic lamp icons created by Freepik - Flaticon
      </a>
    </SheetClose>
  </div>
);

// Main Menu Component
export function Menu() {
  const { language, toggleLanguage } = useLanguage();
  const { user, loading, signInWithProvider, signOut } =
    useAuth();
  const t =
    translations[language as keyof typeof translations];

  const handleGoogleLogin = async () => {
    try {
      await signInWithProvider('google');
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="fixed top-3 right-4 z-50">
      <Sheet>
        <SheetTrigger asChild>
          {loading ? (
            <div className="h-6 w-6 animate-pulse bg-gray-200 rounded-full" />
          ) : user ? (
            <div className="h-[30px] w-[30px] rounded-full overflow-hidden cursor-pointer">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  width={30}
                  height={30}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center text-white">
                  {user.user_metadata?.name?.[0]?.toUpperCase() ||
                    'U'}
                </div>
              )}
            </div>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="px-4"
            >
              {t.login}
            </Button>
          )}
        </SheetTrigger>
        <SheetContent
          side="right"
          className="h-full w-full sm:w-[540px]"
        >
          <div className="flex flex-col justify-between h-full">
            {/* Header */}
            <div>
              <SheetHeader className="p-0">
                <SheetTitle className="font-normal text-left text-base">
                  <SheetClose asChild>
                    <Link to="/">{t.appName}</Link>
                  </SheetClose>
                </SheetTitle>
              </SheetHeader>

              {/* Auth Section */}
              <div className="border-b border-gray-200 py-4 mb-4">
                {loading ? (
                  <p className="text-sm text-gray-500">
                    {t.loading}
                  </p>
                ) : user ? (
                  <UserProfile
                    user={user}
                    onLogout={handleLogout}
                    t={t}
                  />
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleLogin}
                  >
                    <img
                      src="/google.svg"
                      alt="Google"
                      width={20}
                      height={20}
                      className="mr-2"
                    />
                    {t.signInWithGoogle}
                  </Button>
                )}
              </div>

              {/* Language Selection */}
              <ul className="mt-4">
                <LanguageSelector
                  language={language}
                  toggleLanguage={toggleLanguage}
                  t={t}
                />
              </ul>
            </div>

            {/* Footer */}
            <FooterLinks t={t} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
