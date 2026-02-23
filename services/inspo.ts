import { supabase } from '../src/supabaseClient';
import { Style } from '../types';

export const inspoService = {
  async getAll() {
    const { data, error } = await supabase
      .from('inspo_styles')
      .select('*');
    if (error) throw error;
    return data;
  },

  async create(style: Omit<Style, 'id'>) {
    const { data, error } = await supabase
      .from('inspo_styles')
      .insert([style])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('inspo_styles')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
