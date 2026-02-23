import { supabase } from '../src/supabaseClient';
import { Braider } from '../types';

export const braiderService = {
  async getAll() {
    const { data, error } = await supabase
      .from('braiders')
      .select('*');
    if (error) throw error;
    return data;
  },

  async create(braider: Omit<Braider, 'id'>) {
    const { data, error } = await supabase
      .from('braiders')
      .insert([braider])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Braider>) {
    const { error } = await supabase
      .from('braiders')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('braiders')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
