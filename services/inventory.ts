import { supabase } from '../src/supabaseClient';
import { InventoryItem } from '../types';

export const inventoryService = {
  async getAll() {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*');
    if (error) throw error;
    return data;
  },

  async create(item: Omit<InventoryItem, 'id'>) {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert([item])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<InventoryItem>) {
    const { error } = await supabase
      .from('inventory_items')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
