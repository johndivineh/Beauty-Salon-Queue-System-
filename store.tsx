
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Branch, QueueEntry, Style, InventoryItem, QueueStatus } from './types';
import { INITIAL_STYLES, INITIAL_INVENTORY, INITIAL_QUEUE } from './constants';

interface AppContextType {
  styles: Style[];
  setStyles: React.Dispatch<React.SetStateAction<Style[]>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  queue: QueueEntry[];
  setQueue: React.Dispatch<React.SetStateAction<QueueEntry[]>>;
  addQueueEntry: (entry: Omit<QueueEntry, 'id' | 'queueNumber' | 'status' | 'joinedAt' | 'estimatedStartTime' | 'paid'>) => QueueEntry | null;
  updateQueueStatus: (id: string, status: QueueStatus) => void;
  deleteQueueEntry: (id: string) => void;
  addStyle: (style: Omit<Style, 'id'>) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  getBranchStatus: (branch: Branch) => { 
    nowServing: string, 
    waitTime: number, 
    peopleWaiting: number,
    isPhysicallyOpen: boolean,
    nextOpeningText: string,
    currentTime: Date
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [styles, setStyles] = useState<Style[]>(INITIAL_STYLES);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [queue, setQueue] = useState<QueueEntry[]>(INITIAL_QUEUE);
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

  const getBranchStatus = useCallback((branch: Branch) => {
    const now = new Date();
    const hours = getWorkingHoursForDate(now);
    
    const openingTime = new Date(now);
    openingTime.setHours(hours.open.h, hours.open.m, 0, 0);
    const closingTime = new Date(now);
    closingTime.setHours(hours.close.h, hours.close.m, 0, 0);

    const isPhysicallyOpen = now >= openingTime && now < closingTime;

    const activeQueue = queue
      .filter(q => q.branch === branch && (q.status === QueueStatus.WAITING || q.status === QueueStatus.ALMOST_TURN || q.status === QueueStatus.PLEASE_ARRIVE || q.status === QueueStatus.IN_SERVICE))
      .sort((a, b) => a.estimatedStartTime.getTime() - b.estimatedStartTime.getTime());

    const nowServing = queue.find(q => q.branch === branch && q.status === QueueStatus.IN_SERVICE)?.queueNumber || 'None';
    
    // Calculate wait time
    let waitTime = 0;
    if (activeQueue.length > 0) {
      const lastEntry = activeQueue[activeQueue.length - 1];
      const lastStyle = styles.find(s => s.id === lastEntry.styleId);
      const lastEndTime = new Date(lastEntry.estimatedStartTime.getTime() + (lastStyle?.durationMinutes || 120) * 60000);
      waitTime = Math.max(0, Math.ceil((lastEndTime.getTime() - now.getTime()) / 60000));
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
      currentTime: now
    };
  }, [queue, styles]);

  const addQueueEntry = (entry: Omit<QueueEntry, 'id' | 'queueNumber' | 'status' | 'joinedAt' | 'estimatedStartTime' | 'paid'>) => {
    const now = new Date();
    const selectedStyle = styles.find(s => s.id === entry.styleId);
    const styleDuration = selectedStyle?.durationMinutes || 120;

    const branchQueue = queue
      .filter(q => q.branch === entry.branch && (q.status === QueueStatus.WAITING || q.status === QueueStatus.ALMOST_TURN || q.status === QueueStatus.PLEASE_ARRIVE || q.status === QueueStatus.IN_SERVICE))
      .sort((a, b) => a.estimatedStartTime.getTime() - b.estimatedStartTime.getTime());

    let baseStartTime = now;
    if (branchQueue.length > 0) {
      const lastEntry = branchQueue[branchQueue.length - 1];
      const lastStyle = styles.find(s => s.id === lastEntry.styleId);
      baseStartTime = new Date(lastEntry.estimatedStartTime.getTime() + (lastStyle?.durationMinutes || 120) * 60000);
    }

    const estimatedStartTime = findNextValidSlot(baseStartTime, styleDuration);

    const branchCount = queue.filter(q => q.branch === entry.branch).length + 1;
    const prefix = entry.branch === Branch.MADINA ? 'MAD' : 'ACC';
    const queueNumber = `${prefix}-${branchCount.toString().padStart(3, '0')}`;
    
    const newEntry: QueueEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      queueNumber,
      status: QueueStatus.WAITING,
      joinedAt: now,
      estimatedStartTime,
      paid: false
    };

    setQueue(prev => [...prev, newEntry]);
    return newEntry;
  };

  const updateQueueStatus = (id: string, status: QueueStatus) => {
    setQueue(prev => prev.map(q => q.id === id ? { ...q, status } : q));
  };

  const deleteQueueEntry = (id: string) => {
    setQueue(prev => prev.filter(q => q.id !== id));
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

  return (
    <AppContext.Provider value={{
      styles, setStyles,
      inventory, setInventory,
      queue, setQueue,
      addQueueEntry,
      updateQueueStatus,
      deleteQueueEntry,
      addStyle,
      addInventoryItem,
      updateInventoryItem,
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
