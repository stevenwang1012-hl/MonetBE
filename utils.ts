// Helper to calculate days between dates
export const getDiffDays = (d1: string, d2: string) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
};

// Mock CNY Dates (YYYY-MM-DD)
const CNY_DATES = [
  '2025-01-28', '2025-01-29', '2025-01-30', '2025-01-31', '2025-02-01', '2025-02-02',
  '2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20'
];

export const getDayType = (dateStr: string): 'WEEKDAY' | 'HOLIDAY' | 'CNY' => {
  if (CNY_DATES.includes(dateStr)) return 'CNY';

  const day = new Date(dateStr).getDay();
  // Friday (5) and Saturday (6) are Holidays
  if (day === 5 || day === 6) return 'HOLIDAY';

  return 'WEEKDAY';
};

import { Room } from './types';

export const calculateTotalPrice = (checkIn: string, checkOut: string, room: Room, options?: { hasBreakfast?: boolean, guests?: number }) => {
  let total = 0;
  let currentDate = new Date(checkIn);
  const end = new Date(checkOut);
  const nights = getDiffDays(checkIn, checkOut);

  // 1. Calculate Room Price
  while (currentDate < end) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const type = getDayType(dateStr);

    if (type === 'CNY') total += room.priceCny;
    else if (type === 'HOLIDAY') total += room.priceHoliday;
    else total += room.priceWeekday;

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // 2. Add Breakfast Price (220 * guests * nights)
  if (options?.hasBreakfast) {
    // Default to maxGuests if guests not specified
    const guestCount = options.guests || room.maxGuests;
    total += 220 * guestCount * nights;
  }

  return total;
};
