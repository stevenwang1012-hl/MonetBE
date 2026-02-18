import React, { useState, useEffect } from 'react';
import { Room } from '../../types';
import { Button, Card, Icons } from '../../ui';
import { supabase } from '../../supabase';

export const RoomManagement = ({
    rooms,
    onUpdateRoom,
    onCreateRoom,
    onDeleteRoom,
    breakfastPrice,
    onUpdateBreakfastPrice
}: {
    rooms: Room[],
    onUpdateRoom: (room: Room) => void,
    onCreateRoom: (room: Room) => void,
    onDeleteRoom: (roomId: string) => void,
    breakfastPrice: number,
    onUpdateBreakfastPrice: (price: number) => void
}) => {
    const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Clear status message after 3 seconds
    useEffect(() => {
        if (statusMsg) {
            const timer = setTimeout(() => setStatusMsg(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [statusMsg]);

    const handleEdit = (room: Room) => {
        setEditingRoom({ ...room });
        setIsCreating(false);
        setStatusMsg(null);
    };

    const handleCreate = () => {
        setEditingRoom({
            id: `room_${Date.now()}`,
            name: '',
            description: '',
            floorLocation: '樓下',
            maxGuests: 2,
            bedConfig: '',
            sizeSqm: 20,
            priceWeekday: 2000,
            priceHoliday: 2400,
            priceCny: 4000,
            price: 2000,
            images: [], // Default empty
            tags: [],
            amenities: []
        });
        setIsCreating(true);
        setStatusMsg(null);
    };

    const handleSave = async () => {
        if (!editingRoom) return;

        // Optimistic UI Update (or wait for reload)
        // Ideally we should move this logic to a service or context, but for MVP here is fine.

        try {
            // Upsert room type
            const { error } = await supabase
                .from('room_types')
                .upsert({
                    id: editingRoom.id,
                    name: editingRoom.name,
                    description: editingRoom.description,
                    floor_location: editingRoom.floorLocation,
                    max_guests: editingRoom.maxGuests,
                    bed_config: editingRoom.bedConfig || '', // Schema requires string
                    size_sqm: editingRoom.sizeSqm,
                    price_weekday: editingRoom.priceWeekday,
                    price_holiday: editingRoom.priceHoliday,
                    price_cny: editingRoom.priceCny,
                    amenities: editingRoom.amenities,
                    specs: editingRoom.specs, // Add specs
                    image_url: JSON.stringify(editingRoom.images) // Store array as JSON string
                });

            if (error) throw error;

            // Handle Physical Rooms (roomNumbers)
            // Strategy: Check existing, add new ones. 
            // For MVP: We only ADD new room numbers if they don't exist in `rooms` table for this type.
            // Removing room numbers usually requires checking bookings, so let's keep it simple: Add Only.
            if (editingRoom.roomNumbers && editingRoom.roomNumbers.length > 0) {
                for (const num of editingRoom.roomNumbers) {
                    await supabase.from('rooms').upsert({
                        room_number: num,
                        room_type_id: editingRoom.id,
                        is_active: true
                    });
                }
            }


            setStatusMsg({ type: 'success', text: '儲存成功！' });
            // Call parent update to refresh list in UI
            if (isCreating) {
                onCreateRoom({ ...editingRoom });
            } else {
                onUpdateRoom({ ...editingRoom });
            }

            // Close modal after a short delay to show success message
            setTimeout(() => {
                setEditingRoom(null);
                setIsCreating(false);
            }, 1000);

        } catch (err) {
            console.error('Error saving room:', err);
            setStatusMsg({ type: 'error', text: '儲存失敗，請重試。' });
        }
    };

    // Use custom modal instead of window.confirm
    const handleDeleteClick = (roomId: string) => {
        setDeletingRoomId(roomId);
    };

    return (
        <div className="space-y-6 pb-32">

            {/* Breakfast Settings */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg text-gray-900 mb-4">全局設定</h3>
                <div className="flex items-center gap-4">
                    <label className="text-sm font-bold text-gray-600">早餐加購價格 (人/晚)</label>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">NT$</span>
                        <input
                            type="number"
                            value={breakfastPrice}
                            onChange={(e) => onUpdateBreakfastPrice(Number(e.target.value))}
                            className="border border-gray-300 rounded px-2 py-1 w-24 text-right font-bold text-gray-800"
                        />
                    </div>
                </div>
            </div>

            {/* Room List header */}
            <div className="flex items-center justify-between">
                <h2 className="font-bold text-xl text-gray-900">房型管理 ({rooms.length})</h2>
                <Button onClick={handleCreate} className="bg-black text-white px-4 py-2 text-sm rounded-lg hover:bg-gray-800">
                    + 新增房型
                </Button>
            </div>

            {/* Room List grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {rooms.map(room => (
                    <Card key={room.id} className="p-3 flex flex-col items-stretch h-full hover:shadow-md transition-shadow">
                        {/* Mobile: Top Image / Desktop: Left Image */}
                        <div className="flex flex-col sm:flex-row gap-3 h-full">
                            <div className="w-full h-32 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative group">
                                <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="min-w-0 flex-1 mr-2">
                                        <h3 className="font-bold text-base text-gray-900 truncate">{room.name}</h3>
                                        {/* Display Specs with | separator if spaces are used, or just as is */}
                                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                                            {room.specs ? room.specs.replace(/\s+/g, ' | ') : `${room.maxGuests}人房`}
                                        </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <span className="block font-bold text-green-600 text-sm">NT$ {room.priceWeekday.toLocaleString()}</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-400 line-clamp-2 mb-auto">{room.description}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-auto pt-4 flex gap-3">
                            <Button
                                variant="secondary"
                                className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold border-0 shadow-none"
                                onClick={() => handleEdit(room)}
                            >
                                編輯
                            </Button>
                            <Button
                                variant="secondary"
                                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold border-0 shadow-none"
                                onClick={() => handleDeleteClick(room.id)}
                            >
                                刪除
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Edit/Create Modal */}
            {editingRoom && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-lg">{isCreating ? '新增房型' : '編輯房型'}</h3>
                                {statusMsg && (
                                    <span className={`text-xs px-2 py-1 rounded-full ${statusMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {statusMsg.text}
                                    </span>
                                )}
                            </div>
                            <button onClick={() => setEditingRoom(null)} className="text-gray-400 hover:text-gray-600">
                                ✕
                            </button>
                        </div>

                        {/* ... (Form Content - keeping existing logic but ensuring it's robust) ... */}
                        {/* Note: In a real refactor I would copy the whole form, but here I am just ensuring the wrapper is correct. 
                            Wait, I need to output the WHOLE modal content if I replace this block. 
                            Actually, the user asked for "layout fix" in the LIST. 
                            I will focus on the LIST updates and the NEW Modal.
                            I will replace the whole return statement to be safe and clean.
                        */}
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">房型名稱</label>
                                <input
                                    type="text"
                                    value={editingRoom.name}
                                    onChange={e => setEditingRoom({ ...editingRoom, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">描述</label>
                                <textarea
                                    value={editingRoom.description}
                                    onChange={e => setEditingRoom({ ...editingRoom, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">房號管理 (用逗號隔開，例如: 201,202)</label>
                                <input
                                    type="text"
                                    value={editingRoom.roomNumbers?.join(',') || ''}
                                    onChange={e => setEditingRoom({ ...editingRoom, roomNumbers: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm"
                                    placeholder="201, 202, 203"
                                />
                                <p className="text-xs text-gray-400 mt-1">這些房號將會顯示在實時看板供您管理</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">房間規格 (顯示於標題下方)</label>
                                    <input
                                        type="text"
                                        value={editingRoom.specs || ''}
                                        onChange={e => setEditingRoom({ ...editingRoom, specs: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        placeholder="例如: 樓下 30坪 (空白自動以 | 分隔)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">最大人數 (系統過濾用)</label>
                                    <input
                                        type="number"
                                        value={editingRoom.maxGuests}
                                        onChange={e => setEditingRoom({ ...editingRoom, maxGuests: Number(e.target.value) })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">平日價格</label>
                                    <input
                                        type="number"
                                        value={editingRoom.priceWeekday}
                                        onChange={e => setEditingRoom({ ...editingRoom, priceWeekday: Number(e.target.value), price: Number(e.target.value) })}
                                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">假日價格</label>
                                    <input
                                        type="number"
                                        value={editingRoom.priceHoliday}
                                        onChange={e => setEditingRoom({ ...editingRoom, priceHoliday: Number(e.target.value) })}
                                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">過年價格</label>
                                    <input
                                        type="number"
                                        value={editingRoom.priceCny}
                                        onChange={e => setEditingRoom({ ...editingRoom, priceCny: Number(e.target.value) })}
                                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">設施標籤 (可自行新增)</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {editingRoom.amenities?.map((tag) => (
                                        <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-xs font-bold rounded-full">
                                            {tag}
                                            <button
                                                onClick={() => {
                                                    const newAmenities = editingRoom.amenities?.filter(t => t !== tag) || [];
                                                    setEditingRoom({ ...editingRoom, amenities: newAmenities });
                                                }}
                                                className="hover:text-red-300 ml-1"
                                            >
                                                ✕
                                            </button>
                                        </span>
                                    ))}
                                </div>

                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        id="custom-amenity"
                                        placeholder="輸入設施名稱"
                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const val = e.currentTarget.value.trim();
                                                if (val && !editingRoom.amenities?.includes(val)) {
                                                    setEditingRoom({ ...editingRoom, amenities: [...(editingRoom.amenities || []), val] });
                                                    e.currentTarget.value = '';
                                                }
                                            }
                                        }}
                                    />
                                    <Button
                                        variant="secondary"
                                        className="px-4 py-2 bg-gray-100 text-gray-700 font-bold"
                                        onClick={() => {
                                            const input = document.getElementById('custom-amenity') as HTMLInputElement;
                                            const val = input.value.trim();
                                            if (val && !editingRoom.amenities?.includes(val)) {
                                                setEditingRoom({ ...editingRoom, amenities: [...(editingRoom.amenities || []), val] });
                                                input.value = '';
                                            }
                                        }}
                                    >
                                        新增
                                    </Button>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <span className="text-xs text-gray-400 flex items-center">快速選擇:</span>
                                    {['電視', '快煮壺', '沙發', '浴缸', '咖啡耳掛包', 'WIFI', '冰箱'].map(tag => {
                                        const isSelected = editingRoom.amenities?.includes(tag);
                                        if (isSelected) return null; // Don't show if already added
                                        return (
                                            <button
                                                key={tag}
                                                onClick={() => setEditingRoom({ ...editingRoom, amenities: [...(editingRoom.amenities || []), tag] })}
                                                className="px-3 py-1 bg-white border border-gray-200 text-gray-500 text-xs rounded-full hover:bg-gray-50 transition-colors"
                                            >
                                                + {tag}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    圖片 (最多 6 張) <span className="text-xs text-gray-400 font-normal ml-2">(建議尺寸 1200x900, 2MB 以內)</span>
                                </label>
                                {/* Image Upload Logic (Simplified for brevity in this replace block, but essentially same as before) */}
                                <div className="grid grid-cols-3 gap-2">
                                    <input
                                        type="file"
                                        id="room-image-upload"
                                        accept="image/*"
                                        className="hidden"
                                        disabled={isUploading}
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            setIsUploading(true);
                                            try {
                                                const fileExt = file.name.split('.').pop();
                                                const fileName = `${Date.now()}.${fileExt}`;
                                                const { error: uploadError } = await supabase.storage.from('room-images').upload(fileName, file);
                                                if (uploadError) throw uploadError;
                                                const { data } = supabase.storage.from('room-images').getPublicUrl(fileName);
                                                if (data) {
                                                    setEditingRoom(prev => prev ? ({ ...prev, images: [...prev.images, data.publicUrl] }) : null);
                                                }
                                            } catch (error) {
                                                console.error('Upload error', error);
                                                setStatusMsg({ type: 'error', text: '上傳失敗' });
                                            } finally {
                                                setIsUploading(false);
                                            }
                                        }}
                                    />
                                    {[0, 1, 2, 3, 4, 5].map((index) => {
                                        const image = editingRoom.images[index];
                                        return (
                                            <div key={index} className="aspect-square rounded-lg border border-gray-200 overflow-hidden relative bg-gray-50">
                                                {image ? (
                                                    <>
                                                        <img src={image} alt={`Room ${index + 1}`} className="w-full h-full object-cover" />
                                                        <button
                                                            onClick={() => {
                                                                const newImages = [...editingRoom.images];
                                                                newImages.splice(index, 1);
                                                                setEditingRoom({ ...editingRoom, images: newImages });
                                                            }}
                                                            className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs backdrop-blur-sm"
                                                        >
                                                            ✕
                                                        </button>
                                                    </>
                                                ) : (
                                                    <label htmlFor="room-image-upload" className="w-full h-full flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100">
                                                        {isUploading && index === editingRoom.images.length ? (
                                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                                                        ) : (
                                                            <span className="text-2xl">+</span>
                                                        )}
                                                    </label>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 flex gap-3">
                            <Button
                                variant="secondary"
                                className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                                onClick={() => setEditingRoom(null)}
                            >
                                取消
                            </Button>
                            <Button
                                className="flex-1 bg-black text-white hover:bg-gray-800"
                                onClick={handleSave}
                            >
                                {isCreating ? '新增' : '儲存變更'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            {deletingRoomId && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                            <Icons.AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">確定要刪除此房型嗎？</h3>
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                            此動作無法復原。刪除後，相關的房型資料將會從系統中移除。
                        </p>
                        <div className="flex w-full gap-3">
                            <Button
                                variant="secondary"
                                fullWidth
                                className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                                onClick={() => setDeletingRoomId(null)}
                            >
                                取消
                            </Button>
                            <Button
                                fullWidth
                                className="bg-red-600 text-white hover:bg-red-700 shadow-red-200"
                                onClick={() => {
                                    onDeleteRoom(deletingRoomId);
                                    setDeletingRoomId(null);
                                }}
                            >
                                確定刪除
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
