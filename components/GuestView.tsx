import React, { useState, useMemo } from 'react';
import { Room, Booking, BookingStatus } from '../types';
import { Button, Icons, Card, StatusBadge } from '../ui';
import { getDiffDays, calculateTotalPrice } from '../utils';

// --- RoomList Component ---
interface RoomListProps {
    rooms: Room[];
    bookings: Booking[];
    onBook: (room: Room) => void;
    checkIn: string;
    checkOut: string;
}

export const RoomList: React.FC<RoomListProps> = ({ rooms, bookings, onBook, checkIn, checkOut }) => {
    const [guestFilter, setGuestFilter] = useState<number>(2);
    const nights = getDiffDays(checkIn, checkOut);

    // Real availability logic
    const displayRooms = rooms.filter(r => {
        const matchesFilter = guestFilter === 4 ? r.maxGuests >= 4 : r.maxGuests <= 3;

        // Check if room is booked during the selected dates
        // A booking overlaps if (StartA < EndB) && (EndA > StartB)
        const isBooked = bookings.some(b => {
            // Only check confirmed, pending, or checked_in bookings (not cancelled)
            if (b.status === 'CANCELLED') return false;
            if (b.roomId !== r.id) return false;

            return (checkIn < b.endDate) && (checkOut > b.date);
        });

        return matchesFilter && !isBooked;
    });

    // Regulatory Limit: Only display 5 rooms max
    const visibleRooms = displayRooms.slice(0, 5);

    return (
        <div className="p-4 space-y-6">
            <div className="bg-gray-200 p-1 rounded-xl flex relative">
                <button
                    onClick={() => setGuestFilter(2)}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${guestFilter === 2 ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    兩人房
                </button>
                <button
                    onClick={() => setGuestFilter(4)}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${guestFilter === 4 ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    四人房
                </button>
            </div>

            <div className="space-y-6">
                {displayRooms.length > 0 ? displayRooms.map(room => (
                    <div key={room.id} className="group relative bg-white rounded-3xl overflow-hidden shadow-lg shadow-gray-200/50 border border-gray-100">
                        <div className="aspect-[4/3] w-full overflow-hidden relative group">
                            {room.images.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const img = document.getElementById(`img-${room.id}`) as HTMLImageElement;
                                            if (img) {
                                                const currentSrc = img.src;
                                                const currentIndex = room.images.indexOf(currentSrc) || room.images.indexOf(room.images.find(url => currentSrc.includes(url)) || '');
                                                const nextIndex = (currentIndex - 1 + room.images.length) % room.images.length;
                                                img.src = room.images[nextIndex];
                                            }
                                        }}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                                    >
                                        <Icons.ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const img = document.getElementById(`img-${room.id}`) as HTMLImageElement;
                                            if (img) {
                                                const currentSrc = img.src;
                                                const currentIndex = room.images.indexOf(currentSrc) || room.images.indexOf(room.images.find(url => currentSrc.includes(url)) || '');
                                                const nextIndex = (currentIndex + 1) % room.images.length;
                                                img.src = room.images[nextIndex];
                                            }
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                                    >
                                        <Icons.ChevronRight className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                            <img
                                id={`img-${room.id}`}
                                src={room.images[0]}
                                alt={room.name}
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 p-5 w-full pointer-events-none">
                                <h3 className="font-bold text-2xl text-white tracking-tight leading-tight">{room.name}</h3>
                            </div>
                        </div>

                        <div className="p-5">
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md border border-blue-100">
                                    {room.bedConfig}
                                </span>
                                {room.amenities?.map((tag, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-md border border-gray-100">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Size info removed as requested */}

                            <div className="flex items-end justify-between mt-2 pt-2 border-t border-gray-50">
                                <div>
                                    <p className="text-xs text-gray-400 font-medium mb-0.5">{nights} 晚總計價格</p>
                                    {/* Logic to determine price based on calendar (Weekend/Holiday) would go here. Using default price for mock. */}
                                    <p className="text-xl font-bold text-gray-900">
                                        NT$ {calculateTotalPrice(checkIn, checkOut, room).toLocaleString()}
                                    </p>
                                </div>
                                <Button onClick={() => onBook(room)} className="px-6 shadow-md shadow-blue-500/20">
                                    預約
                                </Button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="py-20 text-center text-gray-400 bg-white rounded-3xl border border-dashed border-gray-300">
                        <Icons.Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium">所選日期目前無可用房型</p>
                        <p className="text-xs mt-1">請嘗試更換日期或房型人數</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- GuestHistory Component ---
export const GuestHistory = ({ bookings, rooms, onCancel }: { bookings: Booking[], rooms: Room[], onCancel: (id: string) => void }) => {
    if (bookings.length === 0) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400">
                <Icons.Calendar className="w-16 h-16 mb-4 opacity-20" />
                <p>目前沒有預約紀錄</p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4">
            {bookings.sort((a, b) => b.createdAt - a.createdAt).map(booking => {
                const room = rooms.find(r => r.id === booking.roomId);
                const nights = getDiffDays(booking.date, booking.endDate);
                return (
                    <Card key={booking.id} className="p-4 flex gap-4">
                        <div className="w-24 h-24 bg-gray-200 rounded-xl flex-shrink-0 overflow-hidden">
                            {room && <img src={room.images[0]} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-gray-900 truncate text-base">{room?.name} <span className="text-xs text-gray-400 font-normal">({room?.maxGuests}人房)</span></h4>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                            <Icons.Calendar className="w-3.5 h-3.5" />
                                            {booking.date} (共{nights}晚)
                                        </div>
                                        <StatusBadge status={booking.status} />
                                    </div>

                                    <div className="text-xs text-gray-500 flex items-center gap-2">
                                        <span>🍳 早餐：{booking.hasBreakfast ? `${booking.breakfastCount} 位` : '無'}</span>
                                    </div>

                                    <div className="text-sm font-bold text-gray-900 mt-1">
                                        價格：NT$ {booking.totalPrice?.toLocaleString()}
                                    </div>

                                    {booking.assignedPhysicalRoom && (
                                        <p className="text-xs font-bold text-blue-600 mt-1 italic">房號：{booking.assignedPhysicalRoom}</p>
                                    )}
                                </div>
                            </div>

                            {(booking.status === BookingStatus.PENDING || booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.PAID) && (
                                <div className="flex justify-end mt-3 border-t border-gray-100 pt-2">
                                    <Button variant="danger" className="py-1.5 px-3 text-xs" onClick={() => onCancel(booking.id)}>
                                        取消預約
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};
