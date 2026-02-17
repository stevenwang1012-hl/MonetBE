import React from 'react';
import { HostDashboard } from '../HostView';
import { Booking, Room } from '../../types';

export const BookingManagement = (props: {
    bookings: Booking[];
    rooms: Room[];
    roomOccupancy: Record<string, boolean>;
    onAction: (bookingId: string, action: 'confirm' | 'checkin' | 'reject' | 'pay', assignedRoom?: string) => void;
    onToggleRoom: (num: string, date: string) => void;
}) => {
    return <HostDashboard {...props} />;
};
