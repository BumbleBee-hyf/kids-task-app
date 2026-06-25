/**
 * useParticleCanvas — React hook for managing a Canvas-based particle system.
 *
 * Provides an overlay <canvas> managed by PixiJS and our ParticleSystem class.
 * Returns { containerRef, emit, clear } for use in components.
 */
import { useRef, useCallback, useEffect, useState } from 'react'
import { ParticleSystem, type ParticlePreset, type EmitOptions } from '../engine/ParticleSystem'

export interface UseParticleCanvasReturn {
  /** Ref to attach to the container element */
  containerRef: React.RefObject<HTMLDivElement | null>
  /** Emit particles from a preset at the given position */
  emit: (preset: ParticlePreset, options: EmitOptions) => void
  /** Clear all active particles */
  clear: () => void
  /** Whether the system is initialized and ready */
  ready: boolean
}

export function useParticleCanvas(): UseParticleCanvasReturn {
  const containerRef = useRef<HTMLDivElement>(null)
  const systemRef = useRef<ParticleSystem | null>(null)
  const [ready, setReady] = useState(false)
  const initAttemptedRef = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container || initAttemptedRef.current) return

    initAttemptedRef.current = true
    const system = new ParticleSystem()
    systemRef.current = system

    let destroyed = false

    system
      .init(container, {
        width: container.clientWidth || 300,
        height: container.clientHeight || 200,
      })
      .then(() => {
        if (!destroyed) {
          setReady(true)
        } else {
          // Component was unmounted before init completed — clean up
          system.destroy()
          systemRef.current = null
        }
      })
      .catch((err) => {
        console.warn('Particle system init failed:', err)
        systemRef.current = null
      })

    // Resize observer
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          system.resize(width, height)
        }
      }
    })
    observer.observe(container)

    return () => {
      destroyed = true
      observer.disconnect()
      system.destroy()
      systemRef.current = null
      setReady(false)
      initAttemptedRef.current = false
    }
  }, [])

  const emit = useCallback((preset: ParticlePreset, options: EmitOptions) => {
    systemRef.current?.emit(preset, options)
  }, [])

  const clear = useCallback(() => {
    systemRef.current?.clear()
  }, [])

  return { containerRef, emit, clear, ready }
}
