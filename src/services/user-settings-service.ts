import { supabase } from '@/lib/supabase';
import { AuthService } from '@/services/auth-service';
import { userStatsService } from '@/services/user-stats-service';

interface UserSettings {
  username: string;
  instagram_url?: string;
}

interface UserData {
  user_id: string;
  username: string;
}

interface UserStats {
  totalCocktailsDrunk: number;
  uniqueCocktails: number;
  uniquePlaces: number;
}

export class UsernameValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UsernameValidationError';
  }
}

export class UserSettingsService {
  private validateInstagramUrl(
    username: string | undefined,
  ): void {
    if (!username) return;

    // Check length (Instagram usernames are 1-30 characters)
    if (username.length > 30) {
      throw new UsernameValidationError(
        'Instagram username cannot exceed 30 characters',
      );
    }

    // Check for valid characters (letters, numbers, periods, and underscores only)
    const validUsernameRegex = /^[a-zA-Z0-9._]+$/;
    if (!validUsernameRegex.test(username)) {
      throw new UsernameValidationError(
        'Instagram username can only contain letters, numbers, periods, and underscores',
      );
    }

    // Check for consecutive periods
    if (username.includes('..')) {
      throw new UsernameValidationError(
        'Instagram username cannot contain consecutive periods',
      );
    }

    // Check if username starts or ends with a period
    if (
      username.startsWith('.') ||
      username.endsWith('.')
    ) {
      throw new UsernameValidationError(
        'Instagram username cannot start or end with a period',
      );
    }
  }

  private formatInstagramUrl(username: string): string {
    return `https://instagram.com/${username}`;
  }

  private validateUsername(username: string): void {
    // Check length
    if (username.length > 30) {
      throw new UsernameValidationError(
        'Username cannot exceed 30 characters',
      );
    }

    // Check for valid characters (lowercase letters, numbers, and periods only)
    const validUsernameRegex = /^[a-z0-9.]+$/;
    if (!validUsernameRegex.test(username)) {
      throw new UsernameValidationError(
        'Username can only contain lowercase letters, numbers, and periods',
      );
    }

    // Check for consecutive periods
    if (username.includes('..')) {
      throw new UsernameValidationError(
        'Username cannot contain consecutive periods',
      );
    }

    // Check if username starts or ends with a period
    if (
      username.startsWith('.') ||
      username.endsWith('.')
    ) {
      throw new UsernameValidationError(
        'Username cannot start or end with a period',
      );
    }
  }

  async getUserSettings(): Promise<UserSettings | null> {
    const user = await AuthService.getCurrentSession();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_settings')
      .select('username, instagram_url')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data
      ? {
          username: data.username,
          instagram_url: data.instagram_url,
        }
      : null;
  }

  async updateUsername(username: string): Promise<void> {
    const user = await AuthService.getCurrentSession();
    if (!user) throw new Error('User not authenticated');

    // Validate username format
    this.validateUsername(username);

    // Check if username already exists
    const { data: existingUser, error: checkError } =
      await supabase
        .from('user_settings')
        .select('user_id')
        .ilike('username', username)
        .neq('user_id', user.id)
        .maybeSingle();

    if (checkError) {
      throw checkError;
    }

    if (existingUser) {
      throw new UsernameValidationError(
        'Username is already taken',
      );
    }

    const { error } = await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, username });

    if (error) throw error;
  }

  async updateInstagramUrl(
    instagramUsername: string,
  ): Promise<void> {
    const user = await AuthService.getCurrentSession();
    if (!user) throw new Error('User not authenticated');

    // Validate Instagram username format
    this.validateInstagramUrl(instagramUsername);

    // Format the username into a full Instagram URL
    const instagramUrl = this.formatInstagramUrl(
      instagramUsername,
    );

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        instagram_url: instagramUrl,
      });

    if (error) throw error;
  }

  async getUserByUsername(
    username: string,
  ): Promise<{ data: UserData | null; error: any }> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('user_id, username')
      .eq('username', username)
      .maybeSingle();

    return { data, error };
  }

  async getUserSettingsByUserId(
    userId: string,
  ): Promise<UserSettings | null> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('username, instagram_url')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data
      ? {
          username: data.username,
          instagram_url: data.instagram_url,
        }
      : null;
  }

  async getUserStatsByUsername(
    username: string,
  ): Promise<UserStats | null> {
    const { data: userData, error: userError } =
      await this.getUserByUsername(username);
    if (userError || !userData) return null;

    // Get user stats using the userStatsService
    const stats =
      await userStatsService.getUserStatsByUserId(
        userData.user_id,
      );
    if (!stats) return null;

    return {
      totalCocktailsDrunk:
        stats.basicStats.totalCocktailsDrunk,
      uniqueCocktails: stats.basicStats.uniqueCocktails,
      uniquePlaces: stats.basicStats.uniquePlaces,
    };
  }
}

export const userSettingsService =
  new UserSettingsService();
