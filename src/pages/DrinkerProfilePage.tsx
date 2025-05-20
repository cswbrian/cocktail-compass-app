import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/translations";
import { userSettingsService } from "@/services/user-settings-service";
import { userStatsService } from "@/services/user-stats-service";
import { BasicStats } from "@/components/stats/BasicStats";
import { CocktailLogList } from "@/components/cocktail-log/CocktailLogList";
import { Skeleton } from "@/components/ui/skeleton";
import { cocktailLogService } from "@/services/cocktail-log-service";
import { Instagram } from "lucide-react";

interface UserStats {
  totalCocktailsDrunk: number;
  uniqueCocktails: number;
  uniquePlaces: number;
}

const DrinkerProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { language } = useLanguage();
  const t = translations[language];
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [instagramUsername, setInstagramUsername] = useState<string>("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user ID from username
        const { data: userData } = await userSettingsService.getUserByUsername(username!);
        if (!userData) return;
        
        setUserId(userData.user_id);
        
        // Get user stats
        const stats = await userStatsService.getUserStatsByUserId(userData.user_id);
        if (stats) {
          setUserStats({
            totalCocktailsDrunk: stats.basicStats.totalCocktailsDrunk,
            uniqueCocktails: stats.basicStats.uniqueCocktails,
            uniquePlaces: stats.basicStats.uniquePlaces
          });
        }

        // Get user settings for Instagram URL
        const settings = await userSettingsService.getUserSettingsByUserId(userData.user_id);
        if (settings?.instagram_url) {
          const url = new URL(settings.instagram_url);
          setInstagramUsername(url.pathname.replace('/', ''));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchUserData();
    }
  }, [username]);

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
        <h2 className="text-xl font-semibold mb-2">{t.userNotFound}</h2>
        <p className="text-muted-foreground">{t.userNotFoundDescription}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="p-6">
        <h2 className="text-xl font-semibold">{username}</h2>
        
        {instagramUsername && (
          <div className="flex items-center mt-2">
            <Instagram className="w-4 h-4 mr-2" />
            <a 
              href={`https://instagram.com/${instagramUsername}`}
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:underline"
            >
              {instagramUsername}
            </a>
          </div>
        )}
        
        <div className="mt-4">
        <BasicStats stats={userStats} />
        </div>
      </div>
      
      <div>
        <CocktailLogList 
          type="user"
          id={userId}
          onLoadMore={async () => {
            const result = await cocktailLogService.getPublicLogsByUserId(userId);
            return result;
          }}
        />
      </div>
    </div>
  );
};

export default DrinkerProfilePage; 