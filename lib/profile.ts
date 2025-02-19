import { supabase } from './supabase';

export interface Visit {
  id: string;
  user_id: string;
  check_in: string;
  check_out: string | null;
}

export interface ProfileStats {
  visits_count: number;
  active_rewards_count: number;
  points: number;
}

export async function getProfileStats(): Promise<ProfileStats> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get visits count
  const { count: visitsCount } = await supabase
    .from('visits')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // Get active rewards count
  const { count: rewardsCount } = await supabase
    .from('reward_redemptions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'active');

  // Get points
  const { data: profile } = await supabase
    .from('profiles')
    .select('points')
    .eq('id', user.id)
    .single();

  return {
    visits_count: visitsCount || 0,
    active_rewards_count: rewardsCount || 0,
    points: profile?.points || 0,
  };
}