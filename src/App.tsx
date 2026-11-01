import { BrowserRouter as Router } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import AppRoutes from './routes';
import { ScrollToTop } from './components/ScrollToTop';
// Explorer-only: skip Supabase-backed providers
// import { UserSettingsProvider } from '@/context/UserSettingsContext';
// import { AuthProvider } from '@/context/AuthContext';
// import { VisitProvider } from '@/context/VisitContext';

function App() {
  // Explorer-only: was wrapped in AuthProvider + UserSettingsProvider
  return (
    <Router>
      <ScrollToTop />
      <AppLayout>
        <AppRoutes />
      </AppLayout>
    </Router>
  );
}

export default App;
