import React from 'react';
import { UserRole } from '../types';
import { Button, Icons } from '../ui';

interface LoginScreenProps {
    onLogin: (role: UserRole) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-gray-900 rounded-3xl mb-8 flex items-center justify-center shadow-2xl">
                <Icons.Home className="text-white w-12 h-12" />
            </div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Serenity Stay</h1>
            <p className="text-gray-500 mb-12">精緻民宿預約體驗</p>

            <div className="w-full max-w-xs space-y-4">
                <Button variant="line" fullWidth onClick={() => onLogin(UserRole.GUEST)} className="flex items-center justify-center gap-2">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M22 10.3c0-5.6-5.1-10.3-10.7-10.3C5.5 0 .8 4.6.8 10.2c0 5 4.5 9.3 10.3 10.1l-.6 2.5c-.1.3 0 .7.3.9.1.1.3.1.5.1.2 0 .5-.1.6-.3l3.3-3c3.7-1.7 6.7-5.5 6.7-10.2z" /></svg>
                    LINE 登入 (訪客)
                </Button>
                <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">開發者選項</span></div>
                </div>
                <Button variant="secondary" fullWidth onClick={() => onLogin(UserRole.HOST)}>
                    管理員模式 (商家)
                </Button>
            </div>
        </div>
    );
};
