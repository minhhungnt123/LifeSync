export interface UserProfile {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  avatarUrl?: string;
  phoneNumber?: string;
  bio?: string;
  gender?: string;
  dateOfBirth?: string;
  heightCm?: number;
  weightKg?: number;
  targetWeightKg?: number;
  activityLevel?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfileUpdateRequest {
  fullName?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  bio?: string;
  gender?: string;
  dateOfBirth?: string;
  heightCm?: number;
  weightKg?: number;
  targetWeightKg?: number;
  activityLevel?: string;
}

export interface UserPreference {
  id: number;
  userId: number;
  language: string;
  timeFormat: string;
  weekStartDay: string;
  scheduleReminderEnabled: boolean;
  scheduleReminderMinutes: number;
  mealReminderEnabled: boolean;
}

export interface UserPreferenceUpdateRequest {
  language?: string;
  timeFormat?: string;
  weekStartDay?: string;
  scheduleReminderEnabled?: boolean;
  scheduleReminderMinutes?: number;
  mealReminderEnabled?: boolean;
}

export interface BodyMetricsRecommendation {
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  bmi: number;
  bmiStatus: string;
  bmr: number;
  tdee: number;
  recommendedDailyCalories: number;
  activityLevel: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type NotificationType = 'SCHEDULE_REMINDER' | 'MEAL_REMINDER' | 'AI_SUGGESTION' | 'SYSTEM';

export interface NotificationItem {
  id: number;
  title: string;
  content: string;
  type: NotificationType;
  isRead: boolean;
  referenceUrl?: string;
  createdAt: string;
}

export interface UnreadNotificationCount {
  unreadCount: number;
}

export interface UserDataExport {
  profile: UserProfile;
  preference: UserPreference;
  schedules: any[];
  notifications: NotificationItem[];
  exportedAt: string;
}
