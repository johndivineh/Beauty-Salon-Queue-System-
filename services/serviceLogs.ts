import { supabase } from '../src/supabaseClient';
import { ServiceLog } from '../types';

export const serviceLogService = {
  async getAll() {
    const { data, error } = await supabase
      .from('service_logs')
      .select('*')
      .order('completed_at', { ascending: false });
    if (error) throw error;
    return data.map((l: any) => ({
      id: l.id,
      serviceNumber: l.service_number,
      queueId: l.queue_id,
      customerName: l.customer_name,
      styleName: l.style_name,
      braiderName: l.braider_name,
      amount: l.amount,
      completedAt: new Date(l.completed_at),
      branch: l.branch
    }));
  },

  async create(log: Omit<ServiceLog, 'id'>) {
    const { data, error } = await supabase
      .from('service_logs')
      .insert([{
        service_number: log.serviceNumber,
        queue_id: log.queueId,
        customer_name: log.customerName,
        style_name: log.styleName,
        braider_name: log.braiderName,
        amount: log.amount,
        completed_at: log.completedAt,
        branch: log.branch
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
