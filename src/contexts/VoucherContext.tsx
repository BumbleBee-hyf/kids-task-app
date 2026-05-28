import { createContext, useContext, useState, useCallback } from 'react';
import type { Voucher, WithdrawRequest } from '../types';
import { voucherStorage, withdrawStorage } from '../services/storageService';

interface VoucherContextType {
  balance: number;
  vouchers: Voucher[];
  withdraws: WithdrawRequest[];
  refreshData: () => Promise<void>;
  getBalance: (studentId: string) => Promise<number>;
  getVouchersByStudent: (studentId: string) => Promise<Voucher[]>;
  getWithdrawsByStudent: (studentId: string) => Promise<WithdrawRequest[]>;
  requestWithdraw: (studentId: string, amount: number) => Promise<{ success: boolean; error?: string }>;
  approveWithdraw: (id: string, parentId: string) => Promise<{ success: boolean; error?: string }>;
  rejectWithdraw: (id: string, parentId: string) => Promise<boolean>;
  getPendingWithdraws: () => Promise<WithdrawRequest[]>;
}

const VoucherContext = createContext<VoucherContextType | null>(null);

export function VoucherProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState(0);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [withdraws, setWithdraws] = useState<WithdrawRequest[]>([]);
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    const allVouchers = await voucherStorage.getAll();
    const allWithdraws = await withdrawStorage.getAll();
    setVouchers(allVouchers);
    setWithdraws(allWithdraws);
    if (currentStudentId) {
      const bal = await voucherStorage.getBalance(currentStudentId);
      setBalance(bal);
    }
  }, [currentStudentId]);

  const getBalance = useCallback(async (studentId: string) => {
    setCurrentStudentId(studentId);
    const bal = await voucherStorage.getBalance(studentId);
    setBalance(bal);
    await refreshData();
    return bal;
  }, [refreshData]);

  const getVouchersByStudent = useCallback(async (studentId: string) => {
    return voucherStorage.getByStudent(studentId);
  }, []);

  const getWithdrawsByStudent = useCallback(async (studentId: string) => {
    return withdrawStorage.getByStudent(studentId);
  }, []);

  const requestWithdraw = useCallback(async (studentId: string, amount: number) => {
    const currentBalance = await voucherStorage.getBalance(studentId);
    if (amount <= 0) {
      return { success: false, error: '提现金额必须大于 0' };
    }
    if (amount > currentBalance) {
      return { success: false, error: `余额不足，当前余额为 ${currentBalance} 元` };
    }
    // 检查是否有 pending 状态的提现
    const studentWithdraws = await withdrawStorage.getByStudent(studentId);
    const pending = studentWithdraws.filter(w => w.status === 'pending');
    if (pending.length > 0) {
      return { success: false, error: '您有一个待审批的提现申请，请等待处理完毕' };
    }
    await withdrawStorage.create({ studentId, amount });
    await refreshData();
    return { success: true };
  }, [refreshData]);

  const approveWithdraw = useCallback(async (id: string, parentId: string) => {
    const all = await withdrawStorage.getAll();
    const req = all.find(w => w.id === id);
    if (!req || req.status !== 'pending') {
      return { success: false, error: '申请不存在或已处理' };
    }
    // 服务端审批时自动扣减代金券，无需客户端单独调用 deduct
    const result = await withdrawStorage.approve(id, parentId);
    if (!result) {
      return { success: false, error: '审批失败，代金券余额可能不足' };
    }
    await refreshData();
    return { success: true };
  }, [refreshData]);

  const rejectWithdraw = useCallback(async (id: string, parentId: string) => {
    const result = await withdrawStorage.reject(id, parentId);
    if (result) await refreshData();
    return !!result;
  }, [refreshData]);

  const getPendingWithdraws = useCallback(async () => {
    return withdrawStorage.getPending();
  }, []);

  return (
    <VoucherContext.Provider value={{
      balance, vouchers, withdraws, refreshData,
      getBalance, getVouchersByStudent, getWithdrawsByStudent,
      requestWithdraw, approveWithdraw, rejectWithdraw, getPendingWithdraws,
    }}>
      {children}
    </VoucherContext.Provider>
  );
}

export function useVouchers(): VoucherContextType {
  const ctx = useContext(VoucherContext);
  if (!ctx) throw new Error('useVouchers must be used within VoucherProvider');
  return ctx;
}
