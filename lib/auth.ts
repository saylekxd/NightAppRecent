import { z } from 'zod';
import { supabase } from './supabase';
import { Platform } from 'react-native';

// Validation schemas
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  fullName: z.string().min(2, 'Full name is required').max(16, 'Full name cannot exceed 16 characters'),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SignUpData = z.infer<typeof signUpSchema>;
export type SignInData = z.infer<typeof signInSchema>;

// Auth functions
export async function signUp({ email, password, fullName }: SignUpData) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        username: email,
      },
    },
  });

  if (authError) throw authError;

  // Create initial profile
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        username: email,
        full_name: fullName,
        points: 0,
      });

    if (profileError) throw profileError;
  }

  return authData;
}

export async function signIn({ email, password }: SignInData) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string) {
  // For web platforms, include redirectTo with window.location.origin
  // For native platforms, don't use window.location
  const options = Platform.OS === 'web' 
    ? { redirectTo: `${window.location.origin}/reset-password` }
    : undefined;

  const { error } = await supabase.auth.resetPasswordForEmail(email, options);

  if (error) throw error;
}

// Session management
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

// Profile management
export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    // If profile doesn't exist, create it
    if (error.code === 'PGRST116') {
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: user.email,
          full_name: user.user_metadata.full_name,
          points: 0,
        })
        .select()
        .single();

      if (createError) throw createError;
      return newProfile;
    }
    throw error;
  }

  return data;
}

export async function updateProfile(updates: {
  username?: string;
  full_name?: string;
  points?: number;
  avatar_url?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Account deletion
export async function initiateAccountDeletion(password: string) {
  // First verify the password is correct
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) throw new Error('Not authenticated');
  
  // Verify password by attempting to sign in
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    });
    
    if (error) throw new Error('Incorrect password');
    
    // Mark account for deletion by setting metadata
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30); // 30 days from now
    
    const { error: updateError } = await supabase.auth.updateUser({
      data: { 
        deletion_requested: true,
        deletion_date: deletionDate.toISOString(),
      }
    });
    
    if (updateError) throw updateError;
    
    return { success: true, deletionDate };
  } catch (error) {
    throw error;
  }
}

export async function cancelAccountDeletion() {
  try {
    const { error } = await supabase.auth.updateUser({
      data: { 
        deletion_requested: false,
        deletion_date: null,
      }
    });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    throw error;
  }
}

export async function checkDeletionStatus() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { pendingDeletion: false };
  
  const deletionRequested = user.user_metadata?.deletion_requested;
  const deletionDate = user.user_metadata?.deletion_date;
  
  return { 
    pendingDeletion: !!deletionRequested,
    deletionDate: deletionDate ? new Date(deletionDate) : null
  };
}

/**
 * Permanently deletes a user account and all associated data.
 * This should only be called by an admin or a scheduled function.
 * @param userId The ID of the user to delete
 */
export async function permanentlyDeleteUser(userId: string) {
  try {
    // 1. Delete user data from profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (profileError) throw profileError;
    
    // 2. Delete any other related data in other tables
    // Add additional delete operations for other tables where user data is stored
    // For example:
    // await supabase.from('user_preferences').delete().eq('user_id', userId);
    // await supabase.from('user_activities').delete().eq('user_id', userId);
    
    // 3. Finally delete the user from auth.users
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    
    if (authError) throw authError;
    
    return { success: true };
  } catch (error) {
    console.error('Error permanently deleting user:', error);
    throw error;
  }
}

/**
 * This function should be run as a scheduled job (e.g., daily)
 * to permanently delete accounts that have passed their deletion date.
 * It would typically be implemented as a Supabase Edge Function or other server-side process.
 */
export async function processPendingDeletions() {
  try {
    // This would need to be run with admin privileges
    // Get all users with deletion_requested = true
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw error;
    
    const now = new Date();
    const usersToDelete = users.filter((user: any) => {
      const deletionRequested = user.user_metadata?.deletion_requested;
      const deletionDate = user.user_metadata?.deletion_date;
      
      if (!deletionRequested || !deletionDate) return false;
      
      const deleteDate = new Date(deletionDate);
      return deleteDate <= now;
    });
    
    // Process each user for deletion
    for (const user of usersToDelete) {
      await permanentlyDeleteUser(user.id);
    }
    
    return { 
      success: true, 
      deletedCount: usersToDelete.length 
    };
  } catch (error) {
    console.error('Error processing pending deletions:', error);
    throw error;
  }
}

// Note: The functions below should be implemented in a Supabase Edge Function
// and scheduled with Supabase Cron, not in the client application.
// This is for reference only.

/**
 * This function should be implemented as a Supabase Edge Function
 * and scheduled to run daily using Supabase Cron.
 * 
 * Example SQL to schedule this function:
 * 
 * SELECT cron.schedule(
 *   'process-account-deletions',
 *   '0 0 * * *', -- Run daily at midnight
 *   $$
 *   SELECT net.http_post(
 *     url:= 'https://your-project-ref.supabase.co/functions/v1/process-account-deletions',
 *     headers:= '{"Content-Type": "application/json", "Authorization": "Bearer your-service-role-key"}'::jsonb,
 *     body:= '{}'::jsonb
 *   ) as request_id;
 *   $$
 * );
 */