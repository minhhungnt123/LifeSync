import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  User as UserIcon,
  Activity,
  Heart,
  Scale,
  Save,
  Loader2,
  Calendar,
  Sparkles,
  Phone,
  FileText,
  TrendingUp,
  Award,
} from 'lucide-react';
import { userApi } from '../api/userApi';
import type { UserProfileUpdateRequest } from '../types/user';

export const ProfilePage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: profileRes, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const res = await userApi.getProfile();
      return res.data;
    },
  });

  const { data: metricsRes, isLoading: metricsLoading } = useQuery({
    queryKey: ['bodyMetrics'],
    queryFn: async () => {
      const res = await userApi.getBodyMetricsRecommendation();
      return res.data;
    },
  });

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('Khác');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [heightCm, setHeightCm] = useState<number | ''>('');
  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [targetWeightKg, setTargetWeightKg] = useState<number | ''>('');
  const [activityLevel, setActivityLevel] = useState('SEDENTARY');

  useEffect(() => {
    if (profileRes) {
      setFullName(profileRes.fullName || '');
      setPhoneNumber(profileRes.phoneNumber || '');
      setBio(profileRes.bio || '');
      setGender(profileRes.gender || 'Khác');
      setDateOfBirth(profileRes.dateOfBirth || '');
      setHeightCm(profileRes.heightCm ?? 170);
      setWeightKg(profileRes.weightKg ?? 65);
      setTargetWeightKg(profileRes.targetWeightKg ?? 65);
      setActivityLevel(profileRes.activityLevel || 'SEDENTARY');
    }
  }, [profileRes]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: UserProfileUpdateRequest) => userApi.updateProfile(data),
    onSuccess: () => {
      toast.success('Cập nhật hồ sơ thành công!');
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['bodyMetrics'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại!');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      fullName,
      phoneNumber,
      bio,
      gender,
      dateOfBirth: dateOfBirth || undefined,
      heightCm: heightCm === '' ? undefined : Number(heightCm),
      weightKg: weightKg === '' ? undefined : Number(weightKg),
      targetWeightKg: targetWeightKg === '' ? undefined : Number(targetWeightKg),
      activityLevel,
    });
  };

  const metrics = metricsRes;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* ── Header Banner ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-2xs">
            <UserIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Hồ sơ cá nhân</h1>
            <p className="text-xs text-slate-500 mt-0.5">Quản lý sơ yếu lý lịch và theo dõi các chỉ số thể chất sức khỏe</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Đã xác thực tài khoản
          </span>
        </div>
      </div>

      {profileLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ── Left Column: Personal Form (7 cols) ───────────────────────── */}
          <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <UserIcon className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-800">Thông tin cá nhân</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email (Read-only) & Full Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Địa chỉ Email (Cố định)
                  </label>
                  <input
                    type="email"
                    value={profileRes?.email || ''}
                    disabled
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-xs font-medium cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Phone & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0912345678"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Giới tính</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>

              {/* Date of Birth & Activity Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-slate-400" /> Mức độ vận động
                  </label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  >
                    <option value="SEDENTARY">Ít vận động (Ngồi văn phòng)</option>
                    <option value="LIGHTLY_ACTIVE">Vận động nhẹ (Tập 1-3 ngày/tuần)</option>
                    <option value="MODERATELY_ACTIVE">Vận động vừa (Tập 3-5 ngày/tuần)</option>
                    <option value="VERY_ACTIVE">Vận động cao (Tập 6-7 ngày/tuần)</option>
                  </select>
                </div>
              </div>

              {/* Physical Metrics: Height, Weight, Target Weight */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-indigo-500" /> Chiều cao (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value ? Number(e.target.value) : '')}
                    placeholder="170"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-indigo-500" /> Cân nặng (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value ? Number(e.target.value) : '')}
                    placeholder="65"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-500" /> Mục tiêu (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={targetWeightKg}
                    onChange={(e) => setTargetWeightKg(e.target.value ? Number(e.target.value) : '')}
                    placeholder="65"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" /> Ghi chú / Tiểu sử cá nhân
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Viết một vài dòng ngắn về mục tiêu sức khỏe của bạn..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="px-6 py-2.5 rounded-xl text-white font-bold text-xs bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>

          {/* ── Right Column: Health Metrics & BMI/TDEE Cards (5 cols) ──────── */}
          <div className="lg:col-span-5 space-y-4">
            {/* BMI Status Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  <h3 className="text-sm font-bold text-slate-800">Chỉ số BMI (Thế trạng)</h3>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                  Chuẩn Châu Á
                </span>
              </div>

              {metricsLoading ? (
                <div className="py-6 flex justify-center"><Loader2 className="w-6 h-6 text-indigo-500 animate-spin" /></div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-extrabold text-indigo-600">{metrics?.bmi || '--'}</span>
                    <p className="text-xs font-bold text-slate-700 mt-1">{metrics?.bmiStatus || 'Chưa cập nhật'}</p>
                  </div>
                  <div className="text-right text-xs text-slate-500 space-y-1">
                    <p>Chiều cao: <strong>{metrics?.heightCm} cm</strong></p>
                    <p>Cân nặng: <strong>{metrics?.weightKg} kg</strong></p>
                  </div>
                </div>
              )}
            </div>

            {/* Calorie & TDEE Recommendation Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-800">Khuyến nghị Calorie hàng ngày</h3>
              </div>

              {metricsLoading ? (
                <div className="py-6 flex justify-center"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-extrabold text-emerald-700">
                        {metrics?.recommendedDailyCalories} kcal
                      </span>
                      <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                        Mục tiêu Calorie / ngày
                      </p>
                    </div>
                    <Award className="w-8 h-8 text-emerald-500 opacity-80" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Năng lượng nền (BMR)</span>
                      <span className="font-bold text-slate-800">{metrics?.bmr} kcal</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Tiêu hao toàn phần (TDEE)</span>
                      <span className="font-bold text-slate-800">{metrics?.tdee} kcal</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
