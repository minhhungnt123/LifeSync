export type ScheduleCategory = 'WORK' | 'STUDY' | 'HEALTH' | 'PERSONAL';

export type ScheduleStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type SchedulePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Schedule {
  id: number;
  userId: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  category: ScheduleCategory;
  status: ScheduleStatus;
  priority: SchedulePriority;
  createdAt: string;
  updatedAt?: string;
  hasOverlap?: boolean;
  overlapWarning?: string;
}

export interface ScheduleRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  category: ScheduleCategory;
  status?: ScheduleStatus;
  priority?: SchedulePriority;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}
