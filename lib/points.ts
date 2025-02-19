import { supabase } from './supabase';

export interface Transaction {
  id: string;
  amount: number;
  type: 'earn' | 'spend';
  description: string;
  created_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}

export interface QRCode {
  id: string;
  code: string;
  expires_at: string | null;
  is_active: boolean;
}

// Points Management
export async function getPointsBalance() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .select('points')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data.points;
}

export async function getTransactionHistory() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Transaction[];
}

// QR Code Management
export async function generateQRCode() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // First, deactivate any existing active QR codes
  await supabase
    .from('qr_codes')
    .update({ is_active: false })
    .eq('user_id', user.id)
    .eq('is_active', true);

  // Generate a unique code
  const code = `${user.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const { data, error } = await supabase
    .from('qr_codes')
    .insert({
      user_id: user.id,
      code,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data as QRCode;
}

export async function getActiveQRCode() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // First, check for an existing active and non-expired QR code
  const { data: existingQR, error: fetchError } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // If we found a valid QR code, return it
  if (existingQR) {
    return existingQR as QRCode;
  }

  // If no valid QR code exists or there was an error, generate a new one
  return generateQRCode();
}

// Challenges
export async function getActiveChallenges() {
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Challenge[];
}

export async function getUserChallenges() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('user_challenges')
    .select(`
      *,
      challenge:challenges(*)
    `)
    .eq('user_id', user.id);

  if (error) throw error;
  return data;
}

// Referrals
export async function createReferral(referredEmail: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // First, check if the referred user exists
  const { data: referredUser, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', referredEmail)
    .single();

  if (userError) throw new Error('Referred user not found');

  // Create the referral
  const { error } = await supabase
    .from('referrals')
    .insert({
      referrer_id: user.id,
      referred_id: referredUser.id,
    });

  if (error) throw error;
}

export async function getReferrals() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('referrals')
    .select(`
      *,
      referred:profiles!referred_id(username, full_name)
    `)
    .eq('referrer_id', user.id);

  if (error) throw error;
  return data;
}