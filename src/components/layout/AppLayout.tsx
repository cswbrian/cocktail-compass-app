'use client';

import { Header } from '@/components/ui/header';
import { Menu } from '@/components/ui/menu';
import { Toaster } from '@/components/ui/sonner';
import { BottomNav } from '@/components/ui/bottom-nav';
import { InstallPrompt } from '@/components/InstallPrompt';
import { MainContent } from '@/components/ui/main-content';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { BottomNavProvider } from '@/context/BottomNavContext';
import { CocktailLogProvider } from '@/context/CocktailLogContext';
import { CocktailProvider } from '@/context/CocktailContext';
import { VisitFormProvider } from '@/context/VisitFormContext';
import { GlobalVisitForm } from '@/components/visit/GlobalVisitForm';
import { VisitProvider } from '@/context/VisitContext';
import { InAppBrowserWarning } from '@/components/InAppBrowserWarning';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BottomNavProvider>
          <CocktailLogProvider>
            <CocktailProvider>
              <VisitProvider>
                  <VisitFormProvider>
                    <div className={`antialiased dark`}>
                      <div className="flex flex-col min-h-screen">
                        <Header />
                        <Menu />
                        <main className="w-full max-w-4xl mx-auto h-[calc(100vh-50px)]">
                          <MainContent>{children}</MainContent>
                        </main>
                        <InstallPrompt />
                        <BottomNav />
                        <GlobalVisitForm />
                        <Toaster />
                        <InAppBrowserWarning />
                      </div>
                    </div>
                  </VisitFormProvider>
              </VisitProvider>
            </CocktailProvider>
          </CocktailLogProvider>
        </BottomNavProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
