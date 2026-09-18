import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Sparkles,
  LayoutDashboard,
  Calendar,
  UtensilsCrossed,
  Bot,
} from 'lucide-react';
import { UserProfile } from './UserProfile';
import { FloatingChatWidget } from './ai/FloatingChatWidget';
import { NetworkStatusBanner } from './common/NetworkStatusBanner';

export const Layout: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Tổng quan',  path: '/',            icon: LayoutDashboard },
    { label: 'Lịch trình', path: '/schedule',    icon: Calendar },
    { label: 'Dinh dưỡng', path: '/meals',        icon: UtensilsCrossed },
    { label: 'Trợ lý AI',  path: '/ai-assistant', icon: Bot },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#F5F7FF' }}>
      <NetworkStatusBanner />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside
          className="w-64 h-full shrink-0 p-4 flex flex-col justify-between overflow-y-auto"
        style={{
          background: '#ffffff',
          borderRight: '1px solid #E2E8F0',
          boxShadow: '2px 0 12px rgba(99, 102, 241, 0.06)',
        }}
      >
        <div>
          {/* Logo Header */}
          <div className="flex items-center gap-3 px-2 py-4 mb-6">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
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

        {/* User Info & Account Popover */}
        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
          <UserProfile />
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden p-6 lg:p-8">
        <Outlet />
      </main>

      {/* Floating AI Chatbot Widget (Only shown on non-chat pages) */}
      {location.pathname !== '/ai-assistant' && <FloatingChatWidget />}
      </div>
    </div>
  );
};

