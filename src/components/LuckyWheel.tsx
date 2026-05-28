import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import styles from '../styles/Lottery.module.css';
import LotteryResult from './LotteryResult';

interface WheelPrize {
  label: string;
  amount: number;
  weight: number;
  color: string;
  type: 'money' | 'joke';
  emoji?: string;
}

const JOKE_EMOJIS = ['🪰', '💩', '🐍', '🐛'];

interface LuckyWheelProps {
  prizes: WheelPrize[];
  onSpinEnd: (prize: WheelPrize) => void;
  disabled: boolean;
}

const DEFAULT_PRIZES: WheelPrize[] = [
  { label: '100元', amount: 100, weight: 0.5, color: '#FF2D55', type: 'money' },
  { label: '1元', amount: 1, weight: 37, color: '#FBBF24', type: 'money' },
  { label: '2元', amount: 2, weight: 25, color: '#FCD34D', type: 'money' },
  { label: '1元', amount: 1, weight: 37, color: '#4ADE80', type: 'money' },
  { label: '5元', amount: 5, weight: 12.5, color: '#2DD4BF', type: 'money' },
  { label: '恶搞', amount: 0, weight: 12.5, color: '#FB923C', type: 'joke' },
  { label: '2元', amount: 2, weight: 25, color: '#818CF8', type: 'money' },
  { label: '10元', amount: 10, weight: 12.5, color: '#A78BFA', type: 'money' },
  { label: '1元', amount: 1, weight: 37, color: '#38BDF8', type: 'money' },
];

// 权重随机选择
function weightedRandom(prizes: WheelPrize[]): number {
  const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < prizes.length; i++) {
    random -= prizes[i].weight;
    if (random <= 0) return i;
  }
  return prizes.length - 1;
}

// 颜色变亮
function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

// 抽奖规则
const LOTTERY_RULES = [
  '每次抽奖消耗10积分',
  '奖品随机抽取，概率公平公正',
  '中奖后自动发放代金券',
];

export default function LuckyWheel({ prizes = DEFAULT_PRIZES, onSpinEnd, disabled }: LuckyWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winResult, setWinResult] = useState<WheelPrize | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [lightsOn, setLightsOn] = useState(true);

  // 绘制转盘
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 340;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = size / 2 - 6;
    const innerRadius = size / 2 - 18;
    const segmentAngle = (2 * Math.PI) / prizes.length;

    // 外圈金色边框
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#D4A853';
    ctx.fill();

    // 内圈阴影
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius + 2, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fill();

    // 绘制扇区
    prizes.forEach((prize, i) => {
      const startAngle = i * segmentAngle - Math.PI / 2;
      const endAngle = startAngle + segmentAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, innerRadius, startAngle, endAngle);
      ctx.closePath();

      // 渐变填充
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, innerRadius);
      gradient.addColorStop(0, lightenColor(prize.color, 20));
      gradient.addColorStop(1, prize.color);
      ctx.fillStyle = gradient;
      ctx.fill();

      // 边框
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 100元扇区特殊金色边框
      if (prize.amount === 100) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4;
        ctx.stroke();
      }

      // 奖品图标
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = 'center';
      ctx.font = '20px serif';
      if (prize.type === 'joke') {
        ctx.fillText('👻', innerRadius * 0.55, -8);
      } else if (prize.amount === 100) {
        ctx.fillText('🏆', innerRadius * 0.55, -8);
      } else {
        ctx.fillText('🪙', innerRadius * 0.55, -8);
      }
      ctx.restore();

      // 金额文字
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = prize.amount === 100 ? 'bold 15px Nunito, sans-serif' : 'bold 13px Nunito, sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 3;
      ctx.fillText(prize.label, innerRadius * 0.55, 12);
      ctx.restore();
    });

    // 中心装饰圈
    ctx.beginPath();
    ctx.arc(centerX, centerY, 44, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fill();
  }, [prizes]);

  // LED 灯闪烁
  useEffect(() => {
    const interval = setInterval(() => {
      setLightsOn((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // 开始旋转
  const handleSpin = useCallback(() => {
    if (disabled || isSpinning) return;

    setIsSpinning(true);
    const winIndex = weightedRandom(prizes);
    const winPrize = { ...prizes[winIndex] };
    // 恶搞奖品随机选一个 emoji
    if (winPrize.type === 'joke') {
      winPrize.emoji = JOKE_EMOJIS[Math.floor(Math.random() * JOKE_EMOJIS.length)];
    }
    const segmentAngle = 360 / prizes.length;
    // 计算目标角度（让指针指向中奖扇区中心）
    const targetAngle = 360 - (winIndex * segmentAngle + segmentAngle / 2);
    // 加上多圈旋转
    const totalRotation = rotation + 360 * 5 + targetAngle - (rotation % 360);

    setRotation(totalRotation);

    // 动画结束后处理
    setTimeout(() => {
      setIsSpinning(false);
      setWinResult(winPrize);
      onSpinEnd(winPrize);
      setShowResult(true);
    }, 4000);
  }, [disabled, isSpinning, prizes, rotation, onSpinEnd]);

  // 关闭结果弹窗
  const handleCloseResult = useCallback(() => {
    setShowResult(false);
  }, []);

  // 继续抽奖
  const handleContinue = useCallback(() => {
    setWinResult(null);
  }, []);

  // 生成 LED 灯位置
  const lights = useMemo(() => {
    const count = 24;
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
      const radius = 180;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      };
    });
  }, []);

  return (
    <div className={styles.wheelGameContainer}>
      {/* 左侧信息栏 */}
      <div className={styles.wheelSideInfo}>
        <div className={styles.playsLeft}>
      
        </div>
      </div>

      {/* 中间转盘 */}
      <div className={styles.wheelOuter}>
        {/* LED 灯圈 */}
        <div className={styles.wheelLights}>
          {lights.map((light, i) => (
            <div
              key={i}
              className={`${styles.wheelLight} ${lightsOn ? styles.on : ''}`}
              style={{
                transform: `translate(calc(-50% + ${light.x}px), calc(-50% + ${light.y}px))`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>

        <div className={styles.wheelWrapper}>
          {/* 指针 - 粉红色 */}
          <div className={`${styles.wheelPointer} ${isSpinning ? styles.bounce : ''}`}>
            <svg viewBox="0 0 36 44" fill="none">
              <path
                d="M18 44L3 16C1 11 3 5 8 4L18 8L28 4C33 5 35 11 33 16L18 44Z"
                fill="url(#pointerGradient)"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="2"
              />
              <defs>
                <linearGradient id="pointerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FF6B9D" />
                  <stop offset="100%" stopColor="#E8557A" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* 转盘 Canvas */}
          <canvas
            ref={canvasRef}
            className={`${styles.wheelCanvas} ${isSpinning ? styles.spinning : ''}`}
            style={{ transform: `rotate(${rotation}deg)` }}
          />

          {/* 中心按钮 */}
          <button
            className={styles.wheelCenter}
            onClick={handleSpin}
            disabled={disabled || isSpinning}
          >
            {isSpinning ? '...' : 'SPIN'}
          </button>
        </div>
      </div>

      {/* 右侧规则面板 */}
      <div className={styles.wheelRules}>
        <div className={styles.wheelRulesTitle}>
          ⭐ 抽奖规则
        </div>
        <ul className={styles.wheelRulesList}>
          {LOTTERY_RULES.map((rule, i) => (
            <li key={i} className={styles.wheelRulesItem}>{rule}</li>
          ))}
        </ul>
      </div>

      {/* 结果弹窗 */}
      <LotteryResult
        visible={showResult}
        amount={winResult?.amount ?? 0}
        type={winResult?.type ?? 'money'}
        jokeEmoji={winResult?.emoji}
        tier={winResult?.amount === 100 ? 'grand' : 'normal'}
        canContinue={!disabled}
        onClose={handleCloseResult}
        onContinue={handleContinue}
      />
    </div>
  );
}
