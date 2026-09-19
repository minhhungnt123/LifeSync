import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingFallback } from './components/common/LoadingFallback';
import { Toaster } from 'react-hot-toast';

// Dynamic Code Splitting for Performance Optimization
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then((m) => ({ default: m.Register })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const SchedulePage = lazy(() => import('./pages/SchedulePage').then((m) => ({ default: m.SchedulePage })));
const MealPage = lazy(() => import('./pages/MealPage').then((m) => ({ default: m.MealPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));
const AiChatPage = lazy(() => import('./pages/AiChatPage').then((m) => ({ default: m.AiChatPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/schedule" element={<SchedulePage />} />
                    <Route path="/meals" element={<MealPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/ai-assistant" element={<AiChatPage />} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '13px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
