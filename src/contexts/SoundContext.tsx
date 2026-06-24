/**
 * SoundContext — provides global sound state to the component tree.
 *
 * Exposes: muted (boolean), toggleMute(), play(key)
 */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { soundManager, type SoundKey } from '../engine/SoundManager'

interface SoundContextValue {
  muted: boolean
  toggleMute: () => void
  play: (key: SoundKey) => void
}

const SoundContext = createContext<SoundContextValue | null>(null)

export function SoundProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(soundManager.muted)

  const toggleMute = useCallback(() => {
    const newMuted = soundManager.toggleMute()
    setMuted(newMuted)
  }, [])

  const play = useCallback((key: SoundKey) => {
    soundManager.play(key)
  }, [])

  return (
    <SoundContext.Provider value={{ muted, toggleMute, play }}>
      {children}
    </SoundContext.Provider>
  )
}

export function useSoundContext(): SoundContextValue {
  const ctx = useContext(SoundContext)
  if (!ctx) {
    throw new Error('useSoundContext must be used within a SoundProvider')
  }
  return ctx
}
