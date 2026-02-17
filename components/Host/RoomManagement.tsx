import React, { useState } from 'react';
import { Room } from '../../types';
import { Button, Card, Icons } from '../../ui';

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
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const handleEdit = (room: Room) => {
        setEditingRoom({ ...room });
        setIsCreating(false);
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
            images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80'],
            tags: [],
            amenities: []
        });
        setIsCreating(true);
    };

    const handleSave = () => {
        if (!editingRoom) return;

        if (isCreating) {
            onCreateRoom(editingRoom);
        } else {
            onUpdateRoom(editingRoom);
        }
        setEditingRoom(null);
        setIsCreating(false);
    };

    const handleDelete = (roomId: string) => {
        if (window.confirm('確定要刪除此房型嗎？此動作無法復原。')) {
            onDeleteRoom(roomId);
        }
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
            <div className="grid grid-cols-1 gap-4">
                {rooms.map(room => (
                    <Card key={room.id} className="p-4 flex gap-4">
                        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{room.name}</h3>
                                    <p className="text-sm text-gray-500">{room.floorLocation} | {room.maxGuests}人 | {room.sizeSqm}坪</p>
                                    <p className="text-xs text-gray-400 line-clamp-1 mt-1">{room.description}</p>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-green-600">NT$ {room.priceWeekday}</span>
                                    <span className="text-[10px] text-gray-400">平日價格</span>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end gap-2">
                                <Button
                                    variant="secondary"
                                    className="text-xs py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100"
                                    onClick={() => handleEdit(room)}
                                >
                                    <Icons.Settings className="w-3 h-3 mr-1 inline" /> 編輯
                                </Button>
                                <Button
                                    variant="secondary"
                                    className="text-xs py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border-red-100"
                                    onClick={() => handleDelete(room.id)}
                                >
                                    刪除
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Edit/Create Modal */}
            {editingRoom && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10">
                            <h3 className="font-bold text-lg">{isCreating ? '新增房型' : '編輯房型'}</h3>
                            <button onClick={() => setEditingRoom(null)} className="text-gray-400 hover:text-gray-600">
                                ✕
                            </button>
                        </div>

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
                                <label className="block text-sm font-bold text-gray-700 mb-1">最大人數</label>
                                <input
                                    type="number"
                                    value={editingRoom.maxGuests}
                                    onChange={e => setEditingRoom({ ...editingRoom, maxGuests: Number(e.target.value) })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
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
                                <label className="block text-sm font-bold text-gray-700 mb-2">設施標籤</label>
                                <div className="flex flex-wrap gap-2">
                                    {['電視', '快煮壺', '沙發', '浴缸', '咖啡耳掛包', 'WIFI'].map(tag => {
                                        const isSelected = editingRoom.amenities?.includes(tag);
                                        return (
                                            <button
                                                key={tag}
                                                onClick={() => {
                                                    const current = editingRoom.amenities || [];
                                                    const newAmenities = isSelected
                                                        ? current.filter(t => t !== tag)
                                                        : [...current, tag];
                                                    setEditingRoom({ ...editingRoom, amenities: newAmenities });
                                                }}
                                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${isSelected
                                                    ? 'bg-black text-white border-black'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                {isSelected ? '✓ ' : '+ '}{tag}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">圖片 (最多 6 張)</label>
                                <div className="grid grid-cols-3 gap-2">
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
                                                            className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs backdrop-blur-sm transition-colors"
                                                        >
                                                            ✕
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            const newImages = [...editingRoom.images];
                                                            // Mock upload: Add default image
                                                            newImages.push('https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80');
                                                            setEditingRoom({ ...editingRoom, images: newImages });
                                                        }}
                                                        className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors gap-1"
                                                    >
                                                        <span className="text-2xl">+</span>
                                                        <span className="text-[10px]">上傳圖片</span>
                                                    </button>
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
        </div>
    );
};
