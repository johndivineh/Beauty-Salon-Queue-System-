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
    const insertData = {
      name: style.name,
      category: style.category,
      description: style.description,
      price_range: style.priceRange,
      base_price: style.basePrice,
      duration_minutes: style.durationMinutes,
      images: style.images,
      featured: style.featured,
      trending: style.trending,
      recommended_extensions: style.recommendedExtensions,
      hidden: style.hidden
    };
    const { data, error } = await supabase
      .from('inspo_styles')
      .insert([insertData])
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
  },

  async update(id: string, updates: Partial<Style>) {
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.category) updateData.category = updates.category;
    if (updates.description) updateData.description = updates.description;
    if (updates.priceRange) updateData.price_range = updates.priceRange;
    if (updates.basePrice !== undefined) updateData.base_price = updates.basePrice;
    if (updates.durationMinutes !== undefined) updateData.duration_minutes = updates.durationMinutes;
    if (updates.images) updateData.images = updates.images;
    if (updates.featured !== undefined) updateData.featured = updates.featured;
    if (updates.trending !== undefined) updateData.trending = updates.trending;
    if (updates.recommendedExtensions !== undefined) updateData.recommended_extensions = updates.recommendedExtensions;
    if (updates.hidden !== undefined) updateData.hidden = updates.hidden;

    const { error } = await supabase
      .from('inspo_styles')
      .update(updateData)
      .eq('id', id);
    if (error) throw error;
  }
};
