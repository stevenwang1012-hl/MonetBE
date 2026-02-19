import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Room } from '../../types';
import { Button, Icons } from '../../ui';

interface Discount {
    id: string;
    room_type_id: string;
    start_date: string;
    end_date: string;
    discount_value: number; // Percentage off, e.g. 10
    name?: string;
    is_active: boolean;
}

interface DiscountManagementProps {
    rooms: Room[];
}

export const DiscountManagement: React.FC<DiscountManagementProps> = ({ rooms }) => {
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || '');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [discountValue, setDiscountValue] = useState<number>(10);
    const [discountName, setDiscountName] = useState('');

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const fetchDiscounts = async () => {
        try {
            const { data, error } = await supabase
                .from('room_discounts')
                .select('*')
                .order('start_date', { ascending: true });

            if (error) throw error;
            setDiscounts(data || []);
        } catch (error) {
            console.error('Error fetching discounts:', error);
            alert('載入優惠列表失敗');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddDiscount = async () => {
        if (!startDate || !endDate || !selectedRoomId) {
            alert('請完整填寫資料');
            return;
        }

        if (discountValue <= 0 || discountValue >= 100) {
            alert('折扣比例必須介於 1% ~ 99%');
            return;
        }

        try {
            const { error } = await supabase.from('room_discounts').insert([{
                room_type_id: selectedRoomId,
                start_date: startDate,
                end_date: endDate,
                discount_value: discountValue,
                name: discountName || `${discountValue}% Off`,
                is_active: true
            }]);

            if (error) throw error;

            alert('新增成功！');
            setIsAdding(false);
            setDiscountName('');
            fetchDiscounts();
        } catch (error: any) {
            console.error('Error adding discount:', error);
            alert('新增失敗: ' + error.message);
        }
    };

    const handleDeleteDiscount = async (id: string) => {
        if (!window.confirm('確定要刪除此優惠嗎？')) return;

        try {
            const { error } = await supabase.from('room_discounts').delete().eq('id', id);
            if (error) throw error;
            fetchDiscounts();
        } catch (error) {
            console.error('Error deleting discount:', error);
            alert('刪除失敗');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">優惠活動管理</h2>
                <Button onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? '取消新增' : '新增優惠'}
                </Button>
            </div>

            {isAdding && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <h3 className="font-bold text-lg">新增優惠規則</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">適用房型</label>
                            <select
                                className="w-full p-2 border rounded-lg"
                                value={selectedRoomId}
                                onChange={e => setSelectedRoomId(e.target.value)}
                            >
                                {rooms.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">活動名稱 (選填)</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                placeholder="例：夏日特賣"
                                value={discountName}
                                onChange={e => setDiscountName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">開始日期</label>
                            <input
                                type="date"
                                className="w-full p-2 border rounded-lg cursor-pointer"
                                value={startDate}
                                onClick={(e) => {
                                    try {
                                        e.currentTarget.showPicker();
                                    } catch (err) { }
                                }}
                                onChange={e => setStartDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">結束日期</label>
                            <input
                                type="date"
                                className="w-full p-2 border rounded-lg cursor-pointer"
                                value={endDate}
                                onClick={(e) => {
                                    try {
                                        e.currentTarget.showPicker();
                                    } catch (err) { }
                                }}
                                onChange={e => setEndDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">折扣比例 (% Off)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded-lg"
                                    min="1" max="99"
                                    value={discountValue}
                                    onChange={e => setDiscountValue(Number(e.target.value))}
                                />
                                <span className="text-gray-500 whitespace-nowrap">% Off (等於 {(100 - discountValue) / 10} 折)</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button onClick={handleAddDiscount}>儲存優惠</Button>
                    </div>
                </div>
            )}

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="p-4">活動名稱</th>
                                <th className="p-4">適用房型</th>
                                <th className="p-4">日期範圍</th>
                                <th className="p-4">折扣內容</th>
                                <th className="p-4 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-400">載入中...</td></tr>
                            ) : discounts.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-400">目前沒有優惠活動</td></tr>
                            ) : (
                                discounts.map(d => {
                                    const roomName = rooms.find(r => r.id === d.room_type_id)?.name || '未知房型';
                                    return (
                                        <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 font-medium">{d.name}</td>
                                            <td className="p-4 text-gray-600">{roomName}</td>
                                            <td className="p-4 text-gray-600">
                                                {d.start_date} ~ {d.end_date}
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">
                                                    -{d.discount_value}%
                                                </span>
                                                <span className="text-gray-400 text-xs ml-2">({(100 - d.discount_value) / 10}折)</span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteDiscount(d.id)}
                                                    className="text-red-500 hover:text-red-700 p-2"
                                                >
                                                    <Icons.Trash className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-400">載入中...</div>
                ) : discounts.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">目前沒有優惠活動</div>
                ) : (
                    discounts.map(d => {
                        const roomName = rooms.find(r => r.id === d.room_type_id)?.name || '未知房型';
                        return (
                            <div key={d.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-gray-900">{d.name}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">{roomName}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">
                                            -{d.discount_value}%
                                        </span>
                                        <span className="text-gray-400 text-[10px] mt-0.5">({(100 - d.discount_value) / 10}折)</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-sm">
                                    <div className="flex items-center gap-1.5 text-gray-500">
                                        <Icons.Calendar className="w-4 h-4" />
                                        <span className="text-xs">{d.start_date} ~ {d.end_date}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteDiscount(d.id)}
                                        className="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                    >
                                        刪除
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
