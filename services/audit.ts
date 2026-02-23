import { supabase } from '../src/supabaseClient';
import { AuditLogEntry } from '../types';

export const auditService = {
  async getAll() {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false });
    if (error) throw error;
    return data.map((l: any) => ({
      id: l.id,
      timestamp: new Date(l.timestamp),
      branchId: l.branch_id,
      actor: l.actor,
      action: l.action,
      ticketId: l.ticket_id,
      details: l.details
    }));
  },

  async append(log: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert([{
        branch_id: log.branchId,
        actor: log.actor,
        action: log.action,
        ticket_id: log.ticketId,
        details: log.details
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
