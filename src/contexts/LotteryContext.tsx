import React, { createContext, useContext, useState, useCallback } from 'react';
import { lotteryStorage } from '../services/storageService';
import { LOTTERY_POINT_COST } from '../types';

interface LotteryContextType {
  pointCost: number;
  todayCount: number;
  drawBox: (studentId: string, pointBalance: number) => Promise<{ success: boolean; type?: 'money' | 'joke'; amount?: number; jokeEmoji?: string; error?: string }>;
  spinWheel: (studentId: string, pointBalance: number) => Promise<{ success: boolean; type?: 'money' | 'joke'; amount?: number; jokeEmoji?: string; segmentIndex?: number; error?: string }>;
  refreshCount: () => Promise<void>;
}

const LotteryContext = createContext<LotteryContextType | null>(null);

export function LotteryProvider({ children }: { children: React.ReactNode }) {
  const [todayCount, setTodayCount] = useState(0);

  const refreshCount = useCallback(async () => {
    const count = await lotteryStorage.getTodayCount();
    setTodayCount(count);
  }, []);

  const drawBox = useCallback(async (studentId: string, pointBalance: number) => {
    if (pointBalance < LOTTERY_POINT_COST) {
      return { success: false, error: `积分不足，需要 ${LOTTERY_POINT_COST} 积分` };
    }
    try {
      const result = await lotteryStorage.draw(studentId, 'box');
      await refreshCount();
      return { success: true, type: result.type, amount: result.amount, jokeEmoji: result.jokeEmoji };
    } catch (err: any) {
      return { success: false, error: err.message || '抽奖失败' };
    }
  }, [refreshCount]);

  const spinWheel = useCallback(async (studentId: string, pointBalance: number) => {
    if (pointBalance < LOTTERY_POINT_COST) {
      return { success: false, error: `积分不足，需要 ${LOTTERY_POINT_COST} 积分` };
    }
    try {
      const result = await lotteryStorage.draw(studentId, 'wheel');
      await refreshCount();
      return { success: true, type: result.type, amount: result.amount, jokeEmoji: result.jokeEmoji, segmentIndex: result.segmentIndex };
    } catch (err: any) {
      return { success: false, error: err.message || '抽奖失败' };
    }
  }, [refreshCount]);

  return (
    <LotteryContext.Provider value={{
      pointCost: LOTTERY_POINT_COST,
      todayCount,
      drawBox, spinWheel, refreshCount,
    }}>
      {children}
    </LotteryContext.Provider>
  );
}

export function useLottery(): LotteryContextType {
  const ctx = useContext(LotteryContext);
  if (!ctx) throw new Error('useLottery must be used within LotteryProvider');
  return ctx;
}
