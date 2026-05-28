import { useState, useCallback, useRef } from 'react';
import { LuckyWheel } from '@play-kit/games';
import type { LuckyWheelPrize } from '@play-kit/games';
import type { LuckyWheelRef } from '@play-kit/games';
import { useAuth } from '../contexts/AuthContext';
import { useLottery } from '../contexts/LotteryContext';

const PRIZES: readonly LuckyWheelPrize[] = [
  { label: '1元', win: true, weight: 35, color: '#FF8C42', icon: '1' },
  { label: '2元', win: true, weight: 30, color: '#4ADE80', icon: '2' },
  { label: '1元', win: true, weight: 35, color: '#FBBF24', icon: '1' },
  { label: '5元', win: true, weight: 20, color: '#38BDF8', icon: '5' },
  { label: '2元', win: true, weight: 30, color: '#FB7185', icon: '2' },
  { label: '10元', win: true, weight: 10, color: '#A78BFA', icon: '10' },
  { label: '1元', win: true, weight: 35, color: '#2DD4BF', icon: '1' },
  { label: '20元', win: true, weight: 5, color: '#F43F5E', icon: '20' },
];

export default function SpinWheel() {
  const { user } = useAuth();
  const { todayCount, spinWheel, refreshCount } = useLottery();
  const ref = useRef<LuckyWheelRef>(null);
  const [lastResult, setLastResult] = useState<{ label: string; amount: number } | null>(null);

  const handleEnd = useCallback(async (prize: LuckyWheelPrize) => {
    if (!user) return;
    const amount = parseInt((prize.label as string).replace('元', ''), 10);
    await spinWheel(user.id, amount);
    await refreshCount();
    setLastResult({ label: prize.label as string, amount });
  }, [user, spinWheel, refreshCount]);

  const handleReset = useCallback(() => {
    setLastResult(null);
    ref.current?.reset();
  }, []);

  const canPlay = todayCount > 0;

  return (
    <div className="lottery-wrapper">
      {!canPlay && !lastResult && (
        <div className="card lottery-message-card">
          <span className="lottery-message-emoji">⏰</span>
          <span className="lottery-message-text">今日抽奖次数已用完，明天再来吧！</span>
        </div>
      )}

      <div className={`lottery-game-area ${!canPlay ? 'disabled' : ''}`}>
        <LuckyWheel
          ref={ref}
          prizes={PRIZES}
          onEnd={handleEnd}
        />
      </div>

      {lastResult && (
        <div className="card lottery-result-card">
          <span className="lottery-result-emoji">🎉</span>
          <div className="lottery-result-title">恭喜中奖！</div>
          <div className="lottery-result-amount">
            +{lastResult.amount} 元代金券
          </div>
          <button className="btn btn-primary lottery-result-btn" onClick={handleReset}>
            再转一次
          </button>
        </div>
      )}
    </div>
  );
}
