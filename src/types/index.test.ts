import { describe, it, expect } from 'vitest'
import {
  LOTTERY_POINT_COST,
  CHECKIN_POINTS,
  MATH_BOSS_COST,
  PLAYER_MAX_HEARTS,
  MATH_BOSS_REWARDS,
  MINECRAFT_BOSS_REWARDS,
  MATH_BOSSES,
  MINECRAFT_BOSSES,
  HIDDEN_BOSS_MAP,
} from '../types'

describe('Types Constants', () => {
  it('LOTTERY_POINT_COST should be 10', () => {
    expect(LOTTERY_POINT_COST).toBe(10)
  })

  it('CHECKIN_POINTS should be 10', () => {
    expect(CHECKIN_POINTS).toBe(10)
  })

  it('MATH_BOSS_COST should be 10', () => {
    expect(MATH_BOSS_COST).toBe(10)
  })

  it('PLAYER_MAX_HEARTS should be 5', () => {
    expect(PLAYER_MAX_HEARTS).toBe(5)
  })

  it('MATH_BOSSES should have 10 bosses', () => {
    expect(MATH_BOSSES).toHaveLength(10)
  })

  it('MATH_BOSSES difficulty order should be 3 easy + 3 medium + 4 hard', () => {
    const difficulties = MATH_BOSSES.map((b) => b.difficulty)
    expect(difficulties.slice(0, 3)).toEqual(['easy', 'easy', 'easy'])
    expect(difficulties.slice(3, 6)).toEqual(['medium', 'medium', 'medium'])
    expect(difficulties.slice(6, 10)).toEqual(['hard', 'hard', 'hard', 'hard'])
  })

  it('MATH_BOSS_REWARDS should give 0 for 0-3 bosses', () => {
    expect(MATH_BOSS_REWARDS[0]).toBe(0)
    expect(MATH_BOSS_REWARDS[1]).toBe(0)
    expect(MATH_BOSS_REWARDS[2]).toBe(0)
    expect(MATH_BOSS_REWARDS[3]).toBe(0)
  })

  it('MATH_BOSS_REWARDS should give 25 for 10 bosses', () => {
    expect(MATH_BOSS_REWARDS[10]).toBe(25)
  })

  it('MINECRAFT_BOSS_REWARDS should be higher than normal rewards', () => {
    // Hidden mode gives ~1.5x rewards
    expect(MINECRAFT_BOSS_REWARDS[10]).toBeGreaterThan(MATH_BOSS_REWARDS[10])
    expect(MINECRAFT_BOSS_REWARDS[7]).toBeGreaterThan(MATH_BOSS_REWARDS[7])
  })

  it('MINECRAFT_BOSSES should have 7 bosses', () => {
    expect(MINECRAFT_BOSSES).toHaveLength(7)
  })

  it('HIDDEN_BOSS_MAP should have 3 themes', () => {
    expect(Object.keys(HIDDEN_BOSS_MAP)).toHaveLength(3)
    expect(HIDDEN_BOSS_MAP).toHaveProperty('minecraft')
    expect(HIDDEN_BOSS_MAP).toHaveProperty('pvz')
    expect(HIDDEN_BOSS_MAP).toHaveProperty('tank')
  })

  it('All MATH_BOSSES should have required properties', () => {
    for (const boss of MATH_BOSSES) {
      expect(boss).toHaveProperty('name')
      expect(boss).toHaveProperty('icon')
      expect(boss).toHaveProperty('difficulty')
      expect(boss).toHaveProperty('hearts')
      expect(boss).toHaveProperty('color')
      expect(boss).toHaveProperty('glowColor')
      expect(boss).toHaveProperty('attackEffect')
      expect(['easy', 'medium', 'hard']).toContain(boss.difficulty)
      expect(boss.hearts).toBeGreaterThanOrEqual(1)
      expect(boss.hearts).toBeLessThanOrEqual(4)
    }
  })

  it('Boss hearts should increase with difficulty', () => {
    const easy = MATH_BOSSES.filter((b) => b.difficulty === 'easy')
    const medium = MATH_BOSSES.filter((b) => b.difficulty === 'medium')
    const hard = MATH_BOSSES.filter((b) => b.difficulty === 'hard')

    const avgEasy = easy.reduce((s, b) => s + b.hearts, 0) / easy.length
    const avgMedium = medium.reduce((s, b) => s + b.hearts, 0) / medium.length
    const avgHard = hard.reduce((s, b) => s + b.hearts, 0) / hard.length

    expect(avgEasy).toBeLessThanOrEqual(avgMedium)
    expect(avgMedium).toBeLessThanOrEqual(avgHard)
  })
})
