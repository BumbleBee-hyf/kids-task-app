import {
  STORAGE_KEYS,
} from '../types';
import type {
  User,
  Task,
  Voucher,
  WithdrawRequest,
  PointRecord,
} from '../types';

const API_BASE = '/api';

// ============ API 工具 ============

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

// ============ 用户相关 ============

export const userStorage = {
  getAll: async (): Promise<User[]> => {
    return request<User[]>('GET', '/users');
  },

  getById: async (id: string): Promise<User | undefined> => {
    try {
      return await request<User>('GET', `/users/${id}`);
    } catch {
      return undefined;
    }
  },

  getByUsername: async (username: string): Promise<User | undefined> => {
    try {
      return await request<User>('GET', `/users/username/${username}`);
    } catch {
      return undefined;
    }
  },

  create: async (data: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    return request<User>('POST', '/users', data);
  },

  getStudents: async (): Promise<User[]> => {
    return request<User[]>('GET', '/users/role/student');
  },
};

// ============ 任务相关 ============

export const taskStorage = {
  getAll: async (): Promise<Task[]> => {
    return request<Task[]>('GET', '/tasks');
  },

  getById: async (id: string): Promise<Task | undefined> => {
    try {
      return await request<Task>('GET', `/tasks/${id}`);
    } catch {
      return undefined;
    }
  },

  getByStudent: async (studentId: string): Promise<Task[]> => {
    return request<Task[]>('GET', `/tasks/student/${studentId}`);
  },

  getByParent: async (parentId: string): Promise<Task[]> => {
    return request<Task[]>('GET', `/tasks/parent/${parentId}`);
  },

  getByStatus: async (status: Task['status']): Promise<Task[]> => {
    const all = await request<Task[]>('GET', '/tasks');
    return all.filter(t => t.status === status);
  },

  create: async (data: Omit<Task, 'id' | 'createdAt' | 'status'>): Promise<Task> => {
    return request<Task>('POST', '/tasks', data);
  },

  update: async (id: string, updates: Partial<Task>): Promise<Task | null> => {
    try {
      return await request<Task>('PATCH', `/tasks/${id}`, updates);
    } catch {
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await request<void>('DELETE', `/tasks/${id}`);
      return true;
    } catch {
      return false;
    }
  },

  submit: async (id: string, studentId: string): Promise<Task | null> => {
    try {
      return await request<Task>('POST', `/tasks/${id}/submit`, { studentId });
    } catch {
      return null;
    }
  },

  approve: async (id: string, rating: Task['rating']): Promise<Task | null> => {
    try {
      return await request<Task>('POST', `/tasks/${id}/approve`, { rating });
    } catch {
      return null;
    }
  },

  reject: async (id: string): Promise<Task | null> => {
    try {
      return await request<Task>('POST', `/tasks/${id}/reject`);
    } catch {
      return null;
    }
  },
};

// ============ 积分相关 ============

export const pointStorage = {
  getAll: async (): Promise<PointRecord[]> => {
    return request<PointRecord[]>('GET', '/points');
  },

  getByStudent: async (studentId: string): Promise<PointRecord[]> => {
    return request<PointRecord[]>('GET', `/points/student/${studentId}`);
  },

  getBalance: async (studentId: string): Promise<number> => {
    const res = await request<{ balance: number }>('GET', `/points/student/${studentId}/balance`);
    return res.balance;
  },

  create: async (data: Omit<PointRecord, 'id' | 'createdAt'>): Promise<PointRecord> => {
    return request<PointRecord>('POST', '/points', data);
  },
};

// ============ 代金券相关 ============

export const voucherStorage = {
  getAll: async (): Promise<Voucher[]> => {
    return request<Voucher[]>('GET', '/vouchers');
  },

  getByStudent: async (studentId: string): Promise<Voucher[]> => {
    return request<Voucher[]>('GET', `/vouchers/student/${studentId}`);
  },

  getBalance: async (studentId: string): Promise<number> => {
    const res = await request<{ balance: number }>('GET', `/vouchers/student/${studentId}/balance`);
    return res.balance;
  },

  create: async (data: Omit<Voucher, 'id' | 'createdAt'>): Promise<Voucher> => {
    return request<Voucher>('POST', '/vouchers', data);
  },

  deduct: async (studentId: string, amount: number): Promise<boolean> => {
    try {
      const res = await request<{ success: boolean }>('POST', `/vouchers/student/${studentId}/deduct`, { amount });
      return res.success;
    } catch {
      return false;
    }
  },
};

// ============ 提现相关 ============

export const withdrawStorage = {
  getAll: async (): Promise<WithdrawRequest[]> => {
    return request<WithdrawRequest[]>('GET', '/withdraws');
  },

  getByStudent: async (studentId: string): Promise<WithdrawRequest[]> => {
    return request<WithdrawRequest[]>('GET', `/withdraws/student/${studentId}`);
  },

  getPending: async (): Promise<WithdrawRequest[]> => {
    return request<WithdrawRequest[]>('GET', '/withdraws/pending');
  },

  create: async (data: Omit<WithdrawRequest, 'id' | 'createdAt' | 'status'>): Promise<WithdrawRequest> => {
    return request<WithdrawRequest>('POST', '/withdraws', data);
  },

  approve: async (id: string, parentId: string): Promise<WithdrawRequest | null> => {
    try {
      return await request<WithdrawRequest>('POST', `/withdraws/${id}/approve`, { parentId });
    } catch {
      return null;
    }
  },

  reject: async (id: string, parentId: string): Promise<WithdrawRequest | null> => {
    try {
      return await request<WithdrawRequest>('POST', `/withdraws/${id}/reject`, { parentId });
    } catch {
      return null;
    }
  },
};

// ============ 抽奖记录相关 ============

export const lotteryStorage = {
  getTodayCount: async (): Promise<number> => {
    const res = await request<{ count: number }>('GET', '/lottery/today');
    return res.count;
  },

  incrementToday: async (): Promise<void> => {
    await request<void>('POST', '/lottery/increment');
  },

  draw: async (studentId: string, type: 'box' | 'wheel'): Promise<{
    success: boolean;
    type: 'money' | 'joke';
    amount: number;
    jokeEmoji?: string;
    segmentIndex?: number;
    pointBalance: number;
  }> => {
    return request('POST', '/lottery/draw', { studentId, type });
  },
};

// ============ 签到相关 ============

export const checkinStorage = {
  getStatus: async (studentId: string): Promise<{
    checkedInToday: boolean;
    streak: number;
    hasCompletedTask: boolean;
    checkinPoints: number;
  }> => {
    return request('GET', `/checkin/status/${studentId}`);
  },

  checkin: async (studentId: string): Promise<{
    success: boolean;
    streak: number;
    points: number;
  }> => {
    return request('POST', '/checkin', { studentId });
  },
};

// ============ 会话管理 ============

export const sessionStorage = {
  getCurrentUserId: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  },

  setCurrentUser: (userId: string): void => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
  },

  clear: (): void => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },
};
