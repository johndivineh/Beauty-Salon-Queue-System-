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
    const insertData = {
      name: item.name,
      price: item.price,
      stock_count: item.stockCount,
      color: item.color,
      length: item.length,
      image: item.image
    };
    const { data, error } = await supabase
      .from('inventory_items')
      .insert([insertData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<InventoryItem>) {
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.stockCount !== undefined) updateData.stock_count = updates.stockCount;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.length !== undefined) updateData.length = updates.length;
    if (updates.image !== undefined) updateData.image = updates.image;

    const { error } = await supabase
      .from('inventory_items')
      .update(updateData)
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
