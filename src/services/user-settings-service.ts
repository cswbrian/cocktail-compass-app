import { supabase } from '@/lib/supabase';
import { AuthService } from '@/services/auth-service';

interface UserSettings {
  username: string;
}

export class UserSettingsService {
  async getUserSettings(): Promise<UserSettings | null> {
    const user = await AuthService.getCurrentSession();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_settings')
      .select('username')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data ? { username: data.username } : null;
  }

  async updateUsername(username: string): Promise<void> {
    const user = await AuthService.getCurrentSession();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, username });

    if (error) throw error;
  }
}

export const userSettingsService = new UserSettingsService(); 