import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Sparkles,
  LayoutDashboard,
  Calendar,
  UtensilsCrossed,
  Bot,
  Menu,
  X,
} from 'lucide-react';
import { UserProfile } from './UserProfile';
import { FloatingChatWidget } from './ai/FloatingChatWidget';
import { NetworkStatusBanner } from './common/NetworkStatusBanner';
import { useLocalNotifications } from '../hooks/useLocalNotifications';

export const Layout: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Tự động khởi tạo Notification Channels và xử lý Deep Linking toàn cục
  useLocalNotifications();

  // Close mobile drawer whenever route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { label: 'Tổng quan',  path: '/',            icon: LayoutDashboard },
    { label: 'Lịch trình', path: '/schedule',    icon: Calendar },
    { label: 'Dinh dưỡng', path: '/meals',        icon: UtensilsCrossed },
    { label: 'Trợ lý AI',  path: '/ai-assistant', icon: Bot },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#F8FAFC' }}>
      {/* Network Status Offline/Online Banner */}
      <NetworkStatusBanner />

      {/* ── Mobile Top Header (Visible only on < 768px) ─────────────────── */}
      <header
        role="banner"
        className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shrink-0 z-30 shadow-sm"
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            }}
          >
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-base text-slate-800 tracking-tight">
              LifeSync AI
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-drawer"
            className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* ── Desktop Sidebar (Hidden on mobile, visible md:flex) ───────── */}
        <aside
          role="complementary"
          aria-label="Thanh điều hướng bên cạnh"
          className="hidden md:flex w-64 h-full shrink-0 p-4 flex-col justify-between overflow-y-auto bg-white border-r border-slate-200"
          style={{
            boxShadow: '2px 0 12px rgba(99, 102, 241, 0.04)',
          }}
        >
          <div>
            {/* Logo Header */}
            <div className="flex items-center gap-3 px-2 py-4 mb-6">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                }}
              >
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-none text-slate-800">
                  LifeSync AI
                </h1>
                <span className="text-[10px] font-semibold tracking-widest uppercase text-indigo-600">
                  Workspace
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav role="navigation" aria-label="Điều hướng chính" className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600 border border-transparent'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Info & Account Popover */}
          <div className="border-t border-slate-200 pt-4">
            <UserProfile />
          </div>
        </aside>

        {/* ── Mobile Drawer Overlay (Active when isMobileMenuOpen is true) ─ */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        <aside
          id="mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menu điều hướng di động"
          className={`fixed inset-y-0 left-0 w-72 bg-white z-50 p-5 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
                >
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-slate-900 leading-none">LifeSync AI</h2>
                  <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">Di động</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Đóng menu"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav role="navigation" aria-label="Menu di động" className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600 font-semibold border border-indigo-200'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <UserProfile />
          </div>
        </aside>

        {/* ── Main Content Area ─────────────────────────────────────────── */}
        <main
          role="main"
          id="main-content"
          tabIndex={-1}
          className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 focus:outline-none"
        >
          <Outlet />
        </main>

        {/* Floating AI Chatbot Widget (Shown on desktop/tablet non-chat pages) */}
        {location.pathname !== '/ai-assistant' && (
          <div className="hidden sm:block">
            <FloatingChatWidget />
          </div>
        )}

        {/* ── Mobile Bottom Navigation Bar (Visible only on < 768px) ─────── */}
        <nav
          role="navigation"
          aria-label="Thanh điều hướng dưới cùng"
          className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-3 flex items-center justify-around z-30 shadow-lg"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                  isActive ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className={`h-5 w-5 mb-0.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="text-[11px] leading-tight">{item.label}</span>
                {isActive && (
                  <span className="absolute -top-1 w-1 h-1 rounded-full bg-indigo-600 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
