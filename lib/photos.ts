import { supabase } from './supabase';

export interface Photo {
  id: string;
  url: string;
  title: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Fetches all active promotion photos from the database
 */
export async function getPromotionPhotos() {
  const { data, error } = await supabase
    .from('photo')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Photo[];
}

/**
 * Fetches a single promotion photo by ID
 */
export async function getPhotoById(id: string) {
  const { data, error } = await supabase
    .from('photo')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Photo;
} 