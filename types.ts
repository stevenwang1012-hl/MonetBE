export enum UserRole {
  GUEST = 'GUEST',
  HOST = 'HOST',
}

export enum BookingStatus {
  PENDING = 'PENDING',       // User booked, waiting for host
  CONFIRMED = 'CONFIRMED',   // Host confirmed (Unpaid)
  PAID = 'PAID',             // Paid
  CHECKED_IN = 'CHECKED_IN', // Host marked as checked in (accounting)
  CANCELLED = 'CANCELLED',
  BLOCKED = 'BLOCKED',       // Blocked by host (e.g. maintenance or OTA booking)
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  lineId?: string;
}

export interface Room {
  id: string;
  name: string;
  description: string; // Removed in favor of specific fields
  floorLocation: string; // '樓下', '二樓'
  maxGuests: number;
  bedConfig: string;
  sizeSqm: number;
  porchSizeSqm?: number;
  amenities?: string[];
  priceWeekday: number;
  priceHoliday: number;
  priceCny: number;
  images: string[]; // Updated to array for carousel
  roomNumbers?: string[]; // Physical room numbers (e.g. ['201', '202'])
  // Calculated fields for compatibility or display
  price?: number; // Optional, might be deprecated or used as 'display price'
  tags?: string[]; // Kept for UI compatibility
}

export interface Booking {
  id: string;
  roomId: string;
  userId: string;
  guestName: string;
  date: string; // ISO Date String YYYY-MM-DD (Check-in)
  endDate: string; // ISO Date String YYYY-MM-DD (Check-out)
  status: BookingStatus;
  createdAt: number;
  assignedPhysicalRoom?: string; // Optional physical room assignment (e.g., "101")
  hasBreakfast?: boolean;
  breakfastCount?: number;
  totalPrice?: number;
}

export interface PhysicalRoom {
  number: string;
  isOccupied: boolean;
  notes?: string;
}