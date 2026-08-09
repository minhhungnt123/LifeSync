import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  LayoutDashboard,
  Calendar,
  UtensilsCrossed,
  Bot,
  LogOut,
  User as UserIcon
} from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Tổng quan',  path: '/',            icon: LayoutDashboard },
    { label: 'Lịch trình', path: '/schedule',    icon: Calendar },
    { label: 'Dinh dưỡng', path: '/meals',        icon: UtensilsCrossed },
    { label: 'Trợ lý AI',  path: '/ai-assistant', icon: Bot },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: '#F5F7FF' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className="w-64 p-4 flex flex-col justify-between"
        style={{
          background: '#ffffff',
          borderRight: '1px solid #E2E8F0',
          boxShadow: '2px 0 12px rgba(99, 102, 241, 0.06)',
        }}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 py-4 mb-6">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
              }}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none" style={{ color: '#1E293B' }}>
                LifeSync AI
              </h1>
              <span
                className="text-[10px] font-semibold tracking-widest uppercase"
                style={{ color: '#4F46E5' }}
              >
                Workspace
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
                  style={
                    isActive
                      ? {
                          background: '#EEF2FF',
                          color: '#4F46E5',
                          border: '1px solid #C7D2FE',
                        }
                      : {
                          color: '#64748B',
                          background: 'transparent',
                          border: '1px solid transparent',
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.background = '#F8FAFF';
                      (e.currentTarget as HTMLAnchorElement).style.color = '#4F46E5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                      (e.currentTarget as HTMLAnchorElement).style.color = '#64748B';
                    }
                  }}
                >
                  <Icon
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: isActive ? '#4F46E5' : '#94A3B8' }}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
          <div
            className="flex items-center justify-between rounded-xl p-3"
            style={{ background: '#F8FAFF', border: '1px solid #E2E8F0' }}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: '#EEF2FF',
                  border: '2px solid #C7D2FE',
                  color: '#4F46E5',
                }}
              >
                <UserIcon className="h-4 w-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold truncate" style={{ color: '#1E293B' }}>
                  {user?.fullName}
                </p>
                <p className="text-[11px] truncate" style={{ color: '#94A3B8' }}>
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Đăng xuất"
              className="rounded-lg p-1.5 transition-colors"
              style={{ color: '#94A3B8' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#FEE2E2';
                (e.currentTarget as HTMLButtonElement).style.color = '#EF4444';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8';
              }}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};
