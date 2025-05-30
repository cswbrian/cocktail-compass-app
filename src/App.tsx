import { BrowserRouter as Router } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import AppRoutes from './routes';
import { ScrollToTop } from './components/ScrollToTop';
import { UserSettingsProvider } from '@/context/UserSettingsContext';
import { AuthProvider } from '@/context/AuthContext';
import { VisitProvider } from '@/context/VisitContext';

function App() {
  return (
    <AuthProvider>
      <UserSettingsProvider>
        <Router>
          <ScrollToTop />
          <AppLayout>
            <AppRoutes />
          </AppLayout>
        </Router>
      </UserSettingsProvider>
    </AuthProvider>
  );
}

export default App;
