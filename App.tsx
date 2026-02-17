import React, { useState, useEffect } from 'react';
import { User, UserRole, Booking, BookingStatus, Room, PhysicalRoom } from './types';
import { MOCK_USER_GUEST, MOCK_USER_HOST, ROOMS, INITIAL_BOOKINGS, INITIAL_PHYSICAL_ROOMS } from './constants';
import { Button, ScreenContainer, Header, Icons } from './ui';
import { getDiffDays, calculateTotalPrice } from './utils';

// Components
import { LoginScreen } from './components/LoginScreen';
import { RoomList, GuestHistory } from './components/GuestView';
import { HostLayout } from './components/Host/HostLayout';

// --- Main App ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'explore' | 'trips'>('explore');

  // Date State
  const [checkIn, setCheckIn] = useState<string>(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState<string>(new Date(Date.now() + 172800000).toISOString().split('T')[0]);

  // Persistence Logic
  // State for data persistence
  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('monetBB_rooms');
    return saved ? JSON.parse(saved) : ROOMS;
  });

  const [breakfastPrice, setBreakfastPrice] = useState<number>(() => {
    const saved = localStorage.getItem('monetBB_breakfast_price');
    return saved ? parseInt(saved) : 220;
  });

  // Persist rooms and breakfast price
  useEffect(() => {
    localStorage.setItem('monetBB_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('monetBB_breakfast_price', breakfastPrice.toString());
  }, [breakfastPrice]);

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('monetBB_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [physicalRooms, setPhysicalRooms] = useState<PhysicalRoom[]>(() => {
    const saved = localStorage.getItem('monetBB_physicalRooms');
    return saved ? JSON.parse(saved) : INITIAL_PHYSICAL_ROOMS;
  });

  React.useEffect(() => {
    localStorage.setItem('monetBB_bookings', JSON.stringify(bookings));
  }, [bookings]);

  React.useEffect(() => {
    localStorage.setItem('monetBB_physicalRooms', JSON.stringify(physicalRooms));
  }, [physicalRooms]);

  const [showBookingModal, setShowBookingModal] = useState<Room | null>(null);
  const [addBreakfast, setAddBreakfast] = useState<boolean>(false);
  const [breakfastCount, setBreakfastCount] = useState<number>(1);

  const handleLogin = (role: UserRole) => {
    if (role === UserRole.GUEST) setUser(MOCK_USER_GUEST);
    else setUser(MOCK_USER_HOST);
  };

  const handleCreateBooking = (room: Room) => {
    if (!user) return;
    const newBooking: Booking = {
      id: `b_${Date.now()}`,
      roomId: room.id,
      userId: user.id,
      guestName: user.name,
      date: checkIn,
      endDate: checkOut,
      status: BookingStatus.PENDING,
      createdAt: Date.now(),
      hasBreakfast: addBreakfast,
      breakfastCount: addBreakfast ? breakfastCount : 0,
      totalPrice: calculateTotalPrice(checkIn, checkOut, room, { hasBreakfast: addBreakfast, guests: breakfastCount })
    };
    setBookings(prev => [...prev, newBooking]);
    setShowBookingModal(null);
    setActiveTab('trips');
  };

  const handleTogglePhysicalRoom = (roomNumber: string) => {
    setPhysicalRooms(prev => prev.map(r =>
      r.number === roomNumber ? { ...r, isOccupied: !r.isOccupied } : r
    ));
  };

  const handleHostAction = (bookingId: string, action: 'confirm' | 'checkin' | 'reject' | 'pay', assignedRoom?: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id !== bookingId) return b;

      if (action === 'confirm' && assignedRoom) {
        handleTogglePhysicalRoom(assignedRoom);
        return { ...b, status: BookingStatus.CONFIRMED, assignedPhysicalRoom: assignedRoom };
      }

      if (action === 'checkin') {
        return { ...b, status: BookingStatus.CHECKED_IN };
      }

      if (action === 'reject') {
        return { ...b, status: BookingStatus.CANCELLED };
      }

      if (action === 'pay') {
        return { ...b, status: BookingStatus.PAID };
      }

      return b;
    }));
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings(prev => prev.map(b =>
      b.id === bookingId ? { ...b, status: BookingStatus.CANCELLED } : b
    ));
  };

  const handleUpdateRoom = (updatedRoom: Room) => {
    setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
  };

  const handleCreateRoom = (newRoom: Room) => {
    setRooms(prev => [...prev, newRoom]);
  };

  const handleDeleteRoom = (roomId: string) => {
    setRooms(prev => prev.filter(r => r.id !== roomId));
  };

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  if (user.role === UserRole.GUEST) {
    const myBookings = bookings.filter(b => b.userId === user.id);
    const activeBookingCount = bookings.filter(b =>
      b.userId === user.id &&
      (b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED)
    ).length;

    return (
      <ScreenContainer>
        <div className="sticky top-0 z-50">
          <Header
            title="花蓮莫內花園咖啡農莊"
            subtitle="花蓮縣壽豐鄉池南路一段138號"
            rightAction={<img src={user.avatar} className="w-8 h-8 rounded-full bg-gray-200 border border-white shadow-sm" />}
          />
        </div>

        {activeTab === 'explore' && (
          <div className="bg-white border-b border-gray-200 sticky top-[76px] z-40 shadow-sm px-4 py-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 flex-1 border border-gray-200">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider whitespace-nowrap">入住</span>
              <input
                type="date"
                className="text-xs font-bold bg-transparent outline-none text-gray-700 w-full p-0 border-none focus:ring-0"
                value={checkIn}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setCheckIn(e.target.value);
                  if (e.target.value >= checkOut) {
                    const nextDay = new Date(new Date(e.target.value).getTime() + 86400000).toISOString().split('T')[0];
                    setCheckOut(nextDay);
                  }
                }}
              />
            </div>
            <div className="text-gray-300">
              <Icons.ArrowRight className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 flex-1 border border-gray-200">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider whitespace-nowrap">退房</span>
              <input
                type="date"
                className="text-xs font-bold bg-transparent outline-none text-gray-700 w-full p-0 border-none focus:ring-0"
                value={checkOut}
                min={new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0]}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
          </div>
        )}

        <main className="pt-2">
          {activeTab === 'explore' ? (
            <RoomList rooms={ROOMS} bookings={bookings} onBook={setShowBookingModal} checkIn={checkIn} checkOut={checkOut} />
          ) : (
            <GuestHistory bookings={myBookings} rooms={ROOMS} onCancel={handleCancelBooking} />
          )}
        </main>

        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-lg border-t border-gray-200 pb-safe pt-2 px-6 flex justify-around items-center z-50 h-20 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
          <button onClick={() => setActiveTab('explore')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'explore' ? 'text-black' : 'text-gray-400'}`}>
            <Icons.Home className="w-6 h-6" />
            <span className="text-[10px] font-bold">預約房型</span>
          </button>

          <button onClick={() => setActiveTab('trips')} className={`relative flex flex-col items-center gap-1 transition-colors ${activeTab === 'trips' ? 'text-black' : 'text-gray-400'}`}>
            <div className="relative">
              <Icons.Calendar className="w-6 h-6" />
              {activeBookingCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-black h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center ring-2 ring-white">
                  {activeBookingCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold">預約紀錄</span>
          </button>
        </div>

        {showBookingModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-200 mx-auto">
              <div className="flex gap-4 mb-4">
                <img src={showBookingModal.images[0]} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold truncate">{showBookingModal.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {showBookingModal.bedConfig}
                  </p>
                  <p className="text-gray-900 font-bold text-lg mt-1">
                    NT$ {calculateTotalPrice(checkIn, checkOut, showBookingModal, { hasBreakfast: addBreakfast, guests: breakfastCount }).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="text-gray-500 text-xs mb-4 leading-relaxed bg-gray-50 p-3 rounded-xl">
                請點擊下方確認預約。管家將在收到通知後與您聯繫指派房號並確認匯款資訊。
              </p>

              <div className="mb-4 p-3 border border-gray-100 rounded-xl bg-orange-50/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="addBreakfast"
                      className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      checked={addBreakfast}
                      onChange={(e) => setAddBreakfast(e.target.checked)}
                    />
                    <label htmlFor="addBreakfast" className="text-sm font-bold text-gray-700">加購早午餐</label>
                  </div>
                  {addBreakfast && (
                    <select
                      value={breakfastCount}
                      onChange={(e) => setBreakfastCount(Number(e.target.value))}
                      className="text-xs bg-white border border-orange-200 rounded px-2 py-1 outline-none text-gray-700"
                    >
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>{num} 人</option>
                      ))}
                    </select>
                  )}
                </div>
                {addBreakfast && (
                  <div className="text-right border-t border-orange-100 pt-2 mt-2">
                    <span className="text-xs text-gray-400 block">+ NT$ {breakfastPrice} × {breakfastCount} 人 × {getDiffDays(checkIn, checkOut)} 晚</span>
                    <span className="text-xs font-bold text-orange-600">
                      總計 +NT$ {(breakfastPrice * breakfastCount * getDiffDays(checkIn, checkOut)).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Button fullWidth onClick={() => handleCreateBooking(showBookingModal)}>確認預約 (共 {getDiffDays(checkIn, checkOut)} 晚)</Button>
                <Button fullWidth variant="ghost" onClick={() => setShowBookingModal(null)}>取消</Button>
              </div>
            </div>
          </div>
        )}
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Header
        title="商家管理中心"
        subtitle="Serenity Stay Manager (中文版)"
        rightAction={<div className="text-[10px] font-black bg-black text-white px-2 py-1 rounded uppercase tracking-tighter">管理員</div>}
      />
      <HostLayout
        bookings={bookings}
        rooms={rooms} // Use dynamic rooms state
        physicalRooms={physicalRooms}
        onAction={handleHostAction}
        onToggleRoom={handleTogglePhysicalRoom}
        onUpdateRoom={handleUpdateRoom}
        onCreateRoom={handleCreateRoom}
        onDeleteRoom={handleDeleteRoom}
        breakfastPrice={breakfastPrice}
        onUpdateBreakfastPrice={setBreakfastPrice}
      />
    </ScreenContainer>
  );
}