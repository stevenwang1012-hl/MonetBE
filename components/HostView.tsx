import React, { useState } from 'react';
import { Booking, Room, PhysicalRoom, BookingStatus } from '../types';
import { Button, Card, StatusBadge, Icons } from '../ui';
import { getDiffDays } from '../utils';
import { INITIAL_PHYSICAL_ROOMS } from '../constants';

// --- RoomGrid ---
export const RoomGrid = ({ rooms, roomOccupancy, onToggle }: { rooms: Room[], roomOccupancy: Record<string, boolean>, onToggle: (num: string) => void }) => {
    return (
        <div className="mt-2">
            {/* Legend - Moved to top right or kept here but clean */}
            <div className="flex justify-end mb-4">
                <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                    <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>空閒中</div>
                    <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>已佔用</div>
                </div>
            </div>

            <div className="space-y-6">
                {rooms.filter(r => r.roomNumbers && r.roomNumbers.length > 0).map(room => (
                    <div key={room.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                        <h3 className="text-sm font-bold text-gray-500 mb-3 pl-1">{room.name}</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                            {room.roomNumbers?.map(num => {
                                const isOccupied = roomOccupancy[num];
                                return (
                                    <button
                                        key={num}
                                        onClick={() => onToggle(num)}
                                        className={`flex flex-col items-center justify-center py-4 px-2 rounded-xl border-2 transition-all duration-200 active:scale-95 shadow-sm ${isOccupied
                                            ? 'bg-red-50 border-red-200 text-red-700'
                                            : 'bg-green-50 border-green-200 text-green-700 hover:shadow-md'
                                            }`}
                                    >
                                        <span className="text-xl font-black mb-1">{num}</span>
                                        <span className="text-xs font-bold opacity-90">{isOccupied ? '已佔用' : '空閒'}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- BookingItem ---
interface BookingItemProps {
    booking: Booking;
    room?: Room;
    availablePhysicalRooms: string[];
    actionType?: 'confirm' | 'checkin' | 'pay';
    onAction: (bookingId: string, action: 'confirm' | 'checkin' | 'reject' | 'pay', assignedRoom?: string) => void;
    dashboardDate?: string;
}

export const BookingItem: React.FC<BookingItemProps> = ({
    booking,
    room,
    availablePhysicalRooms,
    actionType,
    onAction
}) => {
    const [selectedPhysicalRoom, setSelectedPhysicalRoom] = useState<string>('');
    const nights = getDiffDays(booking.date, booking.endDate);

    return (
        <Card className="p-4 mb-3 border-l-4 border-l-black">
            <div className="flex justify-between items-start mb-3 gap-3">
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 truncate pr-2">{booking.guestName}</h4>
                    <p className="text-sm text-gray-500 truncate">{room?.name}</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                        期間：{booking.date} ~ {booking.endDate} ({nights}晚)
                    </p>
                    {booking.hasBreakfast && (
                        <p className="text-[11px] font-bold text-orange-600 mt-0.5 truncate">🍳 包含早午餐 ({booking.breakfastCount || 1}人)</p>
                    )}
                    {booking.totalPrice && (
                        <p className="text-[11px] font-bold text-gray-900 mt-0.5">💰 總額: NT$ {booking.totalPrice.toLocaleString()}</p>
                    )}
                </div>
                <div className="flex-shrink-0">
                    <StatusBadge status={booking.status} />
                </div>
            </div>

            {actionType === 'confirm' && (
                <div className="flex flex-col gap-3 mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-600">分配房號:</span>
                        <select
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg py-1 px-2 text-sm outline-none"
                            value={selectedPhysicalRoom}
                            onChange={(e) => setSelectedPhysicalRoom(e.target.value)}
                        >
                            <option value="">請選擇空房...</option>
                            {availablePhysicalRooms.map(num => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="danger"
                            className="flex-1 py-2 text-xs"
                            onClick={() => onAction(booking.id, 'reject')}
                        >
                            婉拒
                        </Button>
                        <Button
                            className="flex-[2] py-2 text-xs"
                            disabled={!selectedPhysicalRoom}
                            onClick={() => onAction(booking.id, 'confirm', selectedPhysicalRoom)}
                        >
                            確認預約
                        </Button>
                    </div>
                </div>
            )}

            {actionType === 'checkin' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <div className="flex-1 text-xs text-gray-500 flex flex-col justify-center italic">
                        <span>指派房號: {booking.assignedPhysicalRoom}</span>
                    </div>
                    {booking.status === BookingStatus.CONFIRMED && (
                        <Button variant="secondary" className="px-3 py-2 text-xs bg-purple-50 text-purple-700 hover:bg-purple-100" onClick={() => onAction(booking.id, 'pay')}>
                            已收款
                        </Button>
                    )}
                    <Button variant="secondary" className="px-6 py-2 text-xs bg-green-50 text-green-700 hover:bg-green-100" onClick={() => onAction(booking.id, 'checkin')}>
                        辦理入住
                    </Button>
                </div>
            )}
        </Card>
    );
};

// --- HostDashboard ---
export const HostDashboard = ({
    bookings,
    rooms,
    roomOccupancy,
    onAction,
    onToggleRoom
}: {
    bookings: Booking[],
    rooms: Room[],
    roomOccupancy: Record<string, boolean>,
    onAction: (bookingId: string, action: 'confirm' | 'checkin' | 'reject' | 'pay', assignedRoom?: string) => void,
    onToggleRoom: (num: string, date: string) => void
}) => {
    // State for dashboard date
    const [dashboardDate, setDashboardDate] = useState<string>(new Date().toISOString().split('T')[0]);

    // Calculate occupancy for the selected date
    const occupiedRoomNumbers = new Set(
        bookings
            .filter(b =>
                (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PAID || b.status === BookingStatus.CHECKED_IN || b.status === BookingStatus.BLOCKED) &&
                b.assignedPhysicalRoom &&
                b.date <= dashboardDate && b.endDate > dashboardDate
            )
            .map(b => b.assignedPhysicalRoom!)
    );

    const validBookings = bookings.filter(b => rooms.find(r => r.id === b.roomId));
    const pendingBookings = validBookings.filter(b => b.status === BookingStatus.PENDING);
    const activeBookings = validBookings.filter(b => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PAID);
    const historyBookings = validBookings.filter(b => b.status === BookingStatus.CHECKED_IN);

    // Merge calculated occupancy with manual roomOccupancy
    // If a room is manually marked occupied, it shows occupied.
    // If a room has a booking today, it shows occupied.
    const displayOccupancy: Record<string, boolean> = { ...roomOccupancy };
    occupiedRoomNumbers.forEach(num => {
        displayOccupancy[num] = true;
    });

    // Reconstruct physicalRooms from INITIAL_PHYSICAL_ROOMS combined with displayOccupancy
    const physicalRooms = INITIAL_PHYSICAL_ROOMS.map(r => ({
        ...r,
        isOccupied: displayOccupancy[r.number] || false
    }));

    // Helper to get available physical rooms for a specific booking date range
    const getAvailableRoomsForBooking = (targetBooking: Booking) => {
        const targetRoom = rooms.find(r => r.id === targetBooking.roomId);
        if (!targetRoom || !targetRoom.roomNumbers) return [];

        // Find overlapping bookings that are confirmed/paid/checked-in/blocked
        const overlappingBookings = bookings.filter(b =>
            b.id !== targetBooking.id && // exclude self
            (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PAID || b.status === BookingStatus.CHECKED_IN || b.status === BookingStatus.BLOCKED) &&
            b.assignedPhysicalRoom && // has a room assigned
            (b.date < targetBooking.endDate && b.endDate > targetBooking.date) // active overlap
        );

        const occupiedNumbers = new Set(overlappingBookings.map(b => String(b.assignedPhysicalRoom).trim()));
        return targetRoom.roomNumbers.filter(num => !occupiedNumbers.has(String(num).trim()));
    };

    return (
        <div className="p-4 space-y-8 pb-32">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <div>
                        <h2 className="font-bold text-lg text-gray-900">房間狀態實時看板</h2>
                        <p className="text-xs text-gray-400 mt-1">檢視指定日期的房況</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-200 self-start sm:self-auto">
                        <button
                            onClick={() => {
                                const d = new Date(dashboardDate);
                                d.setDate(d.getDate() - 1);
                                setDashboardDate(d.toISOString().split('T')[0]);
                            }}
                            className="p-1 hover:bg-white rounded-md transition-colors"
                        >
                            <Icons.ChevronLeft className="w-4 h-4 text-gray-400" />
                        </button>
                        <input
                            type="date"
                            value={dashboardDate}
                            onClick={(e) => {
                                try {
                                    e.currentTarget.showPicker();
                                } catch (err) { }
                            }}
                            onChange={(e) => setDashboardDate(e.target.value)}
                            className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 p-0 w-28 text-center cursor-pointer"
                        />
                        <button
                            onClick={() => {
                                const d = new Date(dashboardDate);
                                d.setDate(d.getDate() + 1);
                                setDashboardDate(d.toISOString().split('T')[0]);
                            }}
                            className="p-1 hover:bg-white rounded-md transition-colors"
                        >
                            <Icons.ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>

                <RoomGrid
                    rooms={rooms}
                    roomOccupancy={displayOccupancy}
                    onToggle={(num) => onToggleRoom(num, dashboardDate)}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section>
                    <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                        <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                            新預約申請 <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase font-black whitespace-nowrap">待處理</span>
                        </h2>
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">{pendingBookings.length}</span>
                    </div>
                    {pendingBookings.length === 0 ? <p className="text-sm text-gray-400">目前沒有新預約</p> : pendingBookings.map(b => (
                        <BookingItem
                            key={b.id}
                            booking={b}
                            room={rooms.find(r => r.id === b.roomId)}
                            availablePhysicalRooms={getAvailableRoomsForBooking(b)}
                            actionType="confirm"
                            onAction={onAction}
                        />
                    ))}
                </section>

                <section>
                    <h2 className="font-bold text-lg text-gray-900 mb-4">即將入住 / 已確認</h2>
                    {activeBookings.length === 0 ? <p className="text-sm text-gray-400">無已確認待入住訂單</p> : activeBookings.map(b => (
                        <BookingItem
                            key={b.id}
                            booking={b}
                            room={rooms.find(r => r.id === b.roomId)}
                            availablePhysicalRooms={physicalRooms.map(r => r.number)}
                            actionType="checkin"
                            onAction={onAction}
                            dashboardDate={dashboardDate}
                        />
                    ))}
                </section>
            </div>


        </div>
    );
};
