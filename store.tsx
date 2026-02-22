
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Branch, QueueEntry, Style, InventoryItem, QueueStatus, Braider, ServiceLog, AuditLogEntry, AuditAction, DeleteActionType } from './types';
import { INITIAL_STYLES, INITIAL_INVENTORY, INITIAL_QUEUE, INITIAL_BRAIDERS } from './constants';

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
  addQueueEntry: (entry: Omit<QueueEntry, 'id' | 'queueNumber' | 'status' | 'joinedAt' | 'estimatedStartTime' | 'paid' | 'estMinutes' | 'deferralCount' | 'checkInCode'>) => QueueEntry | null;
  updateQueueStatus: (id: string, status: QueueStatus, actor: string, timestamps?: { calledAt?: Date, checkedInAt?: Date, serviceStartAt?: Date, serviceEndAt?: Date }) => void;
  completeService: (queueId: string, stylistId: string, amount: number, actor: string) => void;
  softDeleteTicket: (id: string, reason: string, actionType: DeleteActionType, actor: string) => void;
  appendAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  resetQueue: (branch: Branch, reason: string, actor: string) => void;
  recalculateETAs: (branch: Branch) => void;
  checkIn: (id: string, code?: string) => boolean;
  deferTicket: (id: string) => void;
  toggleReady: (id: string) => void;
  addStyle: (style: Omit<Style, 'id'>) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  addBraider: (braider: Omit<Braider, 'id' | 'rating' | 'completedJobs'>) => void;
  deleteBraider: (id: string) => void;
  updateBraider: (id: string, item: Partial<Braider>) => void;
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

  const recalculateETAs = useCallback((branch: Branch) => {
    setQueue(prev => runSimulation(prev, branch));
  }, [runSimulation]);

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

  const addQueueEntry = (entry: Omit<QueueEntry, 'id' | 'queueNumber' | 'status' | 'joinedAt' | 'estimatedStartTime' | 'paid' | 'estMinutes'>) => {
    const now = new Date();
    const estMinutes = calculateEstMinutes(entry.styleId, entry.size, entry.length, entry.preparedHair);

    const branchCount = queue.filter(q => q.branch === entry.branch).length + 1;
    const prefix = entry.branch === Branch.MADINA ? 'MAD' : 'ACC';
    const queueNumber = `${prefix}-${branchCount.toString().padStart(3, '0')}`;
    
    const newEntry: QueueEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      queueNumber,
      status: QueueStatus.WAITING,
      joinedAt: now,
      estMinutes,
      estimatedStartTime: now, // Will be updated by simulation
      deferralCount: 0,
      checkInCode: Math.floor(1000 + Math.random() * 9000).toString(),
      paid: false
    };

    setQueue(prev => {
      const nextQueue = [...prev, newEntry];
      return runSimulation(nextQueue, entry.branch);
    });
    return newEntry;
  };

  const appendAuditLog = useCallback((entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };
    setAuditLogs(prev => [...prev, newEntry]);
  }, []);

  const updateQueueStatus = (id: string, status: QueueStatus, actor: string, timestamps?: { calledAt?: Date, checkedInAt?: Date, serviceStartAt?: Date, serviceEndAt?: Date }) => {
    setQueue(prev => {
      const entry = prev.find(q => q.id === id);
      if (!entry) return prev;
      
      const oldStatus = entry.status;
      const updated = prev.map(q => q.id === id ? { ...q, status, ...timestamps } : q);

      // Audit log
      let action = AuditAction.CALL_NEXT;
      if (status === QueueStatus.IN_SERVICE) action = AuditAction.START_SERVICE;
      if (status === QueueStatus.DONE) action = AuditAction.MARK_DONE;
      if (status === QueueStatus.NO_SHOW) action = AuditAction.NO_SHOW;
      if (status === QueueStatus.CANCELLED) action = AuditAction.CANCEL;

      appendAuditLog({
        branchId: entry.branch,
        actor,
        action,
        ticketId: id,
        details: JSON.stringify({ previousStatus: oldStatus, newStatus: status })
      });

      return runSimulation(updated, entry.branch);
    });
  };

  const checkIn = (id: string, code?: string) => {
    const entry = queue.find(q => q.id === id);
    if (!entry) return false;
    if (code && entry.checkInCode !== code) return false;

    setQueue(prev => {
      const updated = prev.map(q => q.id === id ? { ...q, checkedInAt: new Date() } : q);
      return runSimulation(updated, entry.branch);
    });
    return true;
  };

  const deferTicket = (id: string) => {
    setQueue(prev => {
      const entry = prev.find(q => q.id === id);
      if (!entry) return prev;

      const updated = prev.map(q => {
        if (q.id === id) {
          return {
            ...q,
            status: QueueStatus.WAITING,
            deferralCount: q.deferralCount + 1,
            joinedAt: new Date(), // Move to end of FIFO
            calledAt: undefined,
            checkedInAt: undefined
          };
        }
        return q;
      });
      return runSimulation(updated, entry.branch);
    });
  };

  const toggleReady = (id: string) => {
    setQueue(prev => {
      const entry = prev.find(q => q.id === id);
      if (!entry) return prev;
      return prev.map(q => q.id === id ? { ...q, isReady: !q.isReady } : q);
    });
  };

  const completeService = (queueId: string, stylistId: string, amount: number, actor: string) => {
    const entry = queue.find(q => q.id === queueId);
    const braider = braiders.find(b => b.id === stylistId);
    const style = styles.find(s => s.id === entry?.styleId);

    if (!entry || !braider || !style) return;

    // 1. Create Service Log (Auditing)
    const serviceNumber = `SRV-${(serviceLogs.length + 1).toString().padStart(5, '0')}`;
    const newLog: ServiceLog = {
      id: Math.random().toString(36).substr(2, 9),
      serviceNumber,
      queueId,
      customerName: entry.customerName,
      styleName: style.name,
      braiderName: braider.name,
      amount,
      completedAt: new Date(),
      branch: entry.branch
    };

    setServiceLogs(prev => [...prev, newLog]);

    // 2. Update Braider Stats
    setBraiders(prev => prev.map(b => b.id === stylistId ? { ...b, completedJobs: b.completedJobs + 1 } : b));

    // 3. Update Queue Status
    updateQueueStatus(queueId, QueueStatus.DONE, actor, { serviceEndAt: new Date() });
    setQueue(prev => prev.map(q => q.id === queueId ? { ...q, stylistId, paid: true } : q));
  };

  const softDeleteTicket = (id: string, reason: string, actionType: DeleteActionType, actor: string) => {
    setQueue(prev => {
      const entry = prev.find(q => q.id === id);
      if (!entry) return prev;

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

      const updated = prev.map(q => {
        if (q.id === id) {
          return {
            ...q,
            status: newStatus,
            deletedAt: new Date(),
            deletedBy: actor,
            deleteReason: reason,
            deletedFromStatus: oldStatus,
            deleteActionType: actionType
          };
        }
        return q;
      });

      appendAuditLog({
        branchId: entry.branch,
        actor,
        action: auditAction,
        ticketId: id,
        details: JSON.stringify({ previousStatus: oldStatus, newStatus, reason, actionType })
      });

      return runSimulation(updated, entry.branch);
    });
  };

  const resetQueue = (branch: Branch, reason: string, actor: string) => {
    setQueue(prev => {
      const activeTickets = prev.filter(q => 
        q.branch === branch && 
        [QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.IN_SERVICE].includes(q.status)
      );

      const updated = prev.map(q => {
        if (q.branch === branch && [QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.IN_SERVICE].includes(q.status)) {
          return {
            ...q,
            status: QueueStatus.CANCELLED,
            deletedAt: new Date(),
            deletedBy: actor,
            deleteReason: `Queue Reset: ${reason}`,
            deletedFromStatus: q.status,
            deleteActionType: DeleteActionType.CANCELLED
          };
        }
        return q;
      });

      appendAuditLog({
        branchId: branch,
        actor,
        action: AuditAction.RESET_QUEUE,
        details: JSON.stringify({ reason, affectedTicketsCount: activeTickets.length })
      });

      return runSimulation(updated, branch);
    });
  };

  const addStyle = (style: Omit<Style, 'id'>) => {
    const newStyle: Style = {
      ...style,
      id: `s${styles.length + 1 + Math.floor(Math.random() * 1000)}`
    };
    setStyles(prev => [...prev, newStyle]);
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `i${inventory.length + 1 + Math.floor(Math.random() * 1000)}`
    };
    setInventory(prev => [...prev, newItem]);
  };

  const updateInventoryItem = (id: string, item: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(i => i.id === id ? { ...i, ...item } : i));
  };

  const addBraider = (braider: Omit<Braider, 'id' | 'rating' | 'completedJobs'>) => {
    const newBraider: Braider = {
      ...braider,
      id: `b${braiders.length + 1 + Math.floor(Math.random() * 1000)}`,
      rating: 5.0,
      completedJobs: 0
    };
    setBraiders(prev => [...prev, newBraider]);
  };

  const deleteBraider = (id: string) => {
    setBraiders(prev => prev.filter(b => b.id !== id));
  };

  const updateBraider = (id: string, item: Partial<Braider>) => {
    setBraiders(prev => prev.map(b => b.id === id ? { ...b, ...item } : b));
  };

  return (
    <AppContext.Provider value={{
      styles, setStyles,
      inventory, setInventory,
      queue, setQueue,
      braiders, setBraiders,
      serviceLogs,
      auditLogs,
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
