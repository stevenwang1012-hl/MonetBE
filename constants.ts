
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
  '108', // Vesselin & Bach (Spec says TBD, keeping 108)
  '103', '105', '106', '107', // Maya Legend
  '101', '102', // Maya Classic
  '301', '302', // Antiguo
  '203', // Inca
  '201', '202', '205' // Latin
];

export const INITIAL_PHYSICAL_ROOMS: PhysicalRoom[] = PHYSICAL_ROOMS_LIST.map(num => ({
  number: num,
  isOccupied: false
}));

export const ROOMS: Room[] = [
  {
    id: 'rt_vesselin',
    name: '主題客房 (Vesselin & Bach)',
    description: '位於樓下，針對2人設計的頂級房型，配備按摩椅、大屏電視與音響。',
    floorLocation: '樓下',
    maxGuests: 2,
    bedConfig: '加大床 × 1',
    sizeSqm: 45,
    porchSizeSqm: 10, // Approximate large porch
    priceWeekday: 3200,
    priceHoliday: 3500,
    priceCny: 4800,
    images: [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80'
    ],
    roomNumbers: ['108'],
    amenities: ['按摩椅', '大屏電視', '音響']
  },
  {
    id: 'rt_maya_legend',
    name: '馬雅傳說',
    description: '位於樓下，適合4人入住，擁有寬敞的室內空間與前廊。',
    floorLocation: '樓下',
    maxGuests: 4,
    bedConfig: '標準雙人床 × 2',
    sizeSqm: 30,
    porchSizeSqm: 8,
    priceWeekday: 2800,
    priceHoliday: 3200,
    priceCny: 5000,
    images: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80'
    ],
    roomNumbers: ['103', '105', '106', '107'],
    amenities: []
  },
  {
    id: 'rt_maya_classic',
    name: '馬雅經典',
    description: '位於樓下，經典雙人房型，舒適且便利。',
    floorLocation: '樓下',
    maxGuests: 2,
    bedConfig: '加大床 × 1',
    sizeSqm: 30,
    porchSizeSqm: 8,
    priceWeekday: 2300,
    priceHoliday: 2500,
    priceCny: 4200,
    images: [
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80'
    ],
    roomNumbers: ['101', '102'],
    amenities: []
  },
  {
    id: 'rt_antiguo',
    name: '安提哥',
    description: '位於二樓 (房號3開頭)，視野開闊的雙人房。',
    floorLocation: '二樓',
    maxGuests: 2,
    bedConfig: '標準雙人床 × 1',
    sizeSqm: 26,
    porchSizeSqm: 6,
    priceWeekday: 2000,
    priceHoliday: 2300,
    priceCny: 3300,
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80'
    ],
    roomNumbers: ['301', '302'],
    amenities: []
  },
  {
    id: 'rt_inca',
    name: '印加風情',
    description: '位於二樓，充滿異國風情的雙人房。',
    floorLocation: '二樓',
    maxGuests: 2,
    bedConfig: '標準雙人床 × 1',
    sizeSqm: 25,
    porchSizeSqm: 6,
    priceWeekday: 2000,
    priceHoliday: 2300,
    priceCny: 3300,
    images: [
      'https://images.unsplash.com/photo-1590490359683-658d3d23f972?auto=format&fit=crop&w=800&q=80'
    ],
    roomNumbers: ['203'],
    amenities: []
  },
  {
    id: 'rt_latin',
    name: '拉丁浪漫',
    description: '位於二樓，精緻小巧的浪漫雙人房。',
    floorLocation: '二樓',
    maxGuests: 2,
    bedConfig: '標準雙人床 × 1',
    sizeSqm: 16,
    porchSizeSqm: 7,
    priceWeekday: 1600,
    priceHoliday: 1800,
    priceCny: 2800,
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80'
    ],
    roomNumbers: ['201', '202', '205'],
    amenities: []
  }
];

export const INITIAL_BOOKINGS: Booking[] = [];
