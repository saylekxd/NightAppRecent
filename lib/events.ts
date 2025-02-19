import { supabase } from './supabase';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  image_url: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function getUpcomingEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_active', true)
    .gte('date', new Date().toISOString())
    .order('date', { ascending: true })
    .limit(5);

  if (error) throw error;
  return data as Event[];
}

export async function getAllEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  if (error) throw error;
  return data as Event[];
}

export async function createEvent(event: Partial<Event>) {
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single();

  if (error) throw error;
  return data as Event;
}

export async function updateEvent(id: string, updates: Partial<Event>) {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Event;
}

export async function deleteEvent(id: string) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) throw error;
}