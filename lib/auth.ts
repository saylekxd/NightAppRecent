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