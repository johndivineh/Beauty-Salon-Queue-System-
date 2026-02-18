
export enum Branch {
  MADINA = 'Madina',
  ACCRA = 'Accra'
}

export enum QueueStatus {
  WAITING = 'Waiting',
  ALMOST_TURN = 'Almost your turn',
  PLEASE_ARRIVE = 'Please arrive',
  IN_SERVICE = 'In service',
  COMPLETED = 'Completed',
  NO_SHOW = 'No-show'
}

export enum ExtensionToggle {
  YES = 'Yes',
  NO = 'No'
}

export interface Style {
  id: string;
  name: string;
  category: string;
  description: string;
  priceRange: string;
  basePrice: number;
  durationMinutes: number;
  images: string[];
  featured: boolean;
  trending: boolean;
  recommendedExtensions: string;
  hidden: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  price: number;
  stockCount: number;
  color?: string;
  length?: string;
}

export interface QueueEntry {
  id: string;
  queueNumber: string;
  branch: Branch;
  customerName: string;
  phoneNumber: string;
  styleId: string;
  length: string;
  bringingOwnExtensions: boolean;
  selectedExtensions?: string[];
  notes?: string;
  status: QueueStatus;
  joinedAt: Date;
  estimatedStartTime: Date;
  stylistId?: string;
  paid: boolean;
}

export interface BranchData {
  id: Branch;
  phone: string;
  mapUrl: string;
  nowServing: string;
  waitTime: number; // in minutes
}
