import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import ExplorerPage from './pages/ExplorerPage'
import JournalPage from './pages/JournalPage'
import FeedsPage from './pages/FeedsPage'
import HighlightsPage from './pages/HighlightsPage'
import SearchPage from './pages/SearchPage'
import CocktailDetails from './pages/CocktailDetailsPage'
import BookmarksPage from './pages/BookmarksPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsAndConditionsPage from './pages/TermsAndConditionsPage'
import LogDetailPage from './pages/LogDetailPage'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Redirect root to default language (zh) */}
      {/* <Route path="/" element={<Navigate to="/zh/journal/feeds" replace />} /> */}
      
      {/* Language-specific routes */}
      <Route path="/:language">
        <Route index element={<Home />} />
        <Route path="explorer" element={<ExplorerPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="bookmarks" element={<BookmarksPage />} />
        <Route path="cocktails/:slug" element={<CocktailDetails />} />
        <Route path="logs/:logId" element={<LogDetailPage />} />
        <Route path="logs/:logId/edit" element={<LogDetailPage />} />
        <Route path="journal" element={<JournalPage />}>
          <Route index element={<Navigate to="feeds" replace />} />
          <Route path="feeds" element={<FeedsPage />} />
          <Route path="highlights" element={<HighlightsPage />} />
        </Route>
        <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="terms-and-conditions" element={<TermsAndConditionsPage />} />
      </Route>
      
      {/* Catch all route - redirect to default language */}
      {/* <Route path="*" element={<Navigate to="/zh" replace />} /> */}
    </Routes>
  )
} 