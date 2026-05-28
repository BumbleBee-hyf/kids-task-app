// ============ 用户 ============
export interface User {
  id: string;
  username: string;
  password: string;
  role: 'student' | 'parent';
  displayName: string;
  createdAt: string;
}

// ============ 任务 ============
export type TaskStatus = 'pending' | 'submitted' | 'approved' | 'rejected';
export type TaskRating = 'excellent' | 'good';
export type TaskType = 'temporary' | 'daily' | 'periodic';

export interface Task {
  id: string;
  parentId: string;
  studentId: string;
  name: string;
  quantity: number;
  basePoints: number;
  taskType: TaskType;
  weekdays?: number[];       // 周期任务：1-7 表示周一到周日
  taskDate?: string;         // 任务所属日期 YYYY-MM-DD（每日/周期任务每日生成）
  status: TaskStatus;
  rating?: TaskRating;
  finalPoints?: number;
  createdAt: string;
  submittedAt?: string;
  approvedAt?: string;
}

// ============ 积分 ============
export type PointSource = 'task_reward' | 'lottery_cost' | 'admin_grant' | 'checkin';

export interface PointRecord {
  id: string;
  studentId: string;
  amount: number;           // 正数为获得，负数为消耗
  source: PointSource;
  description: string;
  relatedId?: string;       // 关联ID（任务ID等）
  createdAt: string;
}

// ============ 代金券 ============
export type VoucherSource = 'lottery' | 'task_bonus' | 'admin_grant';

export interface Voucher {
  id: string;
  studentId: string;
  amount: number;
  source: VoucherSource;
  createdAt: string;
}

// ============ 提现申请 ============
export type WithdrawStatus = 'pending' | 'approved' | 'rejected';

export interface WithdrawRequest {
  id: string;
  studentId: string;
  amount: number;
  status: WithdrawStatus;
  parentId?: string;
  createdAt: string;
  approvedAt?: string;
}

// ============ 抽奖配置 ============
export const LOTTERY_POINT_COST = 10; // 每次抽奖消耗的积分数

// ============ 抽奖记录 ============
export interface LotteryRecord {
  date: string;       // YYYY-MM-DD
  count: number;
}

// ============ 签到 ============
export const CHECKIN_POINTS = 10; // 每次签到获得的积分数

export interface CheckinRecord {
  id: string;
  studentId: string;
  date: string;          // YYYY-MM-DD
  createdAt: string;
}

// ============ Toast ============
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

// ============ 存储 Key ============
export const STORAGE_KEYS = {
  USERS: 'app_users',
  TASKS: 'app_tasks',
  POINTS: 'app_points',
  VOUCHERS: 'app_vouchers',
  WITHDRAWS: 'app_withdraws',
  CURRENT_USER: 'app_currentUser',
  LOTTERY_RECORDS: 'app_lottery_records',
} as const;