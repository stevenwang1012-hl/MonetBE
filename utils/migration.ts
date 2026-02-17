import { supabase } from '../supabase';
import { Room } from '../types';

// This function will read from LocalStorage and upload to Supabase
// It should be triggered manually or once on app load if DB is empty
export const migrateRoomsToSupabase = async () => {
    const savedRooms = localStorage.getItem('monetBB_rooms');
    if (!savedRooms) return;

    const rooms: Room[] = JSON.parse(savedRooms);

    console.log(`Found ${rooms.length} rooms in LocalStorage. Starting migration...`);

    for (const room of rooms) {
        // 1. Insert/Update Room Type
        const { error: rtError } = await supabase
            .from('room_types')
            .upsert({
                id: room.id,
                name: room.name,
                floor_location: room.floorLocation,
                max_guests: room.maxGuests,
                bed_config: room.bedConfig,
                size_sqm: room.sizeSqm,
                price_weekday: room.priceWeekday,
                price_holiday: room.priceHoliday,
                price_cny: room.priceCny,
                description: room.description,
                amenities: room.amenities,
                image_url: room.images[0] // Simplify to 1 image for now or need a separate table for images
            });

        if (rtError) {
            console.error(`Error migrating room type ${room.name}:`, rtError);
            continue;
        }

        // 2. Insert Physical Rooms (if any)
        if (room.roomNumbers && room.roomNumbers.length > 0) {
            for (const num of room.roomNumbers) {
                const { error: rError } = await supabase
                    .from('rooms')
                    .upsert({
                        room_number: num,
                        room_type_id: room.id,
                        is_active: true
                    });

                if (rError) {
                    console.error(`Error migrating physical room ${num}:`, rError);
                }
            }
        }
    }

    console.log('Migration completed.');
};
