import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Settings,
  Lock,
  Globe,
  Clock,
  Bell,
  Download,
  AlertTriangle,
  Save,
  Loader2,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { userApi } from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import type { UserPreferenceUpdateRequest, ChangePasswordRequest } from '../types/user';

export const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuth();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Preference state
  const { data: prefRes, isLoading: prefLoading } = useQuery({
    queryKey: ['userPreference'],
    queryFn: async () => {
      const res = await userApi.getPreference();
      return res.data;
    },
  });

  const [language, setLanguage] = useState('vi');
  const [timeFormat, setTimeFormat] = useState('24h');
  const [weekStartDay, setWeekStartDay] = useState('MONDAY');
  const [scheduleReminderEnabled, setScheduleReminderEnabled] = useState(true);
  const [scheduleReminderMinutes, setScheduleReminderMinutes] = useState(15);
  const [mealReminderEnabled, setMealReminderEnabled] = useState(true);

  useEffect(() => {
    if (prefRes) {
      setLanguage(prefRes.language || 'vi');
      setTimeFormat(prefRes.timeFormat || '24h');
      setWeekStartDay(prefRes.weekStartDay || 'MONDAY');
      setScheduleReminderEnabled(prefRes.scheduleReminderEnabled ?? true);
      setScheduleReminderMinutes(prefRes.scheduleReminderMinutes ?? 15);
      setMealReminderEnabled(prefRes.mealReminderEnabled ?? true);
    }
  }, [prefRes]);

  // Mutations
  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) => userApi.changePassword(data),
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại!');
    },
  });

  const updatePrefMutation = useMutation({
    mutationFn: (data: UserPreferenceUpdateRequest) => userApi.updatePreference(data),
    onSuccess: () => {
      toast.success('Lưu cài đặt ứng dụng thành công!');
      queryClient.invalidateQueries({ queryKey: ['userPreference'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại!');
    },
  });

  const [isExporting, setIsExporting] = useState(false);
  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const res = await userApi.exportData();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `lifesync-export-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('Xuất dữ liệu thành công!');
    } catch {
      toast.error('Không thể xuất dữ liệu!');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Xác nhận mật khẩu mới không khớp!');
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword, confirmPassword });
  };

  const handlePrefSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePrefMutation.mutate({
      language,
      timeFormat,
      weekStartDay,
      scheduleReminderEnabled,
      scheduleReminderMinutes,
      mealReminderEnabled,
    });
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* ── Header Banner ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-2xs">
            <Settings className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Cài đặt tài khoản</h1>
            <p className="text-xs text-slate-500 mt-0.5">Bảo mật thông tin, tùy chỉnh ứng dụng và quyền riêng tư dữ liệu</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Left Column: Password & App Preferences (7 cols) ─────────────── */}
        <div className="lg:col-span-7 space-y-6">
          {/* Change Password Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <KeyRound className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-800">Đổi mật khẩu</h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> Mật khẩu hiện tại <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-slate-400" /> Mật khẩu mới <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-slate-400" /> Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="px-5 py-2.5 rounded-xl text-white font-bold text-xs bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {changePasswordMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Cập nhật mật khẩu
                </button>
              </div>
            </form>
          </div>

          {/* Preferences Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Globe className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-800">Tùy biến ứng dụng</h2>
            </div>

            {prefLoading ? (
              <div className="py-6 flex justify-center"><Loader2 className="w-6 h-6 text-indigo-600 animate-spin" /></div>
            ) : (
              <form onSubmit={handlePrefSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ngôn ngữ</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    >
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Định dạng giờ
                    </label>
                    <select
                      value={timeFormat}
                      onChange={(e) => setTimeFormat(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    >
                      <option value="24h">24 Giờ (14:00)</option>
                      <option value="12h">12 Giờ (2:00 PM)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ngày đầu tuần</label>
                    <select
                      value={weekStartDay}
                      onChange={(e) => setWeekStartDay(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    >
                      <option value="MONDAY">Thứ Hai</option>
                      <option value="SUNDAY">Chủ Nhật</option>
                    </select>
                  </div>
                </div>

                {/* Notifications Toggles */}
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <Bell className="w-4 h-4 text-indigo-600" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Nhắc nhở Lịch trình sắp tới</p>
                        <p className="text-[11px] text-slate-500">Gửi thông báo trước giờ diễn ra sự kiện</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={scheduleReminderEnabled}
                      onChange={(e) => setScheduleReminderEnabled(e.target.checked)}
                      className="h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>

                  {scheduleReminderEnabled && (
                    <div className="pl-4">
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Thời gian báo trước (phút)
                      </label>
                      <select
                        value={scheduleReminderMinutes}
                        onChange={(e) => setScheduleReminderMinutes(Number(e.target.value))}
                        className="w-full max-w-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium"
                      >
                        <option value={15}>15 phút</option>
                        <option value={30}>30 phút</option>
                        <option value={60}>60 phút (1 giờ)</option>
                      </select>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <Bell className="w-4 h-4 text-emerald-600" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Nhắc nhở Nhật ký Bữa ăn</p>
                        <p className="text-[11px] text-slate-500">Thông báo ghi lại dinh dưỡng vào các khung giờ chính</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={mealReminderEnabled}
                      onChange={(e) => setMealReminderEnabled(e.target.checked)}
                      className="h-4 w-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={updatePrefMutation.isPending}
                    className="px-5 py-2.5 rounded-xl text-white font-bold text-xs bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    {updatePrefMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Lưu cấu hình
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* ── Right Column: Data Export & Danger Zone (5 cols) ─────────────── */}
        <div className="lg:col-span-5 space-y-6">
          {/* Data Export Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Download className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-800">Dữ liệu cá nhân</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tải xuống bản sao lưu toàn bộ thông tin tài khoản, lịch trình công việc và lịch sử cài đặt cá nhân dạng file JSON.
            </p>
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="w-full py-2.5 px-4 rounded-xl text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Xuất dữ liệu (JSON)
            </button>
          </div>

          {/* Danger Zone Card */}
          <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-rose-200/80 text-rose-700">
              <ShieldAlert className="w-5 h-5" />
              <h2 className="text-base font-bold">Vùng nguy hiểm (Danger Zone)</h2>
            </div>
            <p className="text-xs text-rose-600/90 leading-relaxed">
              Đăng xuất khỏi tất cả các thiết bị đang hoạt động hoặc yêu cầu hủy tài khoản cá nhân.
            </p>
            <button
              onClick={logout}
              className="w-full py-2.5 px-4 rounded-xl text-white bg-rose-600 hover:bg-rose-700 font-bold text-xs shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <AlertTriangle className="w-4 h-4" /> Đăng xuất khỏi hệ thống
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
