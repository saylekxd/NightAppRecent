import { supabase } from './supabase';

export interface Reward {
  id: string;
  title: string;
  description: string;
  points_required: number;
  image_url: string;
  is_active: boolean;
  quantity?: number;
}

export interface RewardRedemption {
  id: string;
  reward_id: string;
  code: string;
  status: 'active' | 'used' | 'expired';
  expires_at: string;
  created_at: string;
  used_at?: string;
  reward?: Reward;
}

export async function getAvailableRewards() {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('is_active', true)
    .order('points_required', { ascending: true });

  if (error) throw error;
  return data as Reward[];
}

export async function redeemReward(rewardId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .rpc('redeem_reward', {
      p_reward_id: rewardId,
      p_user_id: user.id,
    });

  if (error) throw error;
  return getRedemption(data);
}

export async function getRedemption(redemptionId: string) {
  const { data, error } = await supabase
    .from('reward_redemptions')
    .select(`
      *,
      reward:rewards(*)
    `)
    .eq('id', redemptionId)
    .single();

  if (error) throw error;
  return data as RewardRedemption & { reward: Reward };
}

export async function getUserRedemptions() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('reward_redemptions')
    .select(`
      *,
      reward:rewards(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as (RewardRedemption & { reward: Reward })[];
}