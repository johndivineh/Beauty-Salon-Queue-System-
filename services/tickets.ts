import { supabase } from '../src/supabaseClient';
import { QueueEntry, QueueStatus, Branch, DeleteActionType } from '../types';

export const ticketService = {
  async getAll() {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('joined_at', { ascending: true });
    if (error) throw error;
    return data.map((t: any) => ({
      id: t.id,
      queueNumber: t.queue_number,
      branch: t.branch,
      customerName: t.customer_name,
      phoneNumber: t.phone_number,
      styleId: t.style_id,
      braiderId: t.braider_id,
      size: t.size,
      length: t.length,
      preparedHair: t.prepared_hair,
      bringingOwnExtensions: t.bringing_own_extensions,
      selectedExtensions: t.selected_extensions,
      notes: t.notes,
      status: t.status,
      joinedAt: new Date(t.joined_at),
      estMinutes: t.est_minutes,
      estimatedStartTime: new Date(t.estimated_start_time),
      calledAt: t.called_at ? new Date(t.called_at) : undefined,
      checkedInAt: t.checked_in_at ? new Date(t.checked_in_at) : undefined,
      serviceStartAt: t.service_start_at ? new Date(t.service_start_at) : undefined,
      serviceEndAt: t.service_end_at ? new Date(t.service_end_at) : undefined,
      deferralCount: t.deferral_count,
      checkInCode: t.check_in_code,
      isReady: t.is_ready,
      stylistId: t.stylist_id,
      paid: t.paid,
      rating: t.rating,
      deletedAt: t.deleted_at ? new Date(t.deleted_at) : undefined,
      deletedBy: t.deleted_by,
      deleteReason: t.delete_reason,
      deletedFromStatus: t.deleted_from_status,
      deleteActionType: t.delete_action_type
    }));
  },

  async create(ticket: Omit<QueueEntry, 'id'>) {
    const { data, error } = await supabase
      .from('tickets')
      .insert([{
        customer_name: ticket.customerName,
        phone_number: ticket.phoneNumber,
        branch: ticket.branch,
        style_id: ticket.styleId,
        size: ticket.size,
        length: ticket.length,
        prepared_hair: ticket.preparedHair,
        bringing_own_extensions: ticket.bringingOwnExtensions,
        selected_extensions: ticket.selectedExtensions,
        queue_number: ticket.queueNumber,
        status: ticket.status,
        joined_at: ticket.joinedAt,
        est_minutes: ticket.estMinutes,
        estimated_start_time: ticket.estimatedStartTime,
        deferral_count: ticket.deferralCount,
        check_in_code: ticket.checkInCode,
        paid: ticket.paid,
        is_ready: ticket.isReady
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: QueueStatus, timestamps?: any) {
    const updateData: any = { status };
    if (timestamps) {
      if (timestamps.calledAt) updateData.called_at = timestamps.calledAt;
      if (timestamps.checkedInAt) updateData.checked_in_at = timestamps.checkedInAt;
      if (timestamps.serviceStartAt) updateData.service_start_at = timestamps.serviceStartAt;
      if (timestamps.serviceEndAt) updateData.service_end_at = timestamps.serviceEndAt;
    }
    const { error } = await supabase
      .from('tickets')
      .update(updateData)
      .eq('id', id);
    if (error) throw error;
  },

  async softDelete(id: string, reason: string, actionType: DeleteActionType, actor: string, status: QueueStatus, oldStatus: QueueStatus) {
    const { error } = await supabase
      .from('tickets')
      .update({
        status,
        deleted_at: new Date(),
        deleted_by: actor,
        delete_reason: reason,
        deleted_from_status: oldStatus,
        delete_action_type: actionType
      })
      .eq('id', id);
    if (error) throw error;
  },

  async resetQueue(branch: Branch, reason: string, actor: string) {
    // This is more complex, usually done via RPC or multiple updates
    // For simplicity, we'll update all active tickets for the branch
    const { error } = await supabase
      .from('tickets')
      .update({
        status: QueueStatus.CANCELLED,
        deleted_at: new Date(),
        deleted_by: actor,
        delete_reason: `Queue Reset: ${reason}`,
        delete_action_type: DeleteActionType.CANCELLED
      })
      .eq('branch', branch)
      .in('status', [QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.IN_SERVICE]);
    if (error) throw error;
  },

  async update(id: string, updates: Partial<QueueEntry>) {
    // Map camelCase to snake_case if necessary
    const { error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  }
};
