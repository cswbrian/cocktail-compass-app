import {
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import Home from './pages/Home';
import ExplorerPage from './pages/ExplorerPage';
import FeedsPage from './pages/FeedsPage';
import RecommendFeedPage from './pages/RecommendFeedPage';
import MyFeedPage from './pages/MyFeedPage';
import SearchPage from './pages/SearchPage';
import CocktailDetails from './pages/CocktailDetailsPage';
import BookmarksPage from './pages/BookmarksPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage';
import LogDetailPage from './pages/LogDetailPage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import ProfilePage from './pages/ProfilePage';
import NewVisitPage from './pages/NewVisitPage';
import VisitDetailPage from './pages/VisitDetailPage';
import DrinkerProfilePage from './pages/DrinkerProfilePage';
import SetupProfilePage from './pages/SetupProfilePage';
import IngredientDetailPage from './pages/IngredientDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import TwistPage from './pages/TwistPage';
import MapPage from './pages/MapPage';
import { RequireUsername } from '@/components/RequireUsername';
import { AuthWrapper } from '@/components/auth/auth-wrapper';
import { FeedRedirect } from '@/components/FeedRedirect';
import { PlaceFeedRedirect } from '@/components/place';
import { LoginScreen } from '@/components/login/login-screen';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth callback route */}
      <Route
        path="/auth/callback"
        element={<AuthCallbackPage />}
      />

      {/* Language-specific routes */}
      <Route
        path=":language/profile/setup"
        element={
          <AuthWrapper>
            <SetupProfilePage />
          </AuthWrapper>
        }
      />
      <Route path=":language" element={<RequireUsername />}>
        <Route index element={<Home />} />
        <Route path="explorer" element={<ExplorerPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="map" element={<MapPage />} />
        <Route
          path="bookmarks"
          element={<BookmarksPage />}
        />
        <Route
          path="cocktails/:slug"
          element={<CocktailDetails />}
        />
        <Route
          path="cocktails/:slug/twist"
          element={<TwistPage />}
        />
        <Route
          path="ingredients/:slug"
          element={<IngredientDetailPage />}
        />
        <Route
          path="places/:placeId"
          element={<PlaceFeedRedirect />}
        />
        <Route
          path="places/:placeId/feeds"
          element={<PlaceDetailPage />}
        >
          <Route
            index
            element={<PlaceFeedRedirect />}
          />
          <Route
            path="recommend"
            element={<PlaceDetailPage />}
          />
          <Route path="me" element={<PlaceDetailPage />} />
        </Route>
        <Route
          path="drinkers/:username"
          element={<DrinkerProfilePage />}
        />
        <Route path="logs">
          <Route
            path=":logId"
            element={<LogDetailPage />}
          />
          <Route
            path=":logId/edit"
            element={<LogDetailPage />}
          />
        </Route>
        <Route path="visits">
          <Route path="new" element={<NewVisitPage />} />
          <Route
            path=":visitId"
            element={<VisitDetailPage />}
          />
          <Route
            path=":visitId/edit"
            element={<VisitDetailPage />}
          />
        </Route>
        <Route path="feeds" element={<FeedsPage />}>
          <Route
            index
            element={<FeedRedirect />}
          />
          <Route
            path="recommend"
            element={<RecommendFeedPage />}
          />
          <Route path="me" element={<MyFeedPage />} />
        </Route>
        <Route
          path="privacy-policy"
          element={<PrivacyPolicyPage />}
        />
        <Route
          path="terms-and-conditions"
          element={<TermsAndConditionsPage />}
        />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Login route - accessible without authentication */}
      <Route
        path=":language/login"
        element={<LoginScreen />}
      />

      <Route
        path="/"
        element={<Navigate to="/zh" replace />}
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
