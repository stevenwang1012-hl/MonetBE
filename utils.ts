// Helper to calculate days between dates
export const getDiffDays = (d1: string, d2: string) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
};

// Mock CNY Dates (YYYY-MM-DD)
const CNY_DATES = [
  // 2025
  '2025-01-28', '2025-01-29', '2025-01-30', '2025-01-31', '2025-02-01', '2025-02-02',
  // 2026
  '2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20',
  // 2027 (Feb 5 - Feb 10 approximate, pending official announce but usually includes Eve + 4-5 days)
  // Eve: Feb 5, CNY: Feb 6, 7, 8, 9, 10
  '2027-02-05', '2027-02-06', '2027-02-07', '2027-02-08', '2027-02-09', '2027-02-10'
];

const PUBLIC_HOLIDAYS = [
  // 2025
  '2025-01-01', // New Year
  '2025-02-28', // Peace Memorial
  '2025-04-03', '2025-04-04', // Children's & Tomb Sweeping
  '2025-05-01', // Labor Day
  '2025-05-30', '2025-05-31', '2025-06-01', // Dragon Boat (May 31 is actual, Fri-Sun long weekend)
  '2025-10-06', // Mid-Autumn (Mon, bridge?) - Official: Oct 6
  '2025-10-10', // National Day

  // 2026
  '2026-01-01',
  '2026-02-27', '2026-02-28', '2026-03-01', // Peace Memorial (Fri-Sun)
  '2026-04-03', '2026-04-04', '2026-04-05', '2026-04-06', // Tomb Sweeping (Fri-Mon)
  '2026-05-01', '2026-05-02', '2026-05-03', // Labor Day (Fri-Sun)
  '2026-06-19', '2026-06-20', '2026-06-21', // Dragon Boat (Fri-Sun)
  '2026-09-25', '2026-09-26', '2026-09-27', '2026-09-28', // Mid-Autumn + Teacher's (Fri-Mon)
  '2026-10-09', '2026-10-10', '2026-10-11', // National Day (Fri-Sun)

  // 2027
  '2027-01-01',
  '2027-02-28', '2027-03-01', // Peace Memorial
  '2027-04-04', '2027-04-05', '2027-04-06', // Children's & Tomb Sweeping
  '2027-05-01',
  '2027-06-09', // Dragon Boat
  '2027-09-15', // Mid-Autumn
  '2027-10-10', '2027-10-11' // National Day
];

export const getDayType = (dateStr: string): 'WEEKDAY' | 'HOLIDAY' | 'CNY' => {
  if (CNY_DATES.includes(dateStr)) return 'CNY';
  if (PUBLIC_HOLIDAYS.includes(dateStr)) return 'HOLIDAY';

  const day = new Date(dateStr).getDay();
  // Friday (5) and Saturday (6) are Holidays
  if (day === 5 || day === 6) return 'HOLIDAY';

  return 'WEEKDAY';
};

import { Room, Discount } from './types';

export const calculateTotalPrice = (
  checkIn: string,
  checkOut: string,
  room: Room,
  options?: { hasBreakfast?: boolean, guests?: number },
  discounts: Discount[] = []
) => {
  let total = 0;
  let originalTotal = 0; // To track price before discount
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  let currentDate = new Date(start);

  const nights = getDiffDays(checkIn, checkOut);

  // 1. Calculate Room Price
  while (currentDate < end) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const type = getDayType(dateStr);

    // Ensure prices are numbers
    const pCny = Number(room.priceCny) || 0;
    const pHoliday = Number(room.priceHoliday) || 0;
    const pWeekday = Number(room.priceWeekday) || 0;

    let dailyPrice = 0;
    if (type === 'CNY') dailyPrice = pCny;
    else if (type === 'HOLIDAY') dailyPrice = pHoliday;
    else dailyPrice = pWeekday;

    originalTotal += dailyPrice;

    // Check for applicable discount
    // Rules: 
    // 1. Must match room_type_id
    // 2. Date must be within start_date and end_date (inclusive)
    // 3. Must be is_active
    const applicableDiscount = discounts.find(d =>
      d.room_type_id === room.id &&
      d.is_active &&
      dateStr >= d.start_date &&
      dateStr <= d.end_date
    );

    if (applicableDiscount) {
      // Apply discount (e.g. 10 means 10% off -> price * 0.9)
      const multiplier = (100 - applicableDiscount.discount_value) / 100;
      total += Math.round(dailyPrice * multiplier);
    } else {
      total += dailyPrice;
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // 2. Add Breakfast Price
  if (options?.hasBreakfast) {
    const guestCount = options.guests || 1;
    const breakfastCost = 220 * guestCount * nights;
    total += breakfastCost;
    originalTotal += breakfastCost;
  }

  return { total, originalTotal, hasDiscount: total < originalTotal };
};
