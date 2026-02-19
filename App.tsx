import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { User, UserRole, Booking, BookingStatus, Room, PhysicalRoom } from './types';
import { MOCK_USER_GUEST, MOCK_USER_HOST, ROOMS, INITIAL_BOOKINGS, INITIAL_PHYSICAL_ROOMS } from './constants';
import { Button, ScreenContainer, Header, Icons } from './ui';
import { getDiffDays, calculateTotalPrice } from './utils';
import { migrateRoomsToSupabase } from './utils/migration';

// Components
import liff from '@line/liff';

// Components
import { LoginScreen } from './components/LoginScreen';
import { RoomList, GuestHistory } from './components/GuestView';
import { HostLayout } from './components/Host/HostLayout';

// --- Main App ---
export default function App() {
  // --- State ---
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'explore' | 'trips'>('explore');

  // Date State
  const [checkIn, setCheckIn] = useState<string>(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState<string>(new Date(Date.now() + 172800000).toISOString().split('T')[0]);

  // Data State
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [roomOccupancy, setRoomOccupancy] = useState<Record<string, boolean>>({});
  const [breakfastPrice, setBreakfastPrice] = useState<number>(220);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // --- Initial Data Fetching (Supabase) ---
  const fetchRooms = async () => {
    try {
      // 1. Fetch Room Types
      const { data: roomTypes, error: rtError } = await supabase.from('room_types').select('*');
      if (rtError) throw rtError;

      // 2. Fetch Physical Rooms
      const { data: physicalRooms, error: rError } = await supabase.from('rooms').select('*');
      if (rError) throw rError;

      if (roomTypes && roomTypes.length > 0) {
        // Transform DB data to App types
        const formattedRooms: Room[] = roomTypes.map((rt: any) => {
          const associatedRooms = physicalRooms?.filter((r: any) => r.room_type_id === rt.id) || [];
          return {
            id: rt.id,
            name: rt.name,
            floorLocation: rt.floor_location,
            maxGuests: rt.max_guests,
            bedConfig: rt.bed_config,
            sizeSqm: rt.size_sqm,
            priceWeekday: rt.price_weekday,
            priceHoliday: rt.price_holiday,
            priceCny: rt.price_cny,
            price: rt.price_weekday, // Default to weekday
            description: rt.description,
            specs: rt.specs || '', // Map new specs field
            images: (() => {
              if (!rt.image_url) return [];
              try {
                const parsed = JSON.parse(rt.image_url);
                return Array.isArray(parsed) ? parsed : [rt.image_url];
              } catch {
                return [rt.image_url];
              }
            })(),
            amenities: rt.amenities || [],
            roomNumbers: associatedRooms.map((r: any) => r.room_number)
          };
        });
        setRooms(formattedRooms);
      } else {
        // Fallback or Migration Trigger
        setRooms(ROOMS);
      }

    } catch (error) {
      console.error('Error fetching rooms:', error);
      // Fallback
      const savedRooms = localStorage.getItem('monetBB_rooms');
      if (savedRooms) setRooms(JSON.parse(savedRooms));
    }
  };

  const fetchBookings = async (currentUser?: User | null) => {
    // Resolve user: passed arg -> state -> null
    const targetUser = currentUser !== undefined ? currentUser : user;

    try {
      let formattedBookings: Booking[] = [];

      if (targetUser?.role === UserRole.HOST) {
        // HOST: Full Access (via RLS)
        const { data: bookingsData, error: bError } = await supabase.from('bookings').select('*');
        if (bError) throw bError;

        if (bookingsData) {
          formattedBookings = bookingsData.map((b: any) => ({
            id: b.id,
            roomId: b.room_type_id,
            userId: b.user_id,
            guestName: b.guest_name,
            date: b.check_in_date,
            endDate: b.check_out_date,
            status: b.status,
            createdAt: new Date(b.created_at).getTime(),
            assignedPhysicalRoom: b.assigned_room_number || undefined,
            hasBreakfast: false,
            breakfastCount: 0,
            totalPrice: 0
          }));
        }
      } else {
        // GUEST OR ANONYMOUS: Restricted Access via RPC

        // 1. Fetch Availability (Anonymized)
        const { data: calendarData, error: cError } = await supabase.rpc('get_calendar_events');
        if (cError) throw cError;

        if (calendarData) {
          formattedBookings = calendarData.map((b: any) => ({
            id: `anon_${Math.random().toString(36).substr(2, 9)}`, // Fake ID to prevent actions
            roomId: b.room_type_id,
            userId: 'anonymous',
            guestName: 'Reserved',
            date: b.check_in_date,
            endDate: b.check_out_date,
            status: b.status,
            createdAt: 0,
            assignedPhysicalRoom: undefined,
            hasBreakfast: false,
            breakfastCount: 0,
            totalPrice: 0
          }));
        }

        // 2. Fetch "My Trips" (If Guest Logged In)
        if (targetUser?.role === UserRole.GUEST && targetUser.lineId) {
          const { data: myData, error: myError } = await supabase.rpc('get_user_bookings', { line_user_id: targetUser.lineId });
          if (myError) throw myError;

          if (myData) {
            const myBookings = myData.map((b: any) => ({
              id: b.id,
              roomId: b.room_type_id,
              userId: b.user_id,
              guestName: b.guest_name,
              date: b.check_in_date,
              endDate: b.check_out_date,
              status: b.status,
              createdAt: new Date(b.created_at).getTime(),
              assignedPhysicalRoom: b.assigned_room_number || undefined,
              hasBreakfast: false,
              breakfastCount: 0,
              totalPrice: 0
            }));
            // Combine: My Trips + Anonymous Availability
            formattedBookings = [...formattedBookings, ...myBookings];
          }
        }
      }

      setBookings(formattedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  // --- Auth Initialization ---
  useEffect(() => {
    const initAuth = async () => {
      setIsAuthChecking(true);
      // 1. Check Supabase (Host Session)
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await checkHostAccess(session.user);
        setIsAuthChecking(false);
        return;
      }

      // 2. Check Host Mode URL
      const isHostMode = new URLSearchParams(window.location.search).get('role') === 'host';
      if (isHostMode) {
        // Stay logged out to show LoginScreen
        setIsAuthChecking(false);
        return;
      }

      // 3. Init LIFF (Auto Login for LINE Browser)
      try {
        const LIFF_ID = import.meta.env.VITE_LINE_LIFF_ID;
        if (LIFF_ID) {
          await liff.init({ liffId: LIFF_ID });

          if (liff.isLoggedIn()) {
            // Already logged in (Desktop with cookie, or LINE App)
            const profile = await liff.getProfile();
            handleLogin(UserRole.GUEST, profile);
          } else if (liff.isInClient()) {
            // In LINE App but not logged in? Force login to ensure "Auto Login" experience
            // This will trigger the LINE consent screen if first time, or auto-login if authorized
            liff.login({ redirectUri: window.location.href });
            return; // Stop here, redirect will happen
          } else {
            // Desktop / External Browser AND Not Logged In
            // Show Login Screen (User explicitly requested this distinction)
          }
        } else {
          console.warn('VITE_LINE_LIFF_ID not found');
        }
      } catch (e) {
        console.error('LIFF Init Failed:', e);
        // On error, let them see Login Screen so they aren't stuck on white screen
      } finally {
        setIsAuthChecking(false);
      }
    };

    initAuth();

    // Supabase Auth Listener (Host)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        checkHostAccess(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkHostAccess = async (authUser: any) => {
    try {
      const { data, error } = await supabase
        .from('authorized_hosts')
        .select('email')
        .eq('email', authUser.email)
        .single();

      if (data) {
        console.log('Host Access Granted via DB:', authUser.email);
        setUser({
          id: authUser.id,
          name: authUser.user_metadata?.full_name || 'Host',
          role: UserRole.HOST,
          avatar: authUser.user_metadata?.avatar_url
        });
        setActiveTab('dashboard');
      } else {
        console.log('Access Denied: Email not in authorized_hosts', authUser.email);
        alert('您的帳號沒有管理員權限');
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('Error checking host access:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await fetchRooms();
        await fetchBookings(user);
      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    // Removed Supabase Auth Listener (Using LIFF for now)
  }, [user]); // Re-fetch when user role/identity changes

  // --- Realtime Subscription (Simplified Reuse) ---
  // Ideally use supabase.channel here to listen for changes
  useEffect(() => {
    const channel = supabase.channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          console.log('Change received!', payload);
          // Simple re-fetch strategy for V1
          // In production, update state incrementally
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const [showBookingModal, setShowBookingModal] = useState<Room | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addBreakfast, setAddBreakfast] = useState<boolean>(false);
  const [breakfastCount, setBreakfastCount] = useState<number>(1);

  const handleLogin = (role: UserRole, profile?: any) => {
    if (role === UserRole.HOST) {
      setUser(MOCK_USER_HOST);
      setActiveTab('dashboard');
    } else {
      // LIFF Login Success
      if (profile) {
        const newUser: User = {
          id: profile.userId,
          name: profile.displayName,
          avatar: profile.pictureUrl,
          role: UserRole.GUEST,
          lineId: profile.userId
        };
        setUser(newUser);
      } else {
        // Fallback guest
        setUser(MOCK_USER_GUEST);
      }
      setActiveTab('explore');
    }
  };

  const handleCreateBooking = async (room: Room) => {
    if (!user) return;
    const newBooking = {
      // id: auto-generated by DB
      room_type_id: room.id,
      user_id: user.id,
      guest_name: user.name,
      check_in_date: checkIn,
      check_out_date: checkOut,
      status: BookingStatus.PENDING,
      // created_at: auto
    };

    const { error } = await supabase.from('bookings').insert([newBooking]);
    if (error) {
      console.error('Error creating booking:', error);
      alert('預約失敗，請稍後再試');
      return;
    }

    // Optimistic Update or Refetch?
    // For now, let's just alert success. The Realtime subscription should ideally handle the update,
    // but we haven't implemented full realtime sync logic for state yet.
    // Let's manually fetch or just force reload for V1 prototype.
    // Let's manually fetch or just force reload for V1 prototype.
    // alert('預約申請已送出！'); // Replaced with modal
    await fetchBookings(); // Refresh bookings to get the new ID and status
    setShowBookingModal(null);
    setShowSuccessModal(true);
    setActiveTab('trips');
    // window.location.reload(); // Temporary force refresh to see data
  };

  const handleTogglePhysicalRoom = async (roomNumber: string, date: string) => {
    if (!user) return;

    // Check availability for this specific room and date
    // Note: This logic duplicates some server-side or complex checking, simplified for V1
    const targetRoom = rooms.find(r => r.roomNumbers?.includes(roomNumber));
    if (!targetRoom) return;

    // Check if there is an existing booking for this physical room that overlaps with the target date
    // Overlap: Start <= TargetDate < End
    // We only care about the single date for the dashboard toggle
    const nextDay = new Date(new Date(date).getTime() + 86400000).toISOString().split('T')[0];

    // Find blocking booking
    const blockingBooking = bookings.find(b =>
      b.assignedPhysicalRoom === roomNumber &&
      b.status !== BookingStatus.CANCELLED &&
      b.date <= date && b.endDate > date
    );

    if (blockingBooking) {
      // If it's a manual block (e.g. created by host or marked as BLOCKED)
      // For V1, we assume if the host clicks a 'BLOCKED' room, they want to unblock it.
      // If they click a 'GUEST' booking, maybe show details? For now, prevent toggling guest bookings easily or ask confirmation.

      if (blockingBooking.status === BookingStatus.BLOCKED) {
        // Unblock: Delete or Cancel
        const { error } = await supabase.from('bookings').delete().eq('id', blockingBooking.id);
        if (error) {
          console.error('Error unblocking room:', error);
          alert('解除鎖定失敗');
          return;
        }
      } else {
        alert('此房間已有房客預約，無法直接解除鎖定。請至訂單管理操作。');
        return;
      }

    } else {
      // Block the room
      const newBlock = {
        user_id: user.id,
        room_type_id: targetRoom.id,
        guest_name: '手動鎖房',
        check_in_date: date,
        check_out_date: nextDay, // 1 night block
        status: BookingStatus.BLOCKED,
        assigned_room_number: roomNumber
      };

      const { error } = await supabase.from('bookings').insert([newBlock]);
      if (error) {
        console.error('Error blocking room:', error);
        alert('鎖定失敗');
        return;
      }
    }

    await fetchBookings();
  };

  const handleHostAction = async (bookingId: string, action: 'confirm' | 'checkin' | 'reject' | 'pay', assignedRoom?: string) => {
    let updates: any = {};
    if (action === 'confirm' && assignedRoom) {
      updates = { status: BookingStatus.CONFIRMED, assigned_room_number: assignedRoom };
    } else if (action === 'checkin') {
      updates = { status: BookingStatus.CHECKED_IN };
    } else if (action === 'reject') {
      updates = { status: BookingStatus.CANCELLED };
    } else if (action === 'pay') {
      updates = { status: BookingStatus.PAID };
    }

    try {
      const { error } = await supabase.from('bookings').update(updates).eq('id', bookingId);
      if (error) throw error;

      // Optimistic update
      setBookings(prev => prev.map(b => {
        if (b.id !== bookingId) return b;
        return {
          ...b,
          status: updates.status || b.status,
          assignedPhysicalRoom: updates.assigned_room_number || b.assignedPhysicalRoom
        };
      }));

      // Optional: Refetch to be safe
      // await fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('更新失敗');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase.from('bookings').update({ status: BookingStatus.CANCELLED }).eq('id', bookingId);
      if (error) throw error;

      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: BookingStatus.CANCELLED } : b
      ));
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('取消失敗');
    }
  };

  const handleUpdateRoom = async (updatedRoom: Room) => {
    // Optimistic Update Local State (optional, but good for responsiveness)
    setRooms(rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r));
    // Refetch to confirm consistency with DB triggers/defaults
    await fetchRooms();
  };

  const handleCreateRoom = async (newRoom: Room) => {
    // Refetch to get the correct list including the new one
    await fetchRooms();
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      const { error } = await supabase.from('room_types').delete().eq('id', roomId);
      if (error) throw error;

      // Refetch
      await fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('刪除失敗');
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="flex flex-col items-center animate-pulse">
          <div className="w-16 h-16 bg-gray-900 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
            <Icons.Home className="text-white w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">花蓮莫內花園咖啡農莊</h2>
          <p className="text-sm text-gray-400 font-medium">系統載入中...</p>
        </div>
      </div>
    );
  }

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
          {(() => {
            const isAnonymous = user.id === 'guest'; // specific ID for anonymous/guest fallbacks
            const AvatarIcon = isAnonymous ? (
              <button
                onClick={() => {
                  // Trigger LIFF Login
                  if (liff.isInClient() || !liff.isLoggedIn()) {
                    liff.login();
                  }
                }}
                className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-gray-800 transition-colors"
              >
                登入 / 註冊
              </button>
            ) : user.avatar ? (
              <img src={user.avatar} className="w-8 h-8 rounded-full bg-gray-200 border border-white shadow-sm object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 border border-white shadow-sm flex items-center justify-center">
                <Icons.User className="w-4 h-4 text-gray-500" />
              </div>
            );

            return (
              <Header
                title="花蓮莫內花園咖啡農莊"
                subtitle="花蓮縣壽豐鄉池南路一段138號"
                rightAction={AvatarIcon}
              />
            );
          })()}
        </div>

        {activeTab === 'explore' && (
          <div className="bg-white border-b border-gray-200 sticky top-[60px] z-40 shadow-sm px-4 py-3">
            {/* Single Row Compact Date Picker - Overlay Input for Max Touch Target */}
            <div className="bg-white rounded-full border border-gray-200 shadow-md px-4 flex items-center justify-between gap-2 h-11 w-full max-w-full relative">
              {/* Check-in Section */}
              <div className="flex items-center gap-2 flex-1 min-w-0 relative h-full justify-center">
                <div className="flex items-center gap-2 z-0 pointer-events-none">
                  <span className="text-[10px] text-gray-500 font-bold flex-shrink-0 whitespace-nowrap">入住</span>
                  <span className="text-sm font-bold text-gray-900 truncate">{checkIn.replace(/-/g, '/')}</span>
                </div>
                <input
                  type="date"
                  className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                  value={checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  onClick={(e) => {
                    try {
                      e.currentTarget.showPicker();
                    } catch (err) { }
                  }}
                  onChange={(e) => {
                    setCheckIn(e.target.value);
                    if (e.target.value >= checkOut) {
                      const nextDay = new Date(new Date(e.target.value).getTime() + 86400000).toISOString().split('T')[0];
                      setCheckOut(nextDay);
                    }
                  }}
                />
              </div>

              <div className="w-px h-4 bg-gray-300 flex-shrink-0"></div>

              {/* Check-out Section */}
              <div className="flex items-center gap-2 flex-1 min-w-0 relative h-full justify-center">
                <div className="flex items-center gap-2 z-0 pointer-events-none">
                  <span className="text-[10px] text-gray-500 font-bold flex-shrink-0 whitespace-nowrap">退房</span>
                  <span className="text-sm font-bold text-gray-900 truncate">{checkOut.replace(/-/g, '/')}</span>
                </div>
                <input
                  type="date"
                  className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                  value={checkOut}
                  min={new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0]}
                  onClick={(e) => {
                    try {
                      e.currentTarget.showPicker();
                    } catch (err) { }
                  }}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        <main className="pt-2">
          {activeTab === 'explore' ? (
            <RoomList rooms={rooms} bookings={bookings} onBook={setShowBookingModal} checkIn={checkIn} checkOut={checkOut} />
          ) : (
            <GuestHistory bookings={myBookings} rooms={rooms} onCancel={handleCancelBooking} />
          )}
        </main>

        <div className="fixed bottom-0 left-0 right-0 max-w-7xl mx-auto bg-white/90 backdrop-blur-lg border-t border-gray-200 pb-safe pt-2 px-6 flex justify-around items-center z-50 h-20 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
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
                {(() => {
                  const currentBookingRoom = rooms.find(r => r.id === showBookingModal.id) || showBookingModal;
                  return (
                    <>
                      <img src={currentBookingRoom.images[0]} className="w-20 h-20 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold truncate">{currentBookingRoom.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {currentBookingRoom.bedConfig}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {currentBookingRoom.amenities?.map((tag, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded border border-gray-200">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="text-gray-900 font-bold text-lg mt-1">
                          NT$ {calculateTotalPrice(checkIn, checkOut, currentBookingRoom, { hasBreakfast: addBreakfast, guests: breakfastCount }).toLocaleString()}
                        </p>
                      </div>
                    </>
                  );
                })()}
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

        {showSuccessModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-2xl transform transition-all scale-100 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                <Icons.Check className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">預約申請已送出！</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                管家收到通知後，將會主動聯繫您確認房號與匯款資訊。
              </p>
              <Button
                fullWidth
                className="bg-black text-white hover:bg-gray-800 rounded-xl"
                onClick={() => setShowSuccessModal(false)}
              >
                好的，我知道了
              </Button>
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
        rightAction={
          <div className="flex items-center gap-2">
            <div className="text-[10px] font-black bg-black text-white px-2 py-1 rounded uppercase tracking-tighter">管理員</div>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                setUser(null);
                window.location.reload();
              }}
              className="text-xs text-gray-500 hover:text-red-600 font-bold px-2"
            >
              登出
            </button>
          </div>
        }
      />
      <HostLayout
        bookings={bookings}
        rooms={rooms} // Use dynamic rooms state
        roomOccupancy={roomOccupancy}
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