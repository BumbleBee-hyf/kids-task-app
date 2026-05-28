import { useState, useCallback, useRef } from 'react';
import { GiftBox } from '@play-kit/games';
import type { Prize } from '@play-kit/games';
import type { GiftBoxRef } from '@play-kit/games';
import { useAuth } from '../contexts/AuthContext';
import { useLottery } from '../contexts/LotteryContext';

const PRIZE_POOL: Prize[] = [
  { label: '1元', win: true, weight: 35 },
  { label: '2元', win: true, weight: 30 },
  { label: '5元', win: true, weight: 20 },
  { label: '10元', win: true, weight: 10 },
  { label: '20元', win: true, weight: 5 },
];

/** 按权重随机打乱奖品顺序 */
function shuffleByWeight(pool: readonly Prize[]): Prize[] {
  const arr = pool.map((p) => ({ ...p }));
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function BoxLottery() {
  const { user } = useAuth();
  const { todayCount, drawBox, refreshCount } = useLottery();
  const ref = useRef<GiftBoxRef>(null);
  const [boxes] = useState<Prize[]>(() => shuffleByWeight(PRIZE_POOL));
  const [lastResult, setLastResult] = useState<{ label: string; amount: number } | null>(null);
  const [used, setUsed] = useState(false);

  const handleEnd = useCallback(async (prize: Prize) => {
    if (!user) return;
    const amount = parseInt((prize.label as string).replace('元', ''), 10);
    await drawBox(user.id, amount);
    await refreshCount();
    setLastResult({ label: prize.label as string, amount });
    setUsed(true);
  }, [user, drawBox, refreshCount]);

  const handleReset = useCallback(() => {
    setLastResult(null);
    setUsed(false);
    ref.current?.reset();
  }, []);

  const canPlay = todayCount > 0 && !used;

  return (
    <div className="lottery-wrapper">
      {!canPlay && !lastResult && todayCount <= 0 && (
        <div className="card lottery-message-card">
          <span className="lottery-message-emoji">⏰</span>
          <span className="lottery-message-text">今日抽奖次数已用完，明天再来吧！</span>
        </div>
      )}

      {!canPlay && !lastResult && todayCount > 0 && used && (
        <div className="card lottery-message-card">
          <span className="lottery-message-emoji">🎁</span>
          <span className="lottery-message-text">已经打开过礼盒了，去选择其他礼盒吧！</span>
        </div>
      )}

      <div className={`lottery-game-area ${!canPlay ? 'disabled' : ''}`}>
        <div className="lottery-particles">
          <span className="particle" style={{ left: '10%', animationDelay: '0s' }}>⭐</span>
          <span className="particle" style={{ left: '25%', animationDelay: '1.2s' }}>✨</span>
          <span className="particle" style={{ left: '45%', animationDelay: '0.6s' }}>🎀</span>
          <span className="particle" style={{ left: '65%', animationDelay: '1.8s' }}>⭐</span>
          <span className="particle" style={{ left: '80%', animationDelay: '0.3s' }}>✨</span>
          <span className="particle" style={{ left: '90%', animationDelay: '2.1s' }}>🎁</span>
        </div>
        <GiftBox
          ref={ref}
          boxes={boxes}
          onEnd={handleEnd}
        />
        {canPlay && (
          <div className="lottery-hint">点击任意宝箱试试运气吧 🎁</div>
        )}
      </div>

      {lastResult && (
        <div className="card lottery-result-card">
          <span className="lottery-result-emoji">🎉</span>
          <div className="lottery-result-title">恭喜中奖！</div>
          <div className="lottery-result-amount">
            +{lastResult.amount} 元代金券
          </div>
          <button className="btn btn-primary lottery-result-btn" onClick={handleReset}>
            再抽一次
          </button>
        </div>
      )}
    </div>
  );
}
