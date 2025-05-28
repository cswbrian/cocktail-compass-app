import React, {
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations';
import { userSettingsService } from '@/services/user-settings-service';
import { userStatsService } from '@/services/user-stats-service';
import { BasicStats } from '@/components/stats/BasicStats';
import { VisitList } from '@/components/visit/VisitList';
import { Skeleton } from '@/components/ui/skeleton';
import { SocialMediaLinks } from '@/components/profile/SocialMediaLinks';
import useSWR from 'swr';
import { fetchers, CACHE_KEYS } from '@/lib/swr-config';
import { Instagram } from 'lucide-react';
import { Visit } from '@/types/visit';

interface UserStats {
  totalCocktailsDrunk: number;
  uniqueCocktails: number;
  uniquePlaces: number;
}

const DrinkerProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { language } = useLanguage();
  const t = translations[language];
  const [userStats, setUserStats] =
    useState<UserStats | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [instagramHandle, setInstagramHandle] = useState<string>('');
  const [threadsHandle, setThreadsHandle] = useState<string>('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user ID from username
        const { data: userData } =
          await userSettingsService.getUserByUsername(
            username!,
          );
        if (!userData) return;

        setUserId(userData.user_id);

        // Get user stats
        const stats =
          await userStatsService.getUserStatsByUserId(
            userData.user_id,
          );
        if (stats) {
          setUserStats({
            totalCocktailsDrunk:
              stats.basicStats.totalCocktailsDrunk,
            uniqueCocktails:
              stats.basicStats.uniqueCocktails,
            uniquePlaces: stats.basicStats.uniquePlaces,
          });
        }

        // Get user settings for social media handles
        const settings =
          await userSettingsService.getUserSettingsByUserId(
            userData.user_id,
          );
        if (settings?.instagram_handle) {
          setInstagramHandle(settings.instagram_handle);
        }
        if (settings?.threads_handle) {
          setThreadsHandle(settings.threads_handle);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchUserData();
    }
  }, [username]);

  // Fetch public visits using SWR
  const {
    data: visitsData,
    isLoading: isLoadingVisits,
    mutate,
  } = useSWR<{ visits: Visit[]; hasMore: boolean }>(
    userId ? [CACHE_KEYS.PUBLIC_VISITS(page), userId] : null,
    () =>
      fetchers.getPublicVisitsByUserId(
        userId!,
        page,
        PAGE_SIZE,
      ),
    {
      fallbackData: { visits: [], hasMore: false },
      revalidateOnFocus: false,
      revalidateIfStale: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    },
  );

  const loadMore = useCallback(() => {
    if (visitsData?.hasMore && !isLoadingVisits) {
      setPage(prev => prev + 1);
    }
  }, [visitsData?.hasMore, isLoadingVisits]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-6">
          <Skeleton className="h-24 w-32" />
          <Skeleton className="h-24 w-32" />
          <Skeleton className="h-24 w-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!userStats || !userId) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">
          {t.userNotFound}
        </h2>
        <p className="text-muted-foreground">
          {t.userNotFoundDescription}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="p-6">
        <h2 className="text-xl font-semibold">
          {username}
        </h2>
        <SocialMediaLinks 
          instagramHandle={instagramHandle}
          threadsHandle={threadsHandle}
        />
        <div className="mt-4">
          <BasicStats />
        </div>
      </div>

      <div>
        <VisitList
          visits={visitsData?.visits || []}
          isLoading={isLoadingVisits}
          hasMore={visitsData?.hasMore || false}
          onLoadMore={loadMore}
          feedType="recommend"
        />
      </div>
    </div>
  );
};

export default DrinkerProfilePage;
