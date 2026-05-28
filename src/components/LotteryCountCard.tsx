import styles from '../styles/Lottery.module.css';

interface LotteryCountCardProps {
  pointBalance: number;
  pointCost: number;
  todayCount: number;
}

export default function LotteryCountCard({ pointBalance, pointCost, todayCount }: LotteryCountCardProps) {
  const canDraw = pointBalance >= pointCost;

  return (
    <div className={styles.countCard}>
      <div className={styles.countCardMain}>
        当前积分：
        <span className={styles.countCardNumber}>{pointBalance}</span>
        <span className={styles.countCardTotal}> 积分</span>
      </div>
      <div className={styles.countProgress}>
        <div
          className={styles.countProgressFill}
          style={{ width: canDraw ? '100%' : `${(pointBalance / pointCost) * 100}%` }}
        />
      </div>
      <div className={styles.countRemaining}>
        {canDraw ? (
          <>可抽奖 <span className={styles.countRemainingNumber}>{Math.floor(pointBalance / pointCost)}</span> 次（每次 {pointCost} 积分）</>
        ) : (
          <>积分不足，需 <span className={styles.countRemainingNumber}>{pointCost}</span> 积分才可抽奖</>
        )}
      </div>
      <div className={styles.countCardMain} style={{ marginTop: '8px', fontSize: '0.85em', opacity: 0.7 }}>
        今日已抽奖：{todayCount} 次
      </div>
    </div>
  );
}
