
import { Branch, Style, InventoryItem, QueueStatus, QueueEntry } from './types';

export const BRAND_NAME = "The Northern Braids Bar";
export const INSTAGRAM_HANDLE = "thenorthernbraidsbar_";
export const OPENING_HOURS = {
  monSat: "9:30am – 6:00pm",
  sun: "1:30pm – 7:30pm"
};

export const CONTACT_NUMBERS = ["0598911140", "0594808091", "0207913529"];

export const CATEGORIES = [
  'Knotless', 'Box Braids', 'Cornrows', 'Twists', 'Lemonade Braids', 'Fulani/Tribal', 'Faux Locs', 'Boho Braids'
];

export const INITIAL_STYLES: Style[] = [
  {
    id: 's1',
    name: 'Classic Knotless Braids',
    category: 'Knotless',
    description: 'Beautiful, weightless knotless braids for a natural look.',
    priceRange: 'GHS 400 - 800',
    basePrice: 400,
    durationMinutes: 240,
    images: ['https://www.loxxofhair.com/cdn/shop/files/braids_-knotless.png?v=1724867572&width=1500'],
    featured: true,
    trending: true,
    recommendedExtensions: '3 packs of X-pression',
    hidden: false
  },
  {
    id: 's2',
    name: 'Boho Goddess Braids',
    category: 'Boho Braids',
    description: 'Knotless braids with curly ends for that vacation vibe.',
    priceRange: 'GHS 550 - 1000',
    basePrice: 550,
    durationMinutes: 300,
    images: ['https://foshair.se/cdn/shop/files/boho-1-of-1.jpg?v=1755715422&width=3840'],
    featured: true,
    trending: false,
    recommendedExtensions: '4 packs of X-pression + 2 packs Freetress Curly',
    hidden: false
  },
  {
    id: 's3',
    name: 'Fulani Tribal Feed-ins',
    category: 'Fulani/Tribal',
    description: 'Authentic tribal patterns with beads and rings.',
    priceRange: 'GHS 350 - 600',
    basePrice: 350,
    durationMinutes: 180,
    images: ['https://afrochicbeauty.com/wp-content/uploads/2024/07/fulani-braids-curls1-2.jpg'],
    featured: false,
    trending: true,
    recommendedExtensions: '2 packs of pre-stretched extensions',
    hidden: false
  },
  {
    id: 's4',
    name: 'Classic Lemonade Braids',
    category: 'Lemonade Braids',
    description: 'Elegant side-swept braids that curve around the head, inspired by the iconic style.',
    priceRange: 'GHS 350 - 650',
    basePrice: 350,
    durationMinutes: 180,
    images: ['https://ima.nadula.com/ol/media/wysiwyg/nadula_2022/blog/Small_Lemonade_Braids.jpg'],
    featured: false,
    trending: true,
    recommendedExtensions: '2-3 packs of pre-stretched extensions',
    hidden: false
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'X-pression Pre-stretched #1', price: 45, stockCount: 50, color: '#1' },
  { id: 'i2', name: 'X-pression Pre-stretched #1B', price: 45, stockCount: 30, color: '#1B' },
  { id: 'i3', name: 'Freetress Deep Twist', price: 65, stockCount: 15, color: '#4' },
  { id: 'i4', name: 'Lulu Braids Bulk Human Hair', price: 250, stockCount: 5, color: 'Natural Black' }
];

export const INITIAL_QUEUE: QueueEntry[] = [
  {
    id: 'q1',
    queueNumber: 'MAD-001',
    branch: Branch.MADINA,
    customerName: 'Ama Serwaa',
    phoneNumber: '0244123456',
    styleId: 's1',
    length: 'Long',
    bringingOwnExtensions: false,
    status: QueueStatus.IN_SERVICE,
    joinedAt: new Date(Date.now() - 7200000),
    estimatedStartTime: new Date(Date.now() - 7200000),
    paid: true
  },
  {
    id: 'q2',
    queueNumber: 'MAD-002',
    branch: Branch.MADINA,
    customerName: 'Kojo Antwi',
    phoneNumber: '0200111222',
    styleId: 's4',
    length: 'Medium',
    bringingOwnExtensions: true,
    status: QueueStatus.WAITING,
    joinedAt: new Date(Date.now() - 3600000),
    estimatedStartTime: new Date(Date.now() + 1800000),
    paid: false
  },
  {
    id: 'q3',
    queueNumber: 'ACC-001',
    branch: Branch.ACCRA,
    customerName: 'Efua Mensah',
    phoneNumber: '0555999888',
    styleId: 's2',
    length: 'Medium',
    bringingOwnExtensions: false,
    status: QueueStatus.WAITING,
    joinedAt: new Date(Date.now() - 1800000),
    estimatedStartTime: new Date(Date.now() + 600000),
    paid: false
  }
];
