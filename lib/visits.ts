import { supabase } from './supabase';

export interface Visit {
  id: string;
  user_id: string;
  check_in: string;
  check_out: string | null;
  created_at: string;
}

export async function createVisit() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .rpc('create_visit', { p_user_id: user.id });

  if (error) throw error;
  return data;
}

export async function completeVisit(visitId: string) {
  const { error } = await supabase
    .rpc('complete_visit', { p_visit_id: visitId });

  if (error) throw error;
}

export async function getVisitHistory() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('user_id', user.id)
    .order('check_in', { ascending: false });

  if (error) throw error;
  return data as Visit[];
}

export async function getCurrentVisit() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('user_id', user.id)
    .is('check_out', null)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as Visit | null;
}