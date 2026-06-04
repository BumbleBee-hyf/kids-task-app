import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLottery } from '../../contexts/LotteryContext';
import { usePoints } from '../../contexts/PointsContext';
import { useVouchers } from '../../contexts/VoucherContext';
import LotteryCountCard from '../../components/LotteryCountCard';
import LuckyBox from '../../components/LuckyBox';
import LuckyWheel from '../../components/LuckyWheel';
import styles from '../../styles/Lottery.module.css';

type GameType = 'box' | 'wheel';

export default function LotteryPage() {
  const { user } = useAuth();
  const { pointCost, todayCount, drawBox, spinWheel, refreshCount, config, refreshConfig } = useLottery();
  const { balance: pointBalance, refreshBalance } = usePoints();
  const { refreshData: refreshVouchers } = useVouchers();
  const [activeGame, setActiveGame] = useState<GameType>('box');

  useEffect(() => {
    if (user) {
      refreshBalance(user.id);
      refreshCount();
      refreshConfig();
    }
  }, [user, refreshBalance, refreshCount, refreshConfig]);

  // Tab切换时刷新数据
  useEffect(() => {
    if (user) {
      refreshBalance(user.id);
      refreshCount();
    }
  }, [activeGame]);

  const canDraw = pointBalance >= pointCost;

  // 从后端配置中获取奖品列表
  const boxPrizes = (config?.boxPrizes || []).map((p, i) => ({
    id: String(i + 1),
    label: p.label,
    amount: p.amount,
    weight: p.weight,
    color: p.color,
    type: p.type,
  }));

  const wheelPrizes = (config?.wheelSegments || []).map(p => ({
    label: p.label,
    amount: p.amount,
    weight: p.weight,
    color: p.color,
    type: p.type,
  }));

  // 抽箱子中奖回调
  const handleBoxWin = useCallback(async (_prize: { amount: number }) => {
    if (!user) return;
    const result = await drawBox(user.id, pointBalance);
    if (result.success) {
      await refreshBalance(user.id);
      await refreshVouchers();
    }
  }, [user, pointBalance, drawBox, refreshBalance, refreshVouchers]);

  // 大转盘结束回调
  const handleWheelEnd = useCallback(async (_prize: { amount: number }) => {
    if (!user) return;
    const result = await spinWheel(user.id, pointBalance);
    if (result.success) {
      await refreshBalance(user.id);
      await refreshVouchers();
    }
  }, [user, pointBalance, spinWheel, refreshBalance, refreshVouchers]);

  return (
    <div className={styles.lotteryPage}>
      {/* 标题 */}
      <header className={styles.lotteryHeader}>
        <h1 className={styles.lotteryTitle}>
          <span className={styles.lotteryTitleIcon}>🎰</span>
          抽奖中心
        </h1>
      </header>

      {/* 积分统计卡片 */}
      <LotteryCountCard
        pointBalance={pointBalance}
        pointCost={pointCost}
        todayCount={todayCount}
      />

      {/* 游戏切换标签 */}
      <div className={styles.gameTabs}>
        <button
          className={`${styles.gameTab} ${activeGame === 'box' ? styles.active : ''}`}
          onClick={() => setActiveGame('box')}
        >
          <span className={styles.gameTabIcon}>📦</span>
          抽箱子
        </button>
        <button
          className={`${styles.gameTab} ${activeGame === 'wheel' ? styles.active : ''}`}
          onClick={() => setActiveGame('wheel')}
        >
          <span className={styles.gameTabIcon}>🎡</span>
          大转盘
        </button>
      </div>

      {/* 游戏区域 */}
      {activeGame === 'box' ? (
        <LuckyBox
          prizes={boxPrizes}
          onWin={handleBoxWin}
          disabled={!canDraw}
        />
      ) : (
        <LuckyWheel
          prizes={wheelPrizes}
          onSpinEnd={handleWheelEnd}
          disabled={!canDraw}
        />
      )}

      {/* 装饰元素 - 礼物盒 */}
      <div className={styles.decoGiftBox}>🎁</div>
    </div>
  );
}
