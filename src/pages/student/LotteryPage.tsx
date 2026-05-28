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
  const { pointCost, todayCount, drawBox, spinWheel, refreshCount } = useLottery();
  const { balance: pointBalance, refreshBalance } = usePoints();
  const { refreshData: refreshVouchers } = useVouchers();
  const [activeGame, setActiveGame] = useState<GameType>('box');

  useEffect(() => {
    if (user) {
      refreshBalance(user.id);
      refreshCount();
    }
  }, [user, refreshBalance, refreshCount]);

  // Tab切换时刷新数据
  useEffect(() => {
    if (user) {
      refreshBalance(user.id);
      refreshCount();
    }
  }, [activeGame]);

  const canDraw = pointBalance >= pointCost;

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
          prizes={[
            { id: '1', label: '1元', amount: 1, weight: 35, color: '#FFD700', type: 'money' },
            { id: '2', label: '2元', amount: 2, weight: 30, color: '#4ADE80', type: 'money' },
            { id: '3', label: '5元', amount: 5, weight: 20, color: '#38BDF8', type: 'money' },
            { id: '4', label: '恶搞', amount: 0, weight: 10, color: '#FB923C', type: 'joke' },
            { id: '5', label: '10元', amount: 10, weight: 5, color: '#A78BFA', type: 'money' },
          ]}
          onWin={handleBoxWin}
          disabled={!canDraw}
        />
      ) : (
        <LuckyWheel
          prizes={[
            { label: '100元', amount: 100, weight: 0.5, color: '#FF2D55', type: 'money' },
            { label: '1元', amount: 1, weight: 37, color: '#FBBF24', type: 'money' },
            { label: '2元', amount: 2, weight: 25, color: '#FCD34D', type: 'money' },
            { label: '1元', amount: 1, weight: 37, color: '#4ADE80', type: 'money' },
            { label: '5元', amount: 5, weight: 12.5, color: '#2DD4BF', type: 'money' },
            { label: '恶搞', amount: 0, weight: 12.5, color: '#FB923C', type: 'joke' },
            { label: '2元', amount: 2, weight: 25, color: '#818CF8', type: 'money' },
            { label: '10元', amount: 10, weight: 12.5, color: '#A78BFA', type: 'money' },
            { label: '1元', amount: 1, weight: 37, color: '#38BDF8', type: 'money' },
          ]}
          onSpinEnd={handleWheelEnd}
          disabled={!canDraw}
        />
      )}

      {/* 装饰元素 - 礼物盒 */}
      <div className={styles.decoGiftBox}>🎁</div>
    </div>
  );
}
