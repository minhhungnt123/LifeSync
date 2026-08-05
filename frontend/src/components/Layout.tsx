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
    { label: 'Tổng quan', path: '/', icon: LayoutDashboard },
    { label: 'Lịch trình', path: '/schedule', icon: Calendar },
    { label: 'Dinh dưỡng', path: '/meals', icon: UtensilsCrossed },
    { label: 'Trợ lý AI', path: '/ai-assistant', icon: Bot },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between glass-panel">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 py-4 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-md shadow-indigo-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white leading-none">LifeSync AI</h1>
              <span className="text-[10px] text-indigo-400 font-semibold tracking-wide uppercase">Workspace</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="border-t border-slate-800 pt-4">
          <div className="flex items-center justify-between rounded-xl bg-slate-800/40 p-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <UserIcon className="h-4 w-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.fullName}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Đăng xuất"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};
