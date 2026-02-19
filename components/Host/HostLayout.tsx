import React, { useState } from 'react';
import { Booking, Room, PhysicalRoom } from '../../types';
import { BookingManagement } from './BookingManagement';
import { RoomManagement } from './RoomManagement';
import { ReportAnalysis } from './ReportAnalysis';
import { DiscountManagement } from './DiscountManagement';

type HostTab = 'bookings' | 'rooms' | 'reports' | 'discounts';

export const HostLayout = ({
    bookings,
    rooms,
    roomOccupancy,
    onAction,
    onToggleRoom,
    onUpdateRoom,
    onCreateRoom,
    onDeleteRoom,
    breakfastPrice,
    onUpdateBreakfastPrice
}: {
    bookings: Booking[],
    rooms: Room[],
    roomOccupancy: Record<string, boolean>,
    onAction: (bookingId: string, action: 'confirm' | 'checkin' | 'reject' | 'pay', assignedRoom?: string) => void,
    onToggleRoom: (num: string, date: string) => void,
    onUpdateRoom: (room: Room) => void,
    onCreateRoom: (room: Room) => void,
    onDeleteRoom: (roomId: string) => void,
    breakfastPrice: number,
    onUpdateBreakfastPrice: (price: number) => void
}) => {
    const [activeTab, setActiveTab] = useState<HostTab>('bookings');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Tab Navigation */}
            <div className="sticky top-0 z-30 bg-white border-b border-gray-100 flex px-4 gap-6 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('bookings')}
                    className={`py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'bookings' ? 'text-black border-black' : 'text-gray-400 border-transparent'
                        }`}
                >
                    預約管理
                </button>
                <button
                    onClick={() => setActiveTab('rooms')}
                    className={`py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'rooms' ? 'text-black border-black' : 'text-gray-400 border-transparent'
                        }`}
                >
                    房型管理
                </button>
                <button
                    onClick={() => setActiveTab('discounts')}
                    className={`py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'discounts' ? 'text-black border-black text-red-600' : 'text-gray-400 border-transparent'
                        }`}
                >
                    優惠中心
                </button>
                <button
                    onClick={() => setActiveTab('reports')}
                    className={`py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'reports' ? 'text-black border-black' : 'text-gray-400 border-transparent'
                        }`}
                >
                    報表分析
                </button>
            </div>

            {/* Content Area */}
            <div className="p-4">
                {activeTab === 'bookings' && (
                    <BookingManagement
                        bookings={bookings}
                        rooms={rooms}
                        roomOccupancy={roomOccupancy}
                        onAction={onAction}
                        onToggleRoom={onToggleRoom}
                    />
                )}
                {activeTab === 'rooms' && (
                    <RoomManagement
                        rooms={rooms}
                        onUpdateRoom={onUpdateRoom}
                        onCreateRoom={onCreateRoom}
                        onDeleteRoom={onDeleteRoom}
                        breakfastPrice={breakfastPrice}
                        onUpdateBreakfastPrice={onUpdateBreakfastPrice}
                    />
                )}
                {activeTab === 'discounts' && (
                    <DiscountManagement rooms={rooms} />
                )}
                {activeTab === 'reports' && (
                    <ReportAnalysis
                        bookings={bookings}
                        rooms={rooms}
                    />
                )}
            </div>
        </div>
    );
};
