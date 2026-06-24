/**
 * useSound — React hook for playing game sounds.
 *
 * Respects global mute state from SoundContext.
 * Returns a play function that can be called on user interaction.
 */
import { useCallback } from 'react'
import { soundManager, type SoundKey } from '../engine/SoundManager'

export function useSound(): {
  play: (key: SoundKey) => void
  preload: (key: SoundKey) => void
  preloadAll: () => void
} {
  const play = useCallback((key: SoundKey) => {
    soundManager.play(key)
  }, [])

  const preload = useCallback((key: SoundKey) => {
    soundManager.preload(key)
  }, [])

  const preloadAll = useCallback(() => {
    soundManager.preloadAll()
  }, [])

  return { play, preload, preloadAll }
}
