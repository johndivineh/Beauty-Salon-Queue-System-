
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Branch, QueueEntry, Style, InventoryItem, QueueStatus, Braider, ServiceLog, AuditLogEntry, AuditAction, DeleteActionType } from './types';
import { INITIAL_STYLES, INITIAL_INVENTORY, INITIAL_QUEUE, INITIAL_BRAIDERS } from './constants';
import { supabase } from './src/supabaseClient';
import { ticketService } from './services/tickets';
import { inspoService } from './services/inspo';
import { braiderService } from './services/braiders';
import { inventoryService } from './services/inventory';
import { auditService } from './services/audit';
import { serviceLogService } from './services/serviceLogs';

interface AppContextType {
  styles: Style[];
  setStyles: React.Dispatch<React.SetStateAction<Style[]>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  queue: QueueEntry[];
  setQueue: React.Dispatch<React.SetStateAction<QueueEntry[]>>;
  braiders: Braider[];
  setBraiders: React.Dispatch<React.SetStateAction<Braider[]>>;
  serviceLogs: ServiceLog[];
  auditLogs: AuditLogEntry[];
  connected: boolean;
  lastFetchTime: Date | null;
  mutationStatus: 'idle' | 'loading' | 'error';
  retryFetch: () => void;
  addQueueEntry: (entry: Omit<QueueEntry, 'id' | 'queueNumber' | 'status' | 'joinedAt' | 'estimatedStartTime' | 'paid' | 'estMinutes' | 'deferralCount' | 'checkInCode'>) => Promise<QueueEntry | null>;
  updateQueueStatus: (id: string, status: QueueStatus, actor: string, timestamps?: { calledAt?: Date, checkedInAt?: Date, serviceStartAt?: Date, serviceEndAt?: Date }) => Promise<void>;
  completeService: (queueId: string, stylistId: string, amount: number, actor: string) => Promise<void>;
  softDeleteTicket: (id: string, reason: string, actionType: DeleteActionType, actor: string) => Promise<void>;
  appendAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => Promise<void>;
  resetQueue: (branch: Branch, reason: string, actor: string) => Promise<void>;
  recalculateETAs: (branch: Branch) => void;
  checkIn: (id: string, code?: string) => Promise<boolean>;
  deferTicket: (id: string, actor: string) => Promise<void>;
  toggleReady: (id: string) => Promise<void>;
  addStyle: (style: Omit<Style, 'id'>) => Promise<void>;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => Promise<void>;
  addBraider: (braider: Omit<Braider, 'id' | 'rating' | 'completedJobs'>) => Promise<void>;
  deleteBraider: (id: string) => Promise<void>;
  updateBraider: (id: string, item: Partial<Braider>) => Promise<void>;
  getBranchStatus: (branch: Branch) => { 
    nowServing: string[], 
    waitTime: number, 
    peopleWaiting: number,
    isPhysicallyOpen: boolean,
    nextOpeningText: string,
    currentTime: Date,
    lastUpdated: string
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [styles, setStyles] = useState<Style[]>(INITIAL_STYLES);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [queue, setQueue] = useState<QueueEntry[]>(INITIAL_QUEUE);
  const [braiders, setBraiders] = useState<Braider[]>(INITIAL_BRAIDERS);
  const [serviceLogs, setServiceLogs] = useState<ServiceLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [deviceTime, setDeviceTime] = useState(new Date());
  const [connected, setConnected] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [mutationStatus, setMutationStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const fetchData = useCallback(async () => {
    try {
      setMutationStatus('loading');
      const [s, i, q, b, sl, al] = await Promise.all([
        inspoService.getAll(),
        inventoryService.getAll(),
        ticketService.getAll(),
        braiderService.getAll(),
        serviceLogService.getAll(),
        auditService.getAll()
      ]);
      
      if (s.length > 0) setStyles(s);
      if (i.length > 0) setInventory(i);
      setQueue(q);
      if (b.length > 0) setBraiders(b);
      setServiceLogs(sl);
      setAuditLogs(al);
      
      setLastFetchTime(new Date());
      setConnected(true);
      setMutationStatus('idle');
    } catch (error) {
      console.error('Error fetching data:', error);
      setConnected(false);
      setMutationStatus('error');
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Realtime subscriptions
    const ticketsSubscription = supabase
      .channel('tickets-changes')
      .on('postgres_changes' as any, { event: '*', table: 'tickets' }, () => fetchData())
      .subscribe();

    const braidersSubscription = supabase
      .channel('braiders-changes')
      .on('postgres_changes' as any, { event: '*', table: 'braiders' }, () => fetchData())
      .subscribe();

    const stylesSubscription = supabase
      .channel('styles-changes')
      .on('postgres_changes' as any, { event: '*', table: 'inspo_styles' }, () => fetchData())
      .subscribe();

    const inventorySubscription = supabase
      .channel('inventory-changes')
      .on('postgres_changes' as any, { event: '*', table: 'inventory_items' }, () => fetchData())
      .subscribe();

    const auditSubscription = supabase
      .channel('audit-changes')
      .on('postgres_changes' as any, { event: '*', table: 'audit_logs' }, () => fetchData())
      .subscribe();

    // Fallback polling
    const pollInterval = setInterval(() => {
      fetchData();
    }, 15000);

    return () => {
      ticketsSubscription.unsubscribe();
      braidersSubscription.unsubscribe();
      stylesSubscription.unsubscribe();
      inventorySubscription.unsubscribe();
      auditSubscription.unsubscribe();
      clearInterval(pollInterval);
    };
  }, [fetchData]);

  const retryFetch = () => {
    fetchData();
  };

  // Keep a global clock for the app state
  useEffect(() => {
    const timer = setInterval(() => {
      setDeviceTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getWorkingHoursForDate = (date: Date) => {
    const day = date.getDay(); // 0 = Sunday, 1-6 = Mon-Sat
    if (day === 0) {
      return { open: { h: 13, m: 30 }, close: { h: 19, m: 30 }, label: 'Sunday' };
    }
    return { open: { h: 9, m: 30 }, close: { h: 18, m: 0 }, label: 'Mon-Sat' };
  };

  const findNextValidSlot = (baseTime: Date, durationMinutes: number): Date => {
    let candidate = new Date(baseTime);
    let attempts = 0;

    while (attempts < 14) { // Look up to 2 weeks out if necessary
      const hours = getWorkingHoursForDate(candidate);
      const opening = new Date(candidate);
      opening.setHours(hours.open.h, hours.open.m, 0, 0);
      const closing = new Date(candidate);
      closing.setHours(hours.close.h, hours.close.m, 0, 0);

      // If we are before today's opening, start at opening
      if (candidate < opening) {
        candidate = new Date(opening);
      }

      // If we are after today's closing or service wouldn't fit, move to tomorrow opening
      const projectedEnd = new Date(candidate.getTime() + durationMinutes * 60000);
      if (candidate >= closing || projectedEnd > closing) {
        candidate.setDate(candidate.getDate() + 1);
        const nextHours = getWorkingHoursForDate(candidate);
        candidate.setHours(nextHours.open.h, nextHours.open.m, 0, 0);
        attempts++;
        continue;
      }

      // Found a slot that fits in today's working window
      return candidate;
    }
    return candidate;
  };

  const calculateEstMinutes = (styleId: string, size: string, length: string, preparedHair: boolean) => {
    const style = styles.find(s => s.id === styleId);
    let base = 120; // Default
    
    if (style) {
      const name = style.name.toUpperCase();
      if (name.includes('CORNROWS')) base = 60;
      else if (name.includes('STITCH')) base = 120;
      else if (name.includes('GHANA')) base = 150;
      else if (name.includes('KNOTLESS')) base = 240;
      else if (name.includes('BOX')) base = 210;
      else if (name.includes('FULANI')) base = 210;
      else if (name.includes('GODDESS')) base = 180;
    }

    let modifier = 0;
    if (size === 'Small') modifier += 120;
    else if (size === 'Medium') modifier += 60;

    if (length === 'Long') modifier += 60;
    else if (length === 'Medium') modifier += 30;

    if (!preparedHair) modifier += 30;

    return Math.min(540, Math.max(30, base + modifier));
  };

  const runSimulation = useCallback((currentQueue: QueueEntry[], branch: Branch) => {
    const now = new Date();
    const chairs = 4;
    const buffer = 15;
    const chairAvailableAt = new Array(chairs).fill(now.getTime());

    const branchQueue = currentQueue
      .filter(q => q.branch === branch && [QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.IN_SERVICE].includes(q.status))
      .sort((a, b) => {
        // Order: IN_SERVICE first
        if (a.status === QueueStatus.IN_SERVICE && b.status !== QueueStatus.IN_SERVICE) return -1;
        if (a.status !== QueueStatus.IN_SERVICE && b.status === QueueStatus.IN_SERVICE) return 1;

        // Among CALLED/WAITING, prioritize checked-in
        if (a.checkedInAt && !b.checkedInAt) return -1;
        if (!a.checkedInAt && b.checkedInAt) return 1;

        // Then CALLED before WAITING
        if (a.status === QueueStatus.CALLED && b.status === QueueStatus.WAITING) return -1;
        if (a.status === QueueStatus.WAITING && b.status === QueueStatus.CALLED) return 1;

        // Finally FIFO by joinedAt
        return a.joinedAt.getTime() - b.joinedAt.getTime();
      });

    const updatedQueue = [...currentQueue];

    // 1. Handle IN_SERVICE tickets
    const inService = branchQueue.filter(q => q.status === QueueStatus.IN_SERVICE);
    inService.forEach((q, i) => {
      const chairIdx = i % chairs;
      const start = q.serviceStartAt ? new Date(q.serviceStartAt).getTime() : now.getTime();
      const end = start + q.estMinutes * 60000;
      const remaining = Math.max(5 * 60000, end - now.getTime());
      chairAvailableAt[chairIdx] = now.getTime() + remaining + buffer * 60000;
    });

    // 2. Handle CALLED and WAITING tickets
    const remainingTickets = branchQueue.filter(q => q.status !== QueueStatus.IN_SERVICE);
    remainingTickets.forEach(q => {
      // Find earliest chair
      let earliestIdx = 0;
      for (let i = 1; i < chairs; i++) {
        if (chairAvailableAt[i] < chairAvailableAt[earliestIdx]) {
          earliestIdx = i;
        }
      }

      const predictedStart = findNextValidSlot(new Date(chairAvailableAt[earliestIdx]), q.estMinutes);
      const predictedEnd = new Date(predictedStart.getTime() + (q.estMinutes + buffer) * 60000);
      chairAvailableAt[earliestIdx] = predictedEnd.getTime();

      // Update the ticket in the updatedQueue
      const idx = updatedQueue.findIndex(item => item.id === q.id);
      if (idx !== -1) {
        updatedQueue[idx] = { ...updatedQueue[idx], estimatedStartTime: predictedStart };
      }
    });

    return updatedQueue;
  }, []);

  const recalculateETAs = useCallback(async (branch: Branch) => {
    const updated = runSimulation(queue, branch);
    // In a real app, we might want to batch update these in Supabase
    // For now, we'll just update them locally and let the next mutation sync them
    setQueue(updated);
  }, [runSimulation, queue]);

  const getBranchStatus = useCallback((branch: Branch) => {
    const now = new Date();
    const hours = getWorkingHoursForDate(now);
    
    const openingTime = new Date(now);
    openingTime.setHours(hours.open.h, hours.open.m, 0, 0);
    const closingTime = new Date(now);
    closingTime.setHours(hours.close.h, hours.close.m, 0, 0);

    const isPhysicallyOpen = now >= openingTime && now < closingTime;

    const activeQueue = queue
      .filter(q => q.branch === branch && [QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.IN_SERVICE].includes(q.status))
      .sort((a, b) => a.estimatedStartTime.getTime() - b.estimatedStartTime.getTime());

    const nowServing = queue
      .filter(q => q.branch === branch && q.status === QueueStatus.IN_SERVICE)
      .map(q => q.queueNumber);
    
    // Calculate wait time (for the next person joining)
    const simulationResult = runSimulation(queue, branch);
    const chairs = 4;
    const buffer = 15;
    const chairAvailableAt = new Array(chairs).fill(now.getTime());
    
    const branchActive = simulationResult.filter(q => q.branch === branch && [QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.IN_SERVICE].includes(q.status));
    
    let waitTime = 0;
    if (branchActive.length > 0) {
      const chairTimes = new Array(chairs).fill(now.getTime());
      branchActive.forEach(q => {
        let earliest = 0;
        for(let i=1; i<chairs; i++) if(chairTimes[i] < chairTimes[earliest]) earliest = i;
        const start = Math.max(chairTimes[earliest], q.status === QueueStatus.IN_SERVICE ? (q.serviceStartAt ? new Date(q.serviceStartAt).getTime() : now.getTime()) : now.getTime());
        chairTimes[earliest] = start + (q.estMinutes + buffer) * 60000;
      });
      const nextAvailable = Math.min(...chairTimes);
      waitTime = Math.max(0, Math.ceil((nextAvailable - now.getTime()) / 60000));
    }

    let nextOpeningText = "";
    if (!isPhysicallyOpen) {
      if (now < openingTime) {
        nextOpeningText = `Opening today at ${openingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextHours = getWorkingHoursForDate(tomorrow);
        nextOpeningText = `Opening tomorrow at ${nextHours.open.h}:${nextHours.open.m === 0 ? '00' : nextHours.open.m}am`;
      }
    }

    return {
      nowServing,
      waitTime,
      peopleWaiting: activeQueue.length,
      isPhysicallyOpen,
      nextOpeningText,
      currentTime: now,
      lastUpdated: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  }, [queue, runSimulation]);

  const addQueueEntry = async (entry: Omit<QueueEntry, 'id' | 'queueNumber' | 'status' | 'joinedAt' | 'estimatedStartTime' | 'paid' | 'estMinutes'>) => {
    const now = new Date();
    const estMinutes = calculateEstMinutes(entry.styleId, entry.size, entry.length, entry.preparedHair);

    const branchCount = queue.filter(q => q.branch === entry.branch).length + 1;
    const prefix = entry.branch === Branch.MADINA ? 'MAD' : 'ACC';
    const queueNumber = `${prefix}-${branchCount.toString().padStart(3, '0')}`;
    
    const newEntry: Omit<QueueEntry, 'id'> = {
      ...entry,
      queueNumber,
      status: QueueStatus.WAITING,
      joinedAt: now,
      estMinutes,
      estimatedStartTime: now, // Will be updated by simulation
      deferralCount: 0,
      checkInCode: Math.floor(1000 + Math.random() * 9000).toString(),
      paid: false
    };

    try {
      setMutationStatus('loading');
      const created = await ticketService.create(newEntry);
      setMutationStatus('idle');
      return created;
    } catch (error) {
      console.error('Error adding queue entry:', error);
      setMutationStatus('error');
      return null;
    }
  };

  const appendAuditLog = useCallback(async (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    try {
      await auditService.append(entry);
    } catch (error) {
      console.error('Error appending audit log:', error);
    }
  }, []);

  const updateQueueStatus = async (id: string, status: QueueStatus, actor: string, timestamps?: { calledAt?: Date, checkedInAt?: Date, serviceStartAt?: Date, serviceEndAt?: Date }) => {
    const entry = queue.find(q => q.id === id);
    if (!entry) return;
    
    const oldStatus = entry.status;

    // Audit log
    let action = AuditAction.CALL_NEXT;
    if (status === QueueStatus.IN_SERVICE) action = AuditAction.START_SERVICE;
    if (status === QueueStatus.DONE) action = AuditAction.MARK_DONE;
    if (status === QueueStatus.NO_SHOW) action = AuditAction.NO_SHOW;
    if (status === QueueStatus.CANCELLED) action = AuditAction.CANCEL;

    try {
      setMutationStatus('loading');
      await Promise.all([
        ticketService.updateStatus(id, status, timestamps),
        appendAuditLog({
          branchId: entry.branch,
          actor,
          action,
          ticketId: id,
          details: `Status changed from ${oldStatus} to ${status}`
        })
      ]);
      setMutationStatus('idle');
    } catch (error) {
      console.error('Error updating queue status:', error);
      setMutationStatus('error');
    }
  };

  const checkIn = async (id: string, code?: string) => {
    const entry = queue.find(q => q.id === id);
    if (!entry) return false;
    if (code && entry.checkInCode !== code) return false;

    try {
      setMutationStatus('loading');
      await ticketService.update(id, { checkedInAt: new Date() });
      setMutationStatus('idle');
      return true;
    } catch (error) {
      console.error('Error checking in:', error);
      setMutationStatus('error');
      return false;
    }
  };

  const deferTicket = async (id: string, actor: string) => {
    const entry = queue.find(q => q.id === id);
    if (!entry) return;

    const oldStatus = entry.status;
    
    try {
      setMutationStatus('loading');
      await Promise.all([
        ticketService.update(id, {
          status: QueueStatus.WAITING,
          deferralCount: entry.deferralCount + 1,
          joinedAt: new Date(),
          calledAt: undefined,
          checkedInAt: undefined
        }),
        appendAuditLog({
          branchId: entry.branch,
          actor,
          action: AuditAction.DEFER,
          ticketId: id,
          details: `Ticket deferred. New deferral count: ${entry.deferralCount + 1}`
        })
      ]);
      setMutationStatus('idle');
    } catch (error) {
      console.error('Error deferring ticket:', error);
      setMutationStatus('error');
    }
  };

  const toggleReady = async (id: string) => {
    const entry = queue.find(q => q.id === id);
    if (!entry) return;
    try {
      await ticketService.update(id, { isReady: !entry.isReady });
    } catch (error) {
      console.error('Error toggling ready:', error);
    }
  };

  const completeService = async (queueId: string, stylistId: string, amount: number, actor: string) => {
    const entry = queue.find(q => q.id === queueId);
    const braider = braiders.find(b => b.id === stylistId);
    const style = styles.find(s => s.id === entry?.styleId);

    if (!entry || !braider || !style) return;

    const serviceNumber = `SRV-${(serviceLogs.length + 1).toString().padStart(5, '0')}`;
    const newLog: Omit<ServiceLog, 'id'> = {
      serviceNumber,
      queueId,
      customerName: entry.customerName,
      styleName: style.name,
      braiderName: braider.name,
      amount,
      completedAt: new Date(),
      branch: entry.branch
    };

    try {
      setMutationStatus('loading');
      await Promise.all([
        serviceLogService.create(newLog),
        braiderService.update(stylistId, { completedJobs: braider.completedJobs + 1 }),
        updateQueueStatus(queueId, QueueStatus.DONE, actor, { serviceEndAt: new Date() }),
        ticketService.update(queueId, { stylistId, paid: true })
      ]);
      setMutationStatus('idle');
    } catch (error) {
      console.error('Error completing service:', error);
      setMutationStatus('error');
    }
  };

  const softDeleteTicket = async (id: string, reason: string, actionType: DeleteActionType, actor: string) => {
    const entry = queue.find(q => q.id === id);
    if (!entry) return;

    const oldStatus = entry.status;
    let newStatus = QueueStatus.DELETED;
    let auditAction = AuditAction.DELETE;

    if (actionType === DeleteActionType.CANCELLED) {
      newStatus = QueueStatus.CANCELLED;
      auditAction = AuditAction.CANCEL;
    } else if (actionType === DeleteActionType.NO_SHOW) {
      newStatus = QueueStatus.NO_SHOW;
      auditAction = AuditAction.NO_SHOW;
    }

    try {
      setMutationStatus('loading');
      await ticketService.softDelete(id, reason, actionType, actor, newStatus, oldStatus);
      await appendAuditLog({
        branchId: entry.branch,
        actor,
        action: auditAction,
        ticketId: id,
        details: reason
      });
      setMutationStatus('idle');
    } catch (error) {
      console.error('Error soft deleting ticket:', error);
      setMutationStatus('error');
    }
  };

  const resetQueue = async (branch: Branch, reason: string, actor: string) => {
    try {
      setMutationStatus('loading');
      await ticketService.resetQueue(branch, reason, actor);
      await appendAuditLog({
        branchId: branch,
        actor,
        action: AuditAction.RESET_QUEUE,
        details: `Reason: ${reason}`
      });
      setMutationStatus('idle');
    } catch (error) {
      console.error('Error resetting queue:', error);
      setMutationStatus('error');
    }
  };

  const addStyle = async (style: Omit<Style, 'id'>) => {
    try {
      setMutationStatus('loading');
      await inspoService.create(style);
      setMutationStatus('idle');
    } catch (error) {
      console.error('Error adding style:', error);
      setMutationStatus('error');
    }
  };

  const addInventoryItem = async (item: Omit<InventoryItem, 'id'>) => {
    try {
      setMutationStatus('loading');
      await inventoryService.create(item);
      setMutationStatus('idle');
    } catch (error) {
      console.error('Error adding inventory item:', error);
      setMutationStatus('error');
    }
  };

  const updateInventoryItem = async (id: string, item: Partial<InventoryItem>) => {
    try {
      setMutationStatus('loading');
      await inventoryService.update(id, item);
      setMutationStatus('idle');
    } catch (error) {
      console.error('Error updating inventory item:', error);
      setMutationStatus('error');
    }
  };

  const addBraider = async (braider: Omit<Braider, 'id' | 'rating' | 'completedJobs'>) => {
    const newBraider: Omit<Braider, 'id'> = {
      ...braider,
      rating: 5.0,
      completedJobs: 0
    };
    try {
      setMutationStatus('loading');
      await braiderService.create(newBraider);
      setMutationStatus('idle');
    } catch (error) {
      console.error('Error adding braider:', error);
      setMutationStatus('error');
    }
  };

  const deleteBraider = async (id: string) => {
    try {
      setMutationStatus('loading');
      await braiderService.delete(id);
      setMutationStatus('idle');
    } catch (error) {
      console.error('Error deleting braider:', error);
      setMutationStatus('error');
    }
  };

  const updateBraider = async (id: string, item: Partial<Braider>) => {
    try {
      setMutationStatus('loading');
      await braiderService.update(id, item);
      setMutationStatus('idle');
    } catch (error) {
      console.error('Error updating braider:', error);
      setMutationStatus('error');
    }
  };

  return (
    <AppContext.Provider value={{
      styles, setStyles,
      inventory, setInventory,
      queue, setQueue,
      braiders, setBraiders,
      serviceLogs,
      auditLogs,
      connected,
      lastFetchTime,
      mutationStatus,
      retryFetch,
      addQueueEntry,
      updateQueueStatus,
      completeService,
      softDeleteTicket,
      appendAuditLog,
      resetQueue,
      recalculateETAs,
      checkIn,
      deferTicket,
      toggleReady,
      addStyle,
      addInventoryItem,
      updateInventoryItem,
      addBraider,
      deleteBraider,
      updateBraider,
      getBranchStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
