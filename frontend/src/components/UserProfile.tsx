import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { notificationApi } from '../api/notificationApi';
import {
  User as UserIcon,
  Settings,
  Bell,
  LogOut,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';

interface AccountMenuItemProps {
  icon: React.ElementType;
  label: string;
  badge?: string | number;
  isDestructive?: boolean;
  onClick?: () => void;
}

const AccountMenuItem: React.FC<AccountMenuItemProps> = ({
  icon: Icon,
  label,
  badge,
  isDestructive = false,
  onClick,
}) => {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left group cursor-pointer ${
        isDestructive
          ? 'text-rose-600 hover:bg-rose-50 hover:text-rose-700'
          : 'text-slate-700 hover:bg-indigo-50/70 hover:text-indigo-600'
      }`}
    >
      <Icon
        className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
          isDestructive ? 'text-rose-500' : 'text-slate-400 group-hover:text-indigo-600'
        }`}
      />
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && badge !== 0 && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-600 shrink-0">
          {badge}
        </span>
      )}
    </button>
  );
};

export const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: unreadData } = useQuery({
    queryKey: ['unreadNotificationsCount'],
    queryFn: async () => {
      const res = await notificationApi.getUnreadCount();
      return res.data;
    },
  });

  const unreadCount = unreadData?.unreadCount ?? 0;

  const togglePopover = () => setIsOpen((prev) => !prev);

  const closePopover = () => setIsOpen(false);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closePopover();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePopover();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = () => {
    closePopover();
    logout();
  };

  const handleNavigate = (path: string) => {
    closePopover();
    navigate(path);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* ── Account Popover Menu ────────────────────────────────────────── */}
      <div
        role="menu"
        aria-orientation="vertical"
        className={`absolute bottom-full mb-2.5 left-0 right-0 z-50 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-2 text-slate-800 transition-all duration-200 ease-out origin-bottom ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
        }`}
        style={{
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12), 0 2px 6px rgba(15, 23, 42, 0.04)',
        }}
      >
        {/* Header Section */}
        <div className="px-3 py-2.5 mb-1 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-sm"
            style={{
              background: '#EEF2FF',
              border: '2px solid #C7D2FE',
              color: '#4F46E5',
            }}
          >
            <UserIcon className="h-5 w-5" />
          </div>
          <div className="overflow-hidden flex-1">
            <div className="flex items-center gap-1">
              <p className="text-xs font-bold text-slate-800 truncate">
                {user?.fullName || 'Người dùng'}
              </p>
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {user?.email || 'user@lifesync.ai'}
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-0.5 py-1">
          <AccountMenuItem
            icon={UserIcon}
            label="Hồ sơ cá nhân"
            onClick={() => handleNavigate('/profile')}
          />
          <AccountMenuItem
            icon={Settings}
            label="Cài đặt tài khoản"
            onClick={() => handleNavigate('/settings')}
          />
          <AccountMenuItem
            icon={Bell}
            label="Thông báo"
            badge={unreadCount > 0 ? unreadCount : undefined}
            onClick={() => handleNavigate('/notifications')}
          />
        </div>

        {/* Divider */}
        <div className="my-1 border-t border-slate-100" />

        {/* Destructive Action: Logout */}
        <AccountMenuItem
          icon={LogOut}
          label="Đăng xuất"
          isDestructive
          onClick={handleLogout}
        />
      </div>

      {/* ── User Profile Trigger Button ──────────────────────────────────── */}
      <button
        type="button"
        onClick={togglePopover}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Menu tài khoản cá nhân"
        className={`w-full flex items-center justify-between rounded-xl p-2.5 transition-all text-left border cursor-pointer ${
          isOpen
            ? 'bg-indigo-50/80 border-indigo-200 shadow-xs'
            : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/80 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95"
            style={{
              background: '#EEF2FF',
              border: '2px solid #C7D2FE',
              color: '#4F46E5',
            }}
          >
            <UserIcon className="h-4 w-4" />
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold truncate text-slate-800">
              {user?.fullName}
            </p>
            <p className="text-[11px] truncate text-slate-400">
              {user?.email}
            </p>
          </div>
        </div>

        <ChevronUp
          className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-indigo-600' : 'rotate-0'
          }`}
        />
      </button>
    </div>
  );
};
