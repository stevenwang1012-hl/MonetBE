import React from 'react';
import { BookingStatus } from './types';

// --- Badges ---
export const StatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => {
  switch (status) {
    case BookingStatus.PENDING:
      return <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">預約確認中</span>;
    case BookingStatus.CONFIRMED:
      return <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">預約成功 (未付款)</span>;
    case BookingStatus.PAID:
      return <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">預約成功 (已付款)</span>;
    case BookingStatus.CHECKED_IN:
      return <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">已入住</span>;
    case BookingStatus.CANCELLED:
      return <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold">預約取消</span>;
    default:
      return null;
  }
};

// --- Buttons ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'line';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children, variant = 'primary', fullWidth, className = '', ...props
}) => {
  const baseStyle = "active:scale-95 transition-transform duration-200 font-medium text-sm rounded-xl py-3 px-4 disabled:opacity-50 disabled:active:scale-100";

  const variants = {
    primary: "bg-black text-white shadow-lg shadow-gray-200",
    secondary: "bg-gray-100 text-gray-900",
    danger: "bg-red-50 text-red-600",
    ghost: "bg-transparent text-gray-500",
    line: "bg-[#06C755] text-white shadow-lg shadow-green-100" // LINE Green
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({
  children, className = '', onClick
}) => (
  <div onClick={onClick} className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
    {children}
  </div>
);

// --- Layout ---
export const ScreenContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`min-h-screen pb-24 max-w-7xl mx-auto bg-[#F2F2F7] ${className}`}>
    {children}
  </div>
);

// --- Animation Styles ---
// Add this to your global CSS or in a specific style block if needed, 
// but for simplicity we'll fallback to a simple CSS-in-JS style for marquee
const marqueeStyle = `
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-marquee-slow {
  display: inline-block;
  white-space: nowrap;
  animation: marquee 10s linear infinite;
}
`;

export const Header: React.FC<{ title: string; subtitle?: string; rightAction?: React.ReactNode }> = ({ title, subtitle, rightAction }) => (
  <>
    <style>{marqueeStyle}</style>
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex justify-between items-center transition-all shadow-sm overflow-hidden h-[60px]">
      <div className="flex-1 min-w-0 overflow-hidden mr-3">
        {/* Marquee Wrapper: Only activates effective visual marquee if content is very long, 
            but since we can't measure effortlessly, we will use a reliable truncate + marquee on hover or always? 
            User asked for marquee type. Let's do a gentle scroll if text is long. 
            Actually, standard CSS marquee is tricky without duplicating content. 
            Let's use a simpler "Truncate" as default, but "Marquee" style structure.
         */}
        <div className="flex flex-col">
          <div className="overflow-hidden whitespace-nowrap w-full relative">
            <div className="inline-block animate-marquee-slow">
              {/* Duplicate content for seamless loop if we used the translte -50% trick, 
                       but for simplicity and stability, let's just use TRUNCATE which solves the 'layout broken' issue 
                       and is often preferred over constant motion. 
                       BUT user explicitly asked for Marquee. 
                       Let's trust the user wants to see the full text without expansion.
                   */}
              <span className="text-lg font-bold text-gray-900 tracking-tight">{title}</span>
            </div>
          </div>
          {subtitle && <p className="text-xs text-gray-500 font-medium truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="flex-shrink-0">
        {rightAction}
      </div>
    </div>
  </>
);

// --- Icons (Simple SVG) ---
export const Icons = {
  Home: (props: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  Calendar: (props: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>,
  User: (props: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  Check: (props: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12" /></svg>,
  ChevronLeft: (props: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6" /></svg>,
  ChevronRight: (props: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6" /></svg>,
  MapPin: (props: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>,
  ArrowLeft: (props: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>,
  ArrowRight: (props: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>,
  Settings: (props: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.18-.08a2 2 0 0 0-2 2v.44a2 2 0 0 0 2 2h.18a2 2 0 0 1 1.73 1l.25.43a2 2 0 0 1 0 2l-.08.18a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.18.08a2 2 0 0 0 2-2v-.44a2 2 0 0 0-2-2h-.18a2 2 0 0 1-1.73-1l-.25-.43a2 2 0 0 1 0-2l.08-.18a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>,
  Trash: (props: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>,
  AlertTriangle: (props: any) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
};
