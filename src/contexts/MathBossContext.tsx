import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { mathBossStorage } from '../services/storageService'
import { usePoints } from './PointsContext'
import {
  MATH_BOSSES,
  MINECRAFT_BOSSES,
  HIDDEN_BOSS_MAP,
  PLAYER_MAX_HEARTS,
  MATH_BOSS_REWARDS,
} from '../types'
import type { HiddenTheme } from '../types'

export type GamePhase = 'idle' | 'playing' | 'result'
export type GameMode = 'normal' | 'hidden'
export type AttackType = 'normal' | 'shadowStrike' | 'risingDragon'

export interface CheckResult {
  isCorrect: boolean
  correctAnswer: number | string
  /** 本次答对后的连击数 */
  pendingCombo: number
  /** 可用的技能 */
  availableSkills: AttackType[]
  gameOver: boolean
}

export interface AttackResult {
  damage: number
  bossDefeated: boolean
  allBossesCleared: boolean
  gameOver: boolean
}

interface MathBossContextType {
  phase: GamePhase
  gameMode: GameMode
  currentBossIndex: number
  currentQuestion: {
    a: number
    b: number
    operator?: '+' | '-'
    answer?: number
    result?: number
    correctOperator?: '+' | '-'
    difficulty: string
    mode?: string
    blank?: string
  } | null
  bossHearts: number[]
  playerHearts: number
  bossesDefeated: number
  comboCount: number
  maxCombo: number
  totalQuestions: number
  correctCount: number
  reward: number
  todayPlayCount: number
  todayBestScore: number
  hiddenUnlocked: boolean
  hiddenTheme: HiddenTheme
  unlockedSkins: { id: string; bossIcon: string; theme: string; unlockedAt: string }[]
  equippedSkin: string | null
  equipSkin: (icon: string | null) => void
  hiddenTodayPlayCount: number
  hiddenTodayBestScore: number
  startGame: (
    studentId: string,
    mode?: GameMode,
    theme?: HiddenTheme,
  ) => Promise<{ success: boolean; error?: string }>
  /** 仅验证答案，不造成伤害 */
  checkAnswer: (answer: number | string) => CheckResult
  /** 选择攻击方式后执行伤害 */
  applyAttack: (type: AttackType) => AttackResult
  advanceToNextBoss: () => void
  fetchNextQuestion: () => Promise<void>
  finishGame: (studentId: string) => Promise<{ unlockedHidden?: boolean }>
  resetGame: () => void
  refreshStatus: (studentId: string) => Promise<void>
  refreshHiddenStatus: (studentId: string) => Promise<void>
  refreshSkins: (studentId: string) => Promise<void>
}

const MathBossContext = createContext<MathBossContextType | null>(null)

export function MathBossProvider({ children }: { children: React.ReactNode }) {
  const { refreshBalance } = usePoints()

  const [phase, setPhase] = useState<GamePhase>('idle')
  const [gameMode, setGameMode] = useState<GameMode>('normal')
  const [currentBossIndex, setCurrentBossIndex] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState<{
    a: number
    b: number
    operator?: '+' | '-'
    answer?: number
    result?: number
    correctOperator?: '+' | '-'
    difficulty: string
    mode?: string
    blank?: string
  } | null>(null)
  const [bossHearts, setBossHearts] = useState<number[]>(MATH_BOSSES.map((b) => b.hearts))
  const [playerHearts, setPlayerHearts] = useState(PLAYER_MAX_HEARTS)
  const [bossesDefeated, setBossesDefeated] = useState(0)
  const [comboCount, setComboCount] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [reward, setReward] = useState(0)
  const [todayPlayCount, setTodayPlayCount] = useState(0)
  const [todayBestScore, setTodayBestScore] = useState(0)
  const [hiddenUnlocked, setHiddenUnlocked] = useState(false)
  const [hiddenTheme, setHiddenTheme] = useState<HiddenTheme>('minecraft')
  const [unlockedSkins, setUnlockedSkins] = useState<
    { id: string; bossIcon: string; theme: string; unlockedAt: string }[]
  >([])
  const [equippedSkin, setEquippedSkin] = useState<string | null>(null)
  const [hiddenTodayPlayCount, setHiddenTodayPlayCount] = useState(0)
  const [hiddenTodayBestScore, setHiddenTodayBestScore] = useState(0)

  // ref
  const bossHeartsRef = useRef(MATH_BOSSES.map((b) => b.hearts))
  const currentBossIndexRef = useRef(0)
  const bossesDefeatedRef = useRef(0)
  const playerHeartsRef = useRef(PLAYER_MAX_HEARTS)
  const comboCountRef = useRef(0)
  const currentQuestionRef = useRef<{
    a: number
    b: number
    operator?: '+' | '-'
    answer?: number
    result?: number
    correctOperator?: '+' | '-'
    difficulty: string
    mode?: string
    blank?: string
  } | null>(null)
  const gameModeRef = useRef<GameMode>('normal')
  const hiddenThemeRef = useRef<HiddenTheme>('minecraft')

  const getBossArray = useCallback((mode: GameMode, theme?: HiddenTheme) => {
    if (mode === 'hidden') {
      const t = theme || hiddenThemeRef.current
      return HIDDEN_BOSS_MAP[t] || MINECRAFT_BOSSES
    }
    return MATH_BOSSES
  }, [])

  const refreshStatus = useCallback(async (studentId: string) => {
    try {
      const status = await mathBossStorage.getStatus(studentId)
      setTodayPlayCount(status.playCount)
      setTodayBestScore(status.bestScore)
      setHiddenUnlocked(status.hiddenUnlocked)
    } catch {
      // ignore
    }
  }, [])

  const refreshHiddenStatus = useCallback(async (studentId: string) => {
    try {
      const status = await mathBossStorage.getHiddenStatus(studentId)
      setHiddenUnlocked(status.unlocked)
      setHiddenTodayPlayCount(status.todayPlayCount)
      setHiddenTodayBestScore(status.todayBestScore)
      if (status.todayTheme) setHiddenTheme(status.todayTheme)
    } catch {
      // ignore
    }
  }, [])

  const refreshSkins = useCallback(async (studentId: string) => {
    try {
      const result = await mathBossStorage.getSkins(studentId)
      setUnlockedSkins(result.skins)
    } catch {
      // ignore
    }
  }, [])

  const equipSkin = useCallback((icon: string | null) => {
    setEquippedSkin(icon)
  }, [])

  const startGame = useCallback(
    async (studentId: string, mode: GameMode = 'normal', theme: HiddenTheme = 'minecraft') => {
      try {
        const result = await mathBossStorage.start(studentId, mode)
        if (result.success) {
          const bosses = mode === 'hidden' ? HIDDEN_BOSS_MAP[theme] : MATH_BOSSES
          const initialHearts = bosses.map((b) => b.hearts)
          setGameMode(mode)
          if (mode === 'hidden') setHiddenTheme(theme)
          setCurrentBossIndex(0)
          setCurrentQuestion(result.question)
          setBossHearts(initialHearts)
          setPlayerHearts(PLAYER_MAX_HEARTS)
          setBossesDefeated(0)
          setComboCount(0)
          setMaxCombo(0)
          setTotalQuestions(0)
          setCorrectCount(0)
          setReward(0)
          setPhase('playing')
          // 同步 ref
          gameModeRef.current = mode
          if (mode === 'hidden') hiddenThemeRef.current = theme
          bossHeartsRef.current = initialHearts
          currentBossIndexRef.current = 0
          bossesDefeatedRef.current = 0
          playerHeartsRef.current = PLAYER_MAX_HEARTS
          comboCountRef.current = 0
          currentQuestionRef.current = result.question
          return { success: true }
        }
        return { success: false, error: '开始挑战失败' }
      } catch (err: any) {
        return { success: false, error: err.message || '开始挑战失败' }
      }
    },
    [],
  )

  // 仅验证答案，不造成伤害
  const checkAnswer = useCallback((answer: number | string): CheckResult => {
    const q = currentQuestionRef.current
    if (!q)
      return {
        isCorrect: false,
        correctAnswer: 0,
        pendingCombo: 0,
        availableSkills: [],
        gameOver: true,
      }

    const isHidden = gameModeRef.current === 'hidden'
    let isCorrect: boolean
    let correctAnswer: number | string

    if (isHidden) {
      // 隐藏模式：填空题，比较数字答案
      correctAnswer = q.answer ?? 0
      isCorrect = (answer as number) === correctAnswer
    } else {
      correctAnswer = q.answer ?? 0
      isCorrect = (answer as number) === correctAnswer
    }

    let gameOver = false
    let pendingCombo = 0
    let availableSkills: AttackType[] = []

    setTotalQuestions((prev) => prev + 1)

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1)

      // 连击+1
      const newCombo = comboCountRef.current + 1
      comboCountRef.current = newCombo
      setComboCount(newCombo)
      setMaxCombo((prev) => Math.max(prev, newCombo))

      pendingCombo = newCombo

      // 根据连击数确定可用技能
      if (newCombo >= 5) {
        availableSkills = ['normal', 'shadowStrike', 'risingDragon']
      } else if (newCombo >= 3) {
        availableSkills = ['normal', 'shadowStrike']
      } else {
        availableSkills = ['normal']
      }
    } else {
      // 答错 — 后3关Boss伤害翻倍
      const isHardBoss = !isHidden && currentBossIndexRef.current >= 7
      const heartLoss = isHardBoss ? 2 : 1
      const newHearts = playerHeartsRef.current - heartLoss
      playerHeartsRef.current = newHearts
      setPlayerHearts(newHearts)
      if (newHearts <= 0) {
        gameOver = true
      }
      comboCountRef.current = 0
      setComboCount(0)
    }

    return { isCorrect, correctAnswer, pendingCombo, availableSkills, gameOver }
  }, [])

  // 选择攻击方式后执行伤害
  const applyAttack = useCallback((type: AttackType): AttackResult => {
    const isHidden = gameModeRef.current === 'hidden'
    const curBossHearts = [...bossHeartsRef.current]
    const curBossIndex = currentBossIndexRef.current
    const bossArray = isHidden ? HIDDEN_BOSS_MAP[hiddenThemeRef.current] : MATH_BOSSES

    let damage = 1
    if (type === 'shadowStrike') {
      damage = 2
      // 使用技能后清空连击
      comboCountRef.current = 0
      setComboCount(0)
    } else if (type === 'risingDragon') {
      damage = 3
      comboCountRef.current = 0
      setComboCount(0)
    }
    // normal: 连击保持（已在 checkAnswer 中累加）

    curBossHearts[curBossIndex] = Math.max(0, curBossHearts[curBossIndex] - damage)
    bossHeartsRef.current = curBossHearts
    setBossHearts(curBossHearts)

    let bossDefeated = false
    let allBossesCleared = false

    if (curBossHearts[curBossIndex] <= 0) {
      bossDefeated = true
      const newDefeated = bossesDefeatedRef.current + 1
      bossesDefeatedRef.current = newDefeated
      setBossesDefeated(newDefeated)

      const nextBossIndex = curBossIndex + 1
      if (nextBossIndex >= bossArray.length) {
        allBossesCleared = true
      }
    }

    return { damage, bossDefeated, allBossesCleared, gameOver: false }
  }, [])

  // 击杀动画播完后，推进到下一个Boss
  const advanceToNextBoss = useCallback(() => {
    const nextIndex = currentBossIndexRef.current + 1
    const bossArray = getBossArray(gameModeRef.current)
    if (nextIndex < bossArray.length) {
      currentBossIndexRef.current = nextIndex
      setCurrentBossIndex(nextIndex)
    }
  }, [])

  const fetchNextQuestion = useCallback(async () => {
    const isHidden = gameModeRef.current === 'hidden'
    const bossArray = getBossArray(gameModeRef.current)
    const bossIndex = currentBossIndexRef.current
    const boss = bossArray[bossIndex]
    if (!boss) return
    try {
      const result = await mathBossStorage.getQuestion(
        boss.difficulty,
        isHidden ? 'hidden' : 'normal',
      )
      if (result.success) {
        setCurrentQuestion(result.question)
        currentQuestionRef.current = result.question
      }
    } catch {
      // ignore
    }
  }, [])

  const finishGame = useCallback(
    async (studentId: string) => {
      const defeated = bossesDefeatedRef.current
      const hearts = playerHeartsRef.current
      const total = totalQuestions
      const correct = correctCount
      const mode = gameModeRef.current
      try {
        const result = await mathBossStorage.finish(
          studentId,
          defeated,
          total,
          correct,
          mode,
          hearts,
          mode === 'hidden' ? hiddenThemeRef.current : undefined,
        )
        setReward(result.reward)
        setBossesDefeated(result.bossesDefeated)
        await refreshBalance(studentId)
        await refreshStatus(studentId)
        if (result.unlockedHidden) {
          // 标记今日已解锁，但刷新后会被服务端每日状态覆盖
          setHiddenUnlocked(true)
        }
        if (result.unlockedSkins && result.unlockedSkins.length > 0) {
          // 刷新皮肤列表
          await refreshSkins(studentId)
        }
        setPhase('result')
        return { unlockedHidden: !!result.unlockedHidden }
      } catch {
        const rewards =
          mode === 'hidden'
            ? { 0: 0, 1: 0, 2: 0, 3: 0, 4: 6, 5: 11, 6: 15, 7: 20, 8: 24, 9: 29, 10: 38 }
            : MATH_BOSS_REWARDS
        setReward(rewards[defeated] || 0)
        setPhase('result')
        return { unlockedHidden: false }
      }
    },
    [refreshBalance, refreshStatus, totalQuestions, correctCount],
  )

  const resetGame = useCallback(() => {
    setPhase('idle')
    setGameMode('normal')
    setCurrentBossIndex(0)
    setCurrentQuestion(null)
    setBossHearts(MATH_BOSSES.map((b) => b.hearts))
    setPlayerHearts(PLAYER_MAX_HEARTS)
    setBossesDefeated(0)
    setComboCount(0)
    setMaxCombo(0)
    setTotalQuestions(0)
    setCorrectCount(0)
    setReward(0)
    // 重置 ref
    gameModeRef.current = 'normal'
    bossHeartsRef.current = MATH_BOSSES.map((b) => b.hearts)
    currentBossIndexRef.current = 0
    bossesDefeatedRef.current = 0
    playerHeartsRef.current = PLAYER_MAX_HEARTS
    comboCountRef.current = 0
    currentQuestionRef.current = null
  }, [])

  return (
    <MathBossContext.Provider
      value={{
        phase,
        gameMode,
        currentBossIndex,
        currentQuestion,
        bossHearts,
        playerHearts,
        bossesDefeated,
        comboCount,
        maxCombo,
        totalQuestions,
        correctCount,
        reward,
        todayPlayCount,
        todayBestScore,
        hiddenUnlocked,
        hiddenTheme,
        unlockedSkins,
        equippedSkin,
        hiddenTodayPlayCount,
        hiddenTodayBestScore,
        startGame,
        checkAnswer,
        applyAttack,
        advanceToNextBoss,
        fetchNextQuestion,
        finishGame,
        resetGame,
        refreshStatus,
        refreshHiddenStatus,
        refreshSkins,
        equipSkin,
      }}
    >
      {children}
    </MathBossContext.Provider>
  )
}

export function useMathBoss(): MathBossContextType {
  const ctx = useContext(MathBossContext)
  if (!ctx) throw new Error('useMathBoss must be used within MathBossProvider')
  return ctx
}
