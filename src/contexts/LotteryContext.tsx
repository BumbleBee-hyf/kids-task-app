import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { lotteryStorage, lotteryConfigStorage } from '../services/storageService';
import { LOTTERY_POINT_COST } from '../types';
import type { LotteryConfig } from '../types';

interface LotteryContextType {
  pointCost: number;
  todayCount: number;
  config: LotteryConfig | null;
  drawBox: (studentId: string, pointBalance: number) => Promise<{ success: boolean; type?: 'money' | 'joke'; amount?: number; jokeEmoji?: string; error?: string }>;
  spinWheel: (studentId: string, pointBalance: number) => Promise<{ success: boolean; type?: 'money' | 'joke'; amount?: number; jokeEmoji?: string; segmentIndex?: number; error?: string }>;
  refreshCount: () => Promise<void>;
  refreshConfig: () => Promise<void>;
}

const LotteryContext = createContext<LotteryContextType | null>(null);

export function LotteryProvider({ children }: { children: React.ReactNode }) {
  const [todayCount, setTodayCount] = useState(0);
  const [config, setConfig] = useState<LotteryConfig | null>(null);

  const refreshCount = useCallback(async () => {
    const count = await lotteryStorage.getTodayCount();
    setTodayCount(count);
  }, []);

  const refreshConfig = useCallback(async () => {
    try {
      const data = await lotteryConfigStorage.getConfig();
      setConfig(data);
    } catch {
      // 降级使用默认配置
    }
  }, []);

  useEffect(() => { refreshConfig(); }, [refreshConfig]);

  const effectiveCost = config?.pointCost || LOTTERY_POINT_COST;

  const drawBox = useCallback(async (studentId: string, pointBalance: number) => {
    if (pointBalance < effectiveCost) {
      return { success: false, error: `积分不足，需要 ${effectiveCost} 积分` };
    }
    try {
      const result = await lotteryStorage.draw(studentId, 'box');
      await refreshCount();
      return { success: true, type: result.type, amount: result.amount, jokeEmoji: result.jokeEmoji };
    } catch (err: any) {
      return { success: false, error: err.message || '抽奖失败' };
    }
  }, [refreshCount, effectiveCost]);

  const spinWheel = useCallback(async (studentId: string, pointBalance: number) => {
    if (pointBalance < effectiveCost) {
      return { success: false, error: `积分不足，需要 ${effectiveCost} 积分` };
    }
    try {
      const result = await lotteryStorage.draw(studentId, 'wheel');
      await refreshCount();
      return { success: true, type: result.type, amount: result.amount, jokeEmoji: result.jokeEmoji, segmentIndex: result.segmentIndex };
    } catch (err: any) {
      return { success: false, error: err.message || '抽奖失败' };
    }
  }, [refreshCount, effectiveCost]);

  return (
    <LotteryContext.Provider value={{
      pointCost: effectiveCost,
      todayCount,
      config,
      drawBox, spinWheel, refreshCount, refreshConfig,
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
