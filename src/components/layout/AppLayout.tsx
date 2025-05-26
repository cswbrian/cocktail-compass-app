'use client';

import { Header } from '@/components/ui/header';
import { Menu } from '@/components/ui/menu';
import { Toaster } from '@/components/ui/sonner';
import { BottomNav } from '@/components/ui/bottom-nav';
import { InstallPrompt } from '@/components/InstallPrompt';
import { MainContent } from '@/components/ui/main-content';
import { GlobalCocktailLogForm } from '@/components/cocktail-log/GlobalCocktailLogForm';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { BottomNavProvider } from '@/context/BottomNavContext';
import { CocktailLogProvider } from '@/context/CocktailLogContext';
import { VisitFormProvider } from '@/context/VisitFormContext';
import { GlobalVisitForm } from '@/components/visit/GlobalVisitForm';
import { VisitProvider } from '@/context/VisitContext';
import { UserVisitProvider } from '@/context/UserVisitContext';

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
            <VisitProvider>
              <UserVisitProvider>
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
                      <GlobalCocktailLogForm />
                      <GlobalVisitForm />
                      <Toaster />
                    </div>
                  </div>
                </VisitFormProvider>
              </UserVisitProvider>
            </VisitProvider>
          </CocktailLogProvider>
        </BottomNavProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
