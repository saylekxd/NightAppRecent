import { supabase } from './supabase';

export interface Review {
  id: string;
  user_id: string;
  mood: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string;
    avatar_url: string | null;
  };
}

/**
 * Check if user has had a transaction in the last 24 hours
 */
export async function hasRecentTransaction(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Get transactions from the last 24 hours
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);
  
  console.log('Checking transactions since:', oneDayAgo.toISOString());
  
  const { data, error } = await supabase
    .from('transactions')
    .select('id, created_at, type, description')
    .eq('user_id', user.id)
    .gte('created_at', oneDayAgo.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error checking recent transactions:', error);
    return false;
  }

  console.log('Recent transactions found:', data?.length, data);
  
  // If we have any transactions in the last 24 hours, return true
  return data && data.length > 0;
}

/**
 * Check if user has already submitted a review in the last 24 hours
 */
export async function hasRecentReview(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Get reviews from the last 24 hours
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);
  
  const { data, error } = await supabase
    .from('reviews')
    .select('id')
    .eq('user_id', user.id)
    .gte('created_at', oneDayAgo.toISOString())
    .limit(1);

  if (error) {
    console.error('Error checking recent reviews:', error);
    return false;
  }

  return data && data.length > 0;
}

/**
 * Check if user can submit a review
 * Returns an object with canSubmit flag and a reason if they cannot
 */
export async function canSubmitReview(): Promise<{ canSubmit: boolean; reason?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { canSubmit: false, reason: 'You must be logged in to submit a review' };
  }

  const hasTransaction = await hasRecentTransaction();
  if (!hasTransaction) {
    return { 
      canSubmit: false, 
      reason: 'You need to have a transaction in the last 24 hours to submit a review' 
    };
  }

  const hasReview = await hasRecentReview();
  if (hasReview) {
    return { 
      canSubmit: false, 
      reason: 'You have already submitted a review in the last 24 hours' 
    };
  }

  return { canSubmit: true };
}

/**
 * Get all reviews (admin only)
 */
export async function getAllReviews(): Promise<Review[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user is admin
  const { data: profileData } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profileData?.is_admin) {
    throw new Error('Unauthorized: Admin access required');
  }

  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      user:profiles(full_name, avatar_url)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get reviews for the current user
 */
export async function getUserReviews(): Promise<Review[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get review statistics (admin only)
 */
export async function getReviewStats() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if user is admin
  const { data: profileData } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  // Return null for non-admin users instead of throwing an error
  if (!profileData?.is_admin) {
    console.log('Non-admin user attempted to access review stats');
    return null;
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('mood');

  if (error) throw error;

  const reviews = data || [];
  const totalReviews = reviews.length;
  
  if (totalReviews === 0) {
    return {
      totalReviews: 0,
      averageMood: 0,
      moodDistribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
      }
    };
  }

  // Calculate average mood
  const sum = reviews.reduce((acc, review) => acc + review.mood, 0);
  const averageMood = sum / totalReviews;

  // Calculate mood distribution
  const moodDistribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  };

  reviews.forEach(review => {
    moodDistribution[review.mood as keyof typeof moodDistribution]++;
  });

  return {
    totalReviews,
    averageMood,
    moodDistribution
  };
} 