import { useState, useCallback, useRef } from 'react'
import gsap from 'gsap'
import styles from '../styles/Lottery.module.css'
import LotteryResult from './LotteryResult'
import { useSoundContext } from '../contexts/SoundContext'
import { useParticleCanvas } from '../hooks/useParticleCanvas'

interface Prize {
  id: string
  label: string
  amount: number
  weight: number
  color: string
  type: 'money' | 'joke'
  emoji?: string
}

const JOKE_EMOJIS = ['🪰', '💩', '🐍', '🐛']

interface LuckyBoxProps {
  prizes: Prize[]
  onWin: (prize: Prize) => void
  disabled: boolean
}

// 权重随机选择
function weightedRandom(prizes: Prize[]): Prize {
  const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0)
  let random = Math.random() * totalWeight
  for (const prize of prizes) {
    random -= prize.weight
    if (random <= 0) return prize
  }
  return prizes[prizes.length - 1]
}

// 打乱数组
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const DEFAULT_PRIZES: Prize[] = [
  { id: '1', label: '1元', amount: 1, weight: 35, color: '#FFD700', type: 'money' },
  { id: '2', label: '2元', amount: 2, weight: 30, color: '#4ADE80', type: 'money' },
  { id: '3', label: '5元', amount: 5, weight: 20, color: '#38BDF8', type: 'money' },
  { id: '4', label: '恶搞', amount: 0, weight: 10, color: '#FB923C', type: 'joke' },
  { id: '5', label: '10元', amount: 10, weight: 5, color: '#A78BFA', type: 'money' },
]

export default function LuckyBox({ prizes = DEFAULT_PRIZES, onWin, disabled }: LuckyBoxProps) {
  // 打乱后的宝箱顺序
  const [boxes] = useState(() => shuffleArray(prizes))
  // 当前打开的宝箱索引
  const [openingIndex, setOpeningIndex] = useState<number | null>(null)
  // 中奖结果
  const [winResult, setWinResult] = useState<Prize | null>(null)
  // 是否显示结果弹窗
  const [showResult, setShowResult] = useState(false)

  const { play: playSound } = useSoundContext()
  const {
    containerRef: particleRef,
    emit: emitParticle,
    ready: particlesReady,
  } = useParticleCanvas()
  const boxGridRef = useRef<HTMLDivElement>(null)

  // 点击宝箱
  const handleBoxClick = useCallback(
    (index: number) => {
      if (disabled || openingIndex !== null) return

      const selectedPrize = weightedRandom(boxes)
      // 恶搞奖品随机选一个 emoji
      if (selectedPrize.type === 'joke') {
        selectedPrize.emoji = JOKE_EMOJIS[Math.floor(Math.random() * JOKE_EMOJIS.length)]
      }
      setOpeningIndex(index)
      setWinResult(selectedPrize)
      playSound('box_open')

      // GSAP timeline: lid opens with bounce → particles burst → prize appears → sparkle
      const tl = gsap.timeline()

      // After box opening animation (CSS handles the lid), burst particles
      tl.call(
        () => {
          if (particlesReady && boxGridRef.current) {
            const boxItems = boxGridRef.current.children
            const targetBox = boxItems[index] as HTMLElement
            if (targetBox) {
              const rect = targetBox.getBoundingClientRect()
              const gridRect = boxGridRef.current.getBoundingClientRect()
              const cx = rect.left - gridRect.left + rect.width / 2
              const cy = rect.top - gridRect.top + rect.height / 2

              emitParticle('boxBurst', {
                x: cx,
                y: cy,
                countMultiplier: selectedPrize.amount >= 10 ? 2 : 1,
              })
            }
          }
        },
        [],
        '+=0.3',
      )

      // Grand prize: second burst
      if (selectedPrize.amount >= 10) {
        tl.call(
          () => {
            if (particlesReady && boxGridRef.current) {
              const boxItems = boxGridRef.current.children
              const targetBox = boxItems[index] as HTMLElement
              if (targetBox) {
                const rect = targetBox.getBoundingClientRect()
                const gridRect = boxGridRef.current.getBoundingClientRect()
                const cx = rect.left - gridRect.left + rect.width / 2
                const cy = rect.top - gridRect.top + rect.height / 2
                emitParticle('sparkleTrail', { x: cx, y: cy, countMultiplier: 3 })
              }
            }
          },
          [],
          '+=0.2',
        )
      }

      // Show result after animation completes
      tl.call(
        () => {
          onWin(selectedPrize)
          setShowResult(true)
          playSound('confetti')
        },
        [],
        '+=0.4',
      )
    },
    [disabled, openingIndex, boxes, onWin, playSound, emitParticle, particlesReady],
  )

  // 关闭结果弹窗
  const handleCloseResult = useCallback(() => {
    setShowResult(false)
  }, [])

  // 继续抽奖（重置状态）
  const handleContinue = useCallback(() => {
    setOpeningIndex(null)
    setWinResult(null)
  }, [])

  const canPlay = !disabled && openingIndex === null

  return (
    <div className={styles.boxGameContainer}>
      {disabled && !winResult && (
        <div className={styles.statusCard}>
          <span className={styles.statusCardEmoji}>💰</span>
          积分不足，完成任务获取积分再来抽奖吧！
        </div>
      )}

      <div className={styles.boxGameMain}>
        {/* 宝箱列表 + Canvas粒子覆盖层 */}
        <div ref={boxGridRef} className={styles.boxGrid} style={{ position: 'relative' }}>
          <div ref={particleRef} className={styles.particleOverlay} />
          {boxes.map((prize, index) => {
            const isOpening = openingIndex === index
            const isOpened = openingIndex !== null && openingIndex !== index

            return (
              <div
                key={prize.id}
                className={`${styles.boxItem} ${!canPlay ? styles.disabled : ''} ${isOpening ? styles.opening : ''} ${isOpened ? styles.opened : ''}`}
                onClick={() => handleBoxClick(index)}
              >
                <div className={styles.boxBody}>
                  {/* 宝箱盖子 */}
                  <div className={styles.boxLid}>
                    {/* 蝴蝶结丝带 */}
                    <div className={styles.boxRibbon}>
                      <div className={styles.boxRibbonLeft} />
                      <div className={styles.boxRibbonRight} />
                      <div className={styles.boxRibbonCenter} />
                    </div>
                  </div>
                  {/* 宝箱主体 */}
                  <div className={styles.boxChest} />
                  {/* 五角星徽章 */}
                  <span className={styles.boxStar}>★</span>
                  {/* 光效 */}
                  <div className={styles.boxGlow} />
                  {/* 奖品图标 */}
                  <span className={styles.boxPrize}>{prize.type === 'joke' ? '👻' : '🪙'}</span>
                </div>
              </div>
            )
          })}
        </div>

        {canPlay && <div className={styles.boxHint}>点击任意宝箱试试运气吧！👇</div>}
      </div>

      {/* 结果弹窗 */}
      <LotteryResult
        visible={showResult}
        amount={winResult?.amount ?? 0}
        type={winResult?.type ?? 'money'}
        jokeEmoji={winResult?.emoji}
        canContinue={!disabled}
        onClose={handleCloseResult}
        onContinue={handleContinue}
      />
    </div>
  )
}
