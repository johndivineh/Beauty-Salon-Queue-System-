
export enum Branch {
  MADINA = 'Madina',
  ACCRA = 'Accra'
}

export enum QueueStatus {
  WAITING = 'Waiting',
  CALLED = 'Called',
  IN_SERVICE = 'In service',
  DONE = 'Done',
  NO_SHOW = 'No-show',
  CANCELLED = 'Cancelled',
  DELETED = 'Deleted'
}

export enum DeleteActionType {
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  VOIDED = 'VOIDED',
  DUPLICATE = 'DUPLICATE',
  OTHER = 'OTHER'
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
  image?: string;
}

export interface Braider {
  id: string;
  name: string;
  branch: Branch;
  rating: number;
  completedJobs: number;
  status: 'active' | 'on-break' | 'absent';
  image?: string;
}

export interface ServiceLog {
  id: string;
  serviceNumber: string; // Sequential ID for auditing
  queueId: string;
  customerName: string;
  styleName: string;
  braiderName: string;
  amount: number;
  completedAt: Date;
  branch: Branch;
}

export interface QueueEntry {
  id: string;
  queueNumber: string;
  branch: Branch;
  customerName: string;
  phoneNumber: string;
  styleId: string;
  braiderId?: string; // Preferred braider
  size: 'Small' | 'Medium' | 'Large';
  length: string;
  preparedHair: boolean;
  bringingOwnExtensions: boolean;
  selectedExtensions?: string[];
  notes?: string;
  status: QueueStatus;
  joinedAt: Date;
  estMinutes: number;
  estimatedStartTime: Date;
  calledAt?: Date;
  checkedInAt?: Date;
  serviceStartAt?: Date;
  serviceEndAt?: Date;
  deferralCount: number;
  checkInCode: string;
  isReady?: boolean; // "On my way" toggle
  stylistId?: string; // Assigned braider (might be different from preferred)
  paid: boolean;
  rating?: number; // Customer feedback
  deletedAt?: Date;
  deletedBy?: string;
  deleteReason?: string;
  deletedFromStatus?: QueueStatus;
  deleteActionType?: DeleteActionType;
}

export enum AuditAction {
  CALL_NEXT = 'CALL_NEXT',
  START_SERVICE = 'START_SERVICE',
  MARK_DONE = 'MARK_DONE',
  DEFER = 'DEFER',
  CANCEL = 'CANCEL',
  NO_SHOW = 'NO_SHOW',
  DELETE = 'DELETE',
  RESET_QUEUE = 'RESET_QUEUE'
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  branchId: Branch;
  actor: string;
  action: AuditAction;
  ticketId?: string;
  details: string; // JSON string
}

export interface BranchData {
  id: Branch;
  phone: string;
  mapUrl: string;
  nowServing: string;
  waitTime: number; // in minutes
}
