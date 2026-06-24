/**
 * Sound Manager — singleton that manages all game audio.
 *
 * Uses Howler.js for Web Audio API with MP3 fallback.
 * Sounds are lazy-loaded on first play. Default: muted.
 */
import { Howl } from 'howler'

export type SoundKey =
  | 'click'
  | 'num_press'
  | 'correct'
  | 'wrong'
  | 'hit_normal'
  | 'hit_skill'
  | 'boss_hit'
  | 'boss_defeat'
  | 'combo_3'
  | 'combo_5'
  | 'combo_7'
  | 'box_open'
  | 'wheel_tick'
  | 'wheel_win'
  | 'confetti'
  | 'checkin'
  | 'points_gain'
  | 'level_up'

interface SoundEntry {
  howl: Howl | null
  src: string
  volume: number
  loaded: boolean
}

const STORAGE_KEY = 'kids-task-app-sound-muted'

class SoundManagerSingleton {
  private sounds: Map<string, SoundEntry> = new Map()
  private _muted: boolean

  constructor() {
    // Default muted — respect users
    const stored = localStorage.getItem(STORAGE_KEY)
    this._muted = stored === null ? true : stored === 'true'

    this.registerAll()
  }

  get muted(): boolean {
    return this._muted
  }

  toggleMute(): boolean {
    this._muted = !this._muted
    localStorage.setItem(STORAGE_KEY, String(this._muted))

    // Mute/unmute all active howls
    for (const entry of this.sounds.values()) {
      if (entry.howl) {
        entry.howl.mute(this._muted)
      }
    }

    return this._muted
  }

  play(key: SoundKey): void {
    if (this._muted) return

    const entry = this.sounds.get(key)
    if (!entry) return

    // Lazy-load on first play
    if (!entry.howl) {
      entry.howl = new Howl({
        src: [entry.src],
        volume: entry.volume,
        mute: this._muted,
        preload: true,
      })
      entry.loaded = true
    }

    entry.howl.play()
  }

  /** Preload a specific sound (useful for battle SFX) */
  preload(key: SoundKey): void {
    const entry = this.sounds.get(key)
    if (!entry || entry.howl) return

    entry.howl = new Howl({
      src: [entry.src],
      volume: entry.volume,
      mute: this._muted,
      preload: true,
    })
    entry.loaded = true
  }

  /** Preload all sounds (call when entering a game) */
  preloadAll(): void {
    for (const key of this.sounds.keys()) {
      this.preload(key as SoundKey)
    }
  }

  private registerAll(): void {
    const basePath = '/sounds'

    const defs: Array<[SoundKey, string, number]> = [
      ['click', `${basePath}/click.mp3`, 0.4],
      ['num_press', `${basePath}/num_press.mp3`, 0.3],
      ['correct', `${basePath}/correct.mp3`, 0.5],
      ['wrong', `${basePath}/wrong.mp3`, 0.4],
      ['hit_normal', `${basePath}/hit_normal.mp3`, 0.5],
      ['hit_skill', `${basePath}/hit_skill.mp3`, 0.6],
      ['boss_hit', `${basePath}/boss_hit.mp3`, 0.5],
      ['boss_defeat', `${basePath}/boss_defeat.mp3`, 0.7],
      ['combo_3', `${basePath}/combo_3.mp3`, 0.5],
      ['combo_5', `${basePath}/combo_5.mp3`, 0.6],
      ['combo_7', `${basePath}/combo_7.mp3`, 0.7],
      ['box_open', `${basePath}/box_open.mp3`, 0.5],
      ['wheel_tick', `${basePath}/wheel_tick.mp3`, 0.3],
      ['wheel_win', `${basePath}/wheel_win.mp3`, 0.6],
      ['confetti', `${basePath}/confetti.mp3`, 0.4],
      ['checkin', `${basePath}/checkin.mp3`, 0.5],
      ['points_gain', `${basePath}/points_gain.mp3`, 0.5],
      ['level_up', `${basePath}/level_up.mp3`, 0.6],
    ]

    for (const [key, src, volume] of defs) {
      this.sounds.set(key, { howl: null, src, volume, loaded: false })
    }
  }
}

// Singleton instance
export const soundManager = new SoundManagerSingleton()
