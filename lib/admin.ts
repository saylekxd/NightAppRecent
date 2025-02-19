import { supabase } from './supabase';

interface User {
  id: string;
  full_name: string;
  points: number;
}

interface Reward {
  id: string;
  title: string;
  points_required: number;
}

interface VisitQRData {
  type: 'visit';
  user: User;
  code: string;
}

interface RewardQRData {
  type: 'reward';
  user: User;
  reward: Reward;
  code: string;
  expires_at: string;
}

export interface QRValidationResult {
  valid: boolean;
  data?: VisitQRData | RewardQRData;
  error?: string;
}

export interface AdminStats {
  visits_count: number;
  rewards_used: number;
  points_awarded: number;
  capacity_percentage: number;
}

export async function checkAdminStatus(): Promise<boolean> {
  try {
    console.log('Checking admin status...');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No authenticated user found');
      return false;
    }
    
    console.log('User found, checking profile:', user.id);

    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    console.log('Admin check result:', data?.is_admin);
    return data?.is_admin || false;
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
}

export async function validateQRCode(code: string, activity_name: string): Promise<QRValidationResult> {
  try {
    // Check admin status first
    const isAdmin = await checkAdminStatus();
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    const { data, error } = await supabase
      .rpc('validate_qr_code', { 
        p_code: code,
        p_activity_name: activity_name 
      });

    if (error) throw error;
    return data as QRValidationResult;
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to validate QR code',
    };
  }
}

export async function acceptVisit(code: string, activity_name: string): Promise<void> {
  try {
    // Check admin status first
    const isAdmin = await checkAdminStatus();
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    console.log('Accepting visit:', { code, activity_name });

    const { error } = await supabase
      .rpc('accept_visit', { 
        p_code: code,
        p_activity_name: activity_name 
      });

    if (error) {
      console.error('Accept visit error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Accept visit error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to accept visit');
  }
}

export async function acceptReward(lastThreeChars: string) {
  try {
    // Check admin status first
    const isAdmin = await checkAdminStatus();
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    // Get active redemptions that end with the provided characters
    const { data: redemptions, error: searchError } = await supabase
      .from('reward_redemptions')
      .select(`
        *,
        reward:rewards(*)
      `)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .filter('code', 'ilike', `%${lastThreeChars}`);

    if (searchError) throw searchError;

    if (!redemptions || redemptions.length === 0) {
      throw new Error('No active redemption found with this code');
    }

    if (redemptions.length > 1) {
      throw new Error('Multiple redemptions found. Please use more characters');
    }

    const redemption = redemptions[0];

    // Call the RPC function to handle the redemption
    const { error: rpcError } = await supabase
      .rpc('accept_reward', { 
        p_code: redemption.code 
      });

    if (rpcError) {
      console.error('Failed to accept reward:', rpcError);
      throw rpcError;
    }

    // Verify the update was successful
    const { data: updatedRedemption, error: verifyError } = await supabase
      .from('reward_redemptions')
      .select('*')
      .eq('id', redemption.id)
      .single();

    if (verifyError || !updatedRedemption || updatedRedemption.status !== 'used') {
      throw new Error('Failed to update redemption status');
    }

    return redemption;
  } catch (error) {
    console.error('Accept reward error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to redeem code');
  }
}

export async function getAdminStats(): Promise<AdminStats> {
  // Check admin status first
  const isAdmin = await checkAdminStatus();
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required');
  }

  const { data, error } = await supabase
    .rpc('get_admin_stats', {
      p_date: new Date().toISOString(),
    });

  if (error) throw error;
  return data as AdminStats;
}