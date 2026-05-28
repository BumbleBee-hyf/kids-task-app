import { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from '../styles/Lottery.module.css';

interface LotteryResultProps {
  visible: boolean;
  amount: number;
  type: 'money' | 'joke';
  tier?: 'normal' | 'joke' | 'grand';
  jokeEmoji?: string;
  canContinue?: boolean;
  onClose: () => void;
  onContinue: () => void;
}

interface Confetti {
  id: number;
  left: number;
  color: string;
  delay: number;
  duration: number;
  shape: 'square' | 'circle';
}

const CONFETTI_COLORS = ['#FF8C42', '#FFA559', '#D4A853', '#FF6B9D', '#4ADE80', '#FBBF24'];
const GRAND_CONFETTI_COLORS = ['#FFD700', '#FFA500', '#FF8C00', '#FFE4B5', '#F0E68C'];

function generateConfetti(grand = false): Confetti[] {
  const colors = grand ? GRAND_CONFETTI_COLORS : CONFETTI_COLORS;
  const count = grand ? 80 : 50;
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    shape: Math.random() > 0.5 ? 'square' : 'circle',
  }));
}

export default function LotteryResult({ visible, amount, type, tier = 'normal', jokeEmoji, canContinue = true, onClose, onContinue }: LotteryResultProps) {
  const [confetti, setConfetti] = useState<Confetti[]>([]);

  const isGrand = tier === 'grand';

  useEffect(() => {
    if (visible) {
      setConfetti(generateConfetti(isGrand));
      // 清理彩纸
      const timer = setTimeout(() => setConfetti([]), 4000);
      return () => clearTimeout(timer);
    }
  }, [visible, isGrand]);

  const handleContinue = useCallback(() => {
    onContinue();
    onClose();
  }, [onContinue, onClose]);

  if (!visible) return null;

  const modalContent = (
    <>
      {/* 彩纸效果 */}
      <div className={styles.confettiContainer}>
        {confetti.map((c) => (
          <div
            key={c.id}
            className={styles.confetti}
            style={{
              left: `${c.left}%`,
              backgroundColor: c.color,
              borderRadius: c.shape === 'circle' ? '50%' : '2px',
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
            }}
          />
        ))}
      </div>

      {/* 弹窗 */}
      <div className={styles.resultOverlay} onClick={onClose}>
        <div className={`${styles.resultModal} ${isGrand ? styles.resultGrandModal : ''}`} onClick={(e) => e.stopPropagation()}>
          {tier === 'grand' ? (
            <>
              <span className={`${styles.resultEmoji} ${styles.resultGrandEmoji}`}>🏆</span>
              <div className={styles.resultGrandTitle}>超级大奖！</div>
              <div className={styles.resultGrandAmount}>+{amount} 元代金券</div>
            </>
          ) : type === 'joke' ? (
            <>
              <span className={styles.resultEmoji}>😂</span>
              <div className={styles.resultTitle}>恶搞奖品！</div>
              <div className={styles.resultAmount}>{jokeEmoji ?? '👻'}</div>
            </>
          ) : (
            <>
              <span className={styles.resultEmoji}>🎉</span>
              <div className={styles.resultTitle}>恭喜中奖！</div>
              <div className={styles.resultAmount}>+{amount} 元代金券</div>
            </>
          )}
          <div className={styles.resultActions}>
            <button className={`${styles.resultBtn} ${styles.resultBtnSecondary}`} onClick={onClose}>
              关闭
            </button>
            {canContinue && (
              <button className={`${styles.resultBtn} ${styles.resultBtnPrimary}`} onClick={handleContinue}>
                再来一次
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );

  // 使用 Portal 渲染到 body
  return createPortal(modalContent, document.body);
}
