import React from 'react';
import { Booking, Room, BookingStatus } from '../../types';
import { Card, StatusBadge } from '../../ui';

export const ReportAnalysis = ({
    bookings,
    rooms
}: {
    bookings: Booking[],
    rooms: Room[]
}) => {
    // State for selected month (YYYY-MM)
    const [selectedMonth, setSelectedMonth] = React.useState(new Date().toISOString().slice(0, 7));

    // Filter for valid paid/checked-in bookings within the selected month
    const validBookings = bookings.filter(b => {
        const isPaidOrCheckedIn = b.status === BookingStatus.PAID || b.status === BookingStatus.CHECKED_IN;
        // Check if booking check-in date starts with the selected month string
        const isInMonth = b.date.startsWith(selectedMonth);
        return isPaidOrCheckedIn && isInMonth;
    });

    // Calculate metrics
    const totalRevenue = validBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const totalOrders = validBookings.length;
    // const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0; // Unused for now

    return (
        <div className="space-y-6 pb-32">
            <div className="flex items-center justify-between">
                <h2 className="font-bold text-xl text-gray-900">報表分析</h2>
                <input
                    type="month"
                    value={selectedMonth}
                    onClick={(e) => {
                        try {
                            e.currentTarget.showPicker();
                        } catch (err) { }
                    }}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 bg-white shadow-sm cursor-pointer"
                />
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                    <p className="text-xs text-green-600 font-bold mb-1">{selectedMonth} 總營收</p>
                    <p className="text-2xl font-black text-gray-900">NT$ {totalRevenue.toLocaleString()}</p>
                </Card>
                <Card className="p-4 bg-white border-gray-100">
                    <p className="text-xs text-gray-400 font-bold mb-1">已結算訂單數</p>
                    <p className="text-2xl font-black text-gray-900">{totalOrders}</p>
                </Card>
            </div>

            <section>
                <h3 className="font-bold text-lg text-gray-900 mb-4">近期入帳明細</h3>
                <div className="space-y-3">
                    {validBookings.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">此月份尚無入帳紀錄</p>
                    ) : (
                        validBookings.slice().reverse().map(b => (
                            <div key={b.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-gray-900">{b.guestName}</span>
                                        <StatusBadge status={b.status} />
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        {b.date} • {rooms.find(r => r.id === b.roomId)?.name || '未知房型'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-gray-900">NT$ {b.totalPrice?.toLocaleString()}</span>
                                    {b.hasBreakfast && <span className="text-[10px] text-orange-500">含早餐 ({b.breakfastCount}人)</span>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};
