
import { Room, User, UserRole, Booking, BookingStatus, PhysicalRoom } from './types';

export const MOCK_USER_GUEST: User = {
  id: 'u_guest_001',
  name: 'Alex Chen',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  role: UserRole.GUEST,
  lineId: 'line_alex_123'
};

export const MOCK_USER_HOST: User = {
  id: 'u_host_001',
  name: 'Sarah (Owner)',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  role: UserRole.HOST,
};

export const PHYSICAL_ROOMS_LIST = [
  '108', // rt_vesselin (Assumed 108)
  '103', '105', '106', '107', // rt_maya_legend
  '101', '102', // rt_maya_classic
  '301', '302', // rt_antiguo
  '203', // rt_inca
  '201', '202', '205' // rt_latin
];

export const INITIAL_PHYSICAL_ROOMS: PhysicalRoom[] = PHYSICAL_ROOMS_LIST.map(num => ({
  number: num,
  isOccupied: false
}));

export const ROOMS: Room[] = [
  {
    id: 'rt_vesselin',
    name: 'Vesselin & Bach (主題客房)',
    description: '位於樓下，擁有豪華加大床與專屬按摩椅，適合追求極致放鬆的旅客。',
    floorLocation: '樓下',
    maxGuests: 2,
    bedConfig: '加大床 × 1',
    sizeSqm: 45,
    porchSizeSqm: undefined, // '大前廊', size unknown
    amenities: ['按摩椅', '大屏電視', '音響'],
    priceWeekday: 3200,
    priceHoliday: 3500,
    priceCny: 4800,
    price: 3200, // Default display price
    images: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['樓下', '加大床', '按摩椅']
  },
  {
    id: 'rt_maya_legend',
    name: '馬雅傳說',
    description: '寬敞的樓下四人房，配備兩張標準雙人床與專屬前廊，適合家庭或好友同遊。',
    floorLocation: '樓下',
    maxGuests: 4,
    bedConfig: '標準雙人床 × 2',
    sizeSqm: 30,
    porchSizeSqm: 8,
    priceWeekday: 2800,
    priceHoliday: 3200,
    priceCny: 5000,
    price: 2800,
    images: [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['樓下', '四人房', '前廊']
  },
  {
    id: 'rt_maya_classic',
    name: '馬雅經典',
    description: '樓下加大雙人床房型，舒適的空間設計與前廊，是情侶度假的完美選擇。',
    floorLocation: '樓下',
    maxGuests: 2,
    bedConfig: '加大床 × 1',
    sizeSqm: 30,
    porchSizeSqm: 8,
    priceWeekday: 2300,
    priceHoliday: 2500,
    priceCny: 4200,
    price: 2300,
    images: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['樓下', '加大床', '前廊']
  },
  {
    id: 'rt_antiguo',
    name: '安提哥',
    description: '位於二樓的精緻雙人房，擁有絕佳視野與寧靜氛圍，讓您盡情享受山林之美。',
    floorLocation: '二樓',
    maxGuests: 2,
    bedConfig: '標準雙人床 × 1',
    sizeSqm: 26,
    porchSizeSqm: 6,
    priceWeekday: 2000,
    priceHoliday: 2300,
    priceCny: 3300,
    price: 2000,
    images: [
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['二樓', '高CP值']
  },
  {
    id: 'rt_inca',
    name: '印加風情',
    description: '充滿異國風情的二樓雙人房，簡約舒適的設計，為您的旅程增添獨特回憶。',
    floorLocation: '二樓',
    maxGuests: 2,
    bedConfig: '標準雙人床 × 1',
    sizeSqm: 25,
    porchSizeSqm: 6,
    priceWeekday: 2000,
    priceHoliday: 2300,
    priceCny: 3300,
    price: 2000,
    images: [
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['二樓', '標準床']
  },
  {
    id: 'rt_latin',
    name: '拉丁浪漫',
    description: '經濟實惠的二樓雙人房，小巧溫馨，適合預算有限的小資族或背包客。',
    floorLocation: '二樓',
    maxGuests: 2,
    bedConfig: '標準雙人床 × 1',
    sizeSqm: 16,
    porchSizeSqm: 7,
    priceWeekday: 1600,
    priceHoliday: 1800,
    priceCny: 2800,
    price: 1600,
    images: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    tags: ['二樓', '小資首選', '獨立前廊']
  }
];

export const INITIAL_BOOKINGS: Booking[] = [];
