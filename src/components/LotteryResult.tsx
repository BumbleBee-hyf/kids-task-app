import { useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import styles from '../styles/Lottery.module.css'
import { ParticleSystem } from '../engine/ParticleSystem'
import { useSoundContext } from '../contexts/SoundContext'

interface LotteryResultProps {
  visible: boolean
  amount: number
  type: 'money' | 'joke'
  tier?: 'normal' | 'joke' | 'grand'
  jokeEmoji?: string
  canContinue?: boolean
  onClose: () => void
  onContinue: () => void
}

export default function LotteryResult({
  visible,
  amount,
  type,
  tier = 'normal',
  jokeEmoji,
  canContinue = true,
  onClose,
  onContinue,
}: LotteryResultProps) {
  const isGrand = tier === 'grand'
  const { play: playSound } = useSoundContext()
  const particleContainerRef = useRef<HTMLDivElement>(null)
  const particleSystemRef = useRef<ParticleSystem | null>(null)

  // Initialize and manage Canvas confetti
  useEffect(() => {
    if (!visible) return

    const container = particleContainerRef.current
    if (!container) return

    const system = new ParticleSystem()
    particleSystemRef.current = system

    system
      .init(container, {
        width: window.innerWidth,
        height: window.innerHeight,
      })
      .then(() => {
        // Confetti rain from top
        system.emit('confettiRain', {
          x: window.innerWidth / 2,
          y: -20,
          countMultiplier: isGrand ? 2 : 1,
        })

        // Confetti cannons from bottom corners
        system.emit('confettiCannon', {
          x: window.innerWidth * 0.1,
          y: window.innerHeight * 0.9,
        })
        system.emit('confettiCannon', {
          x: window.innerWidth * 0.9,
          y: window.innerHeight * 0.9,
        })

        // Grand prize: extra golden sparkle burst from center
        if (isGrand) {
          setTimeout(() => {
            system.emit('celebrationBurst', {
              x: window.innerWidth / 2,
              y: window.innerHeight / 2,
              countMultiplier: 2,
            })
          }, 300)
        }

        playSound('confetti')
      })
      .catch((err) => {
        console.warn('Confetti particle system init failed:', err)
      })

    return () => {
      system.destroy()
      particleSystemRef.current = null
    }
  }, [visible, isGrand, playSound])

  const handleContinue = useCallback(() => {
    onContinue()
    onClose()
  }, [onContinue, onClose])

  if (!visible) return null

  const modalContent = (
    <>
      {/* Canvas confetti overlay */}
      <div
        ref={particleContainerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 9998,
        }}
      />

      {/* 弹窗 */}
      <div className={styles.resultOverlay} onClick={onClose}>
        <div
          className={`${styles.resultModal} ${isGrand ? styles.resultGrandModal : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
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
            <button
              className={`${styles.resultBtn} ${styles.resultBtnSecondary}`}
              onClick={onClose}
            >
              关闭
            </button>
            {canContinue && (
              <button
                className={`${styles.resultBtn} ${styles.resultBtnPrimary}`}
                onClick={handleContinue}
              >
                再来一次
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )

  // 使用 Portal 渲染到 body
  return createPortal(modalContent, document.body)
}
