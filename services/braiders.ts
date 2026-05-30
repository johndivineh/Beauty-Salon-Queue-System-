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
    const insertData = {
      name: braider.name,
      branch: braider.branch,
      status: braider.status,
      image: braider.image,
      rating: 5.0,
      completed_jobs: 0
    };
    const { data, error } = await supabase
      .from('braiders')
      .insert([insertData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Braider>) {
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.branch) updateData.branch = updates.branch;
    if (updates.status) updateData.status = updates.status;
    if (updates.image) updateData.image = updates.image;
    if (updates.rating !== undefined) updateData.rating = updates.rating;
    if (updates.completedJobs !== undefined) updateData.completed_jobs = updates.completedJobs;

    const { error } = await supabase
      .from('braiders')
      .update(updateData)
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
