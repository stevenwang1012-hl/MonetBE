import React, { useEffect, useState } from 'react';
import { UserRole } from '../types';
import { Button, Icons } from '../ui';
import { migrateRoomsToSupabase } from '../utils/migration';
import { supabase } from '../supabase';
import liff from '@line/liff';

interface LoginScreenProps {
    onLogin: (role: UserRole, userProfile?: any) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [liffError, setLiffError] = useState<string | null>(null);

    // Check URL query param for host login mode
    const isHostMode = new URLSearchParams(window.location.search).get('role') === 'host';

    const isInitialized = React.useRef(false);

    useEffect(() => {
        if (isInitialized.current) return;
        isInitialized.current = true;

        const initLiff = async () => {
            try {
                const LIFF_ID = import.meta.env.VITE_LINE_LIFF_ID || 'YOUR_LIFF_ID_HERE';
                if (LIFF_ID === 'YOUR_LIFF_ID_HERE') {
                    console.log('LIFF ID not set');
                    return;
                }

                console.log('Initializing LIFF...');
                await liff.init({ liffId: LIFF_ID });
                console.log('LIFF Initialized. isLoggedIn:', liff.isLoggedIn());

                // If in Host Mode, DO NOT auto-login as guest even if LIFF is persisted
                if (!isHostMode && liff.isLoggedIn()) {
                    const profile = await liff.getProfile();
                    console.log('LIFF Profile:', profile);
                    onLogin(UserRole.GUEST, profile);
                } else {
                    console.log('LIFF not logged in or in Host Mode');
                }
            } catch (error: any) {
                console.error('LIFF Init failed', error);
                setLiffError(error.message);
            }
        };

        if (import.meta.env.VITE_LINE_LIFF_ID) {
            initLiff();
        }
    }, [onLogin, isHostMode]);

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (error: any) {
            alert('Google 登入失敗: ' + error.message);
        }
    };

    const handleLineLogin = async () => {
        try {
            const LIFF_ID = import.meta.env.VITE_LINE_LIFF_ID;
            if (!LIFF_ID) {
                alert('請先設定 VITE_LINE_LIFF_ID (請見 .env.local)');
                return;
            }
            if (!liff.isInClient() && !liff.isLoggedIn()) {
                liff.login();
            } else if (liff.isLoggedIn()) {
                const profile = await liff.getProfile();
                onLogin(UserRole.GUEST, profile);
            }
        } catch (error: any) {
            alert('LINE 登入失敗: ' + error.message);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-gray-900 rounded-3xl mb-8 flex items-center justify-center shadow-2xl">
                <Icons.Home className="text-white w-12 h-12" />
            </div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Serenity Stay</h1>
            <p className="text-gray-500 mb-12">精緻民宿預約體驗</p>

            {liffError && (
                <div className="mb-4 text-red-500 text-sm bg-red-50 p-2 rounded">
                    LIFF Error: {liffError}. 請檢查設定。
                </div>
            )}

            <div className="w-full max-w-xs space-y-4">
                {isHostMode ? (
                    <>
                        <Button variant="secondary" fullWidth onClick={handleGoogleLogin} className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                            <Icons.User className="w-5 h-5" />
                            Google 登入 (商家專用)
                        </Button>
                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">或是</span></div>
                        </div>
                    </>
                ) : null}

                <Button variant="line" fullWidth onClick={handleLineLogin} className="flex items-center justify-center gap-2">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M22 10.3c0-5.6-5.1-10.3-10.7-10.3C5.5 0 .8 4.6.8 10.2c0 5 4.5 9.3 10.3 10.1l-.6 2.5c-.1.3 0 .7.3.9.1.1.3.1.5.1.2 0 .5-.1.6-.3l3.3-3c3.7-1.7 6.7-5.5 6.7-10.2z" /></svg>
                    LINE 登入 (訪客)
                </Button>

                {/* Hidden Dev Tools / Old Host Login */}
                <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
                    <div className="flex flex-col gap-2">
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">開發者選項</span></div>
                        <Button variant="ghost" fullWidth onClick={() => migrateRoomsToSupabase().then(() => alert('資料遷移完成！請重新整理頁面。'))} className="text-xs py-1">
                            匯入本地資料至 Supabase
                        </Button>
                        <Button variant="ghost" fullWidth onClick={() => onLogin(UserRole.HOST)} className="text-xs py-1 text-gray-400">
                            開發模式切換 (Mock Host)
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
