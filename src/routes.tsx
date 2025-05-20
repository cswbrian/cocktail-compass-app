import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ExplorerPage from "./pages/ExplorerPage";
import FeedsPage from "./pages/FeedsPage";
import RecommendFeedPage from "./pages/RecommendFeedPage";
import MyFeedPage from "./pages/MyFeedPage";
import SearchPage from "./pages/SearchPage";
import CocktailDetails from "./pages/CocktailDetailsPage";
import BookmarksPage from "./pages/BookmarksPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsAndConditionsPage from "./pages/TermsAndConditionsPage";
import LogDetailPage from "./pages/LogDetailPage";
import PlaceDetailPage from "./pages/PlaceDetailPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import ProfilePage from "./pages/ProfilePage";
import NewLogPage from "./pages/NewLogPage";
import DrinkerProfilePage from "./pages/DrinkerProfilePage";
import SetupProfilePage from "./pages/SetupProfilePage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth callback route */}
      <Route path="/auth/callback" element={<AuthCallbackPage />} />


      {/* Language-specific routes */}
      <Route path="/:language">
        <Route index element={<Home />} />
        <Route path="explorer" element={<ExplorerPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="bookmarks" element={<BookmarksPage />} />
        <Route path="cocktails/:slug" element={<CocktailDetails />} />
        <Route path="places/:placeId" element={<PlaceDetailPage />} />
        <Route path="drinkers/:username" element={<DrinkerProfilePage />} />
        <Route path="logs">
          <Route path="new" element={<NewLogPage />} />
          <Route path=":logId" element={<LogDetailPage />} />
          <Route path=":logId/edit" element={<LogDetailPage />} />
        </Route>
        <Route path="feeds" element={<FeedsPage />}>
          <Route index element={<Navigate to="/zh/feeds/recommend" replace />} />
          <Route path="recommend" element={<RecommendFeedPage />} />
          <Route path="me" element={<MyFeedPage />} />
        </Route>
        <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
        <Route
          path="terms-and-conditions"
          element={<TermsAndConditionsPage />}
        />
        <Route path="profile">
          <Route path="" element={<ProfilePage />} />
          <Route path="setup" element={<SetupProfilePage />} />
        </Route>
      </Route>

      {/* Catch all route - redirect to default language */}
      <Route path="*" element={<Navigate to="/zh" replace />} />
    </Routes>
  );
}
