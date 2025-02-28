import { supabase } from './supabase';

export interface MenuItem {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
  ingredients: string[];
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export async function getMenuItems(categoryName?: 'Drinki' | 'Shoty'): Promise<MenuItem[]> {
  try {
    let query = supabase
      .from('menu_items')
      .select(`
        *,
        menu_categories!inner(*)
      `)
      .eq('is_available', true);

    if (categoryName) {
      query = query.eq('menu_categories.name', categoryName);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching menu items:', error);
      throw new Error('Failed to fetch menu items');
    }

    return data.map(item => ({
      ...item,
      price: parseFloat(item.price)
    }));
  } catch (error) {
    console.error('Error in getMenuItems:', error);
    throw error;
  }
}

export async function getMenuCategories(): Promise<MenuCategory[]> {
  try {
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .order('id');

    if (error) {
      console.error('Error fetching menu categories:', error);
      throw new Error('Failed to fetch menu categories');
    }

    return data;
  } catch (error) {
    console.error('Error in getMenuCategories:', error);
    throw error;
  }
}

export async function updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating menu item:', error);
      throw new Error('Failed to update menu item');
    }

    return {
      ...data,
      price: parseFloat(data.price)
    };
  } catch (error) {
    console.error('Error in updateMenuItem:', error);
    throw error;
  }
}

export async function createMenuItem(item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItem> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .insert(item)
      .select()
      .single();

    if (error) {
      console.error('Error creating menu item:', error);
      throw new Error('Failed to create menu item');
    }

    return {
      ...data,
      price: parseFloat(data.price)
    };
  } catch (error) {
    console.error('Error in createMenuItem:', error);
    throw error;
  }
}

export async function deleteMenuItem(id: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting menu item:', error);
      throw new Error('Failed to delete menu item');
    }
  } catch (error) {
    console.error('Error in deleteMenuItem:', error);
    throw error;
  }
} 