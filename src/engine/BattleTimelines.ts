/**
 * Battle Timelines — GSAP timeline factories for MathBoss attack animations.
 *
 * Each attack type (normal, shadowStrike, risingDragon) gets its own
 * timeline factory that creates a declarative animation sequence with
 * labeled positions for start, attack, hit, and recover.
 *
 * This replaces the fragile nested setTimeout chains.
 */
import gsap from 'gsap'

export interface BattleTimelineOptions {
  /** Player element ref */
  playerEl: HTMLElement | null
  /** Boss element ref */
  bossEl: HTMLElement | null
  /** Battle stage element ref */
  stageEl: HTMLElement | null
  /** Callbacks */
  onHitBoss: () => void
  onPlayerRecover: () => void
  onEffectStart?: (effect: string) => void
  onEffectEnd?: (effect: string) => void
}

// ---------------------------------------------------------------------------
// Normal Attack Timeline
// ---------------------------------------------------------------------------

export function createNormalAttackTimeline(
  opts: BattleTimelineOptions,
): gsap.core.Timeline {
  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
  })

  // Player lunges right
  if (opts.playerEl) {
    tl.to(opts.playerEl, {
      x: 50,
      rotation: 0.17, // ~10deg
      duration: 0.15,
      ease: 'power3.in',
    })
  }

  // Slash trail effect (callback-driven)
  tl.call(() => opts.onEffectStart?.('slashTrail'), [], '-=0.05')

  // Player returns
  if (opts.playerEl) {
    tl.to(opts.playerEl, {
      x: 0,
      rotation: 0,
      duration: 0.2,
      ease: 'power2.out',
    })
  }

  // Boss hit reaction
  tl.call(() => opts.onHitBoss(), [], '-=0.1')

  if (opts.bossEl) {
    tl.to(
      opts.bossEl,
      {
        scale: 1.3,
        brightness: 2,
        duration: 0.1,
        ease: 'power4.out',
      },
      '<',
    )
    tl.to(opts.bossEl, {
      scale: 1,
      brightness: 1,
      x: 0,
      duration: 0.3,
      ease: 'elastic.out(1, 0.5)',
    })
  }

  // Recover
  tl.call(() => opts.onPlayerRecover(), [], '+=0.05')

  return tl
}

// ---------------------------------------------------------------------------
// Shadow Strike Timeline
// ---------------------------------------------------------------------------

export function createShadowStrikeTimeline(
  opts: BattleTimelineOptions,
): gsap.core.Timeline {
  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
  })

  // Vignette darken
  tl.call(() => opts.onEffectStart?.('vignetteDarken'), [])
  tl.to({}, { duration: 0.3 }) // pause for effect

  // Energy charge
  tl.call(() => opts.onEffectStart?.('energyCharge'), [])
  tl.to({}, { duration: 0.4 })

  // Dash afterimage
  if (opts.playerEl) {
    tl.to(opts.playerEl, {
      x: 80,
      duration: 0.12,
      ease: 'power4.in',
    })
  }
  tl.call(() => opts.onEffectStart?.('dashAfterimage'), [])

  // Cross slash
  tl.call(() => opts.onEffectStart?.('crossSlash'), [], '+=0.1')

  // Player returns
  if (opts.playerEl) {
    tl.to(opts.playerEl, {
      x: 0,
      duration: 0.25,
      ease: 'power2.out',
    })
  }

  // Boss hit reaction (heavier than normal)
  tl.call(() => opts.onHitBoss(), [])

  if (opts.bossEl) {
    tl.to(opts.bossEl, {
      scale: 1.4,
      brightness: 3,
      duration: 0.08,
    })
    tl.to(opts.bossEl, {
      scale: 1,
      brightness: 1,
      x: 0,
      duration: 0.4,
      ease: 'elastic.out(1, 0.4)',
    })
  }

  // Screen flash
  tl.call(() => opts.onEffectStart?.('screenFlash'), [], '-=0.2')
  tl.to({}, { duration: 0.2 })

  // Recover
  tl.call(() => opts.onPlayerRecover(), [], '+=0.1')

  return tl
}

// ---------------------------------------------------------------------------
// Rising Dragon Timeline
// ---------------------------------------------------------------------------

export function createRisingDragonTimeline(
  opts: BattleTimelineOptions,
): gsap.core.Timeline {
  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
  })

  // Vignette darken
  tl.call(() => opts.onEffectStart?.('vignetteDarken'), [])
  tl.to({}, { duration: 0.3 })

  // Energy charge (bigger)
  tl.call(() => opts.onEffectStart?.('energyCharge'), [])
  tl.to({}, { duration: 0.5 })

  // Upward launch
  if (opts.playerEl) {
    tl.to(opts.playerEl, {
      y: -40,
      scale: 1.1,
      duration: 0.2,
      ease: 'power4.in',
    })
  }
  tl.call(() => opts.onEffectStart?.('upwardLaunch'), [])
  tl.to({}, { duration: 0.3 })

  // Fire rain
  tl.call(() => opts.onEffectStart?.('fireRain'), [])

  // Player returns
  if (opts.playerEl) {
    tl.to(opts.playerEl, {
      y: 0,
      scale: 1,
      x: 0,
      duration: 0.3,
      ease: 'bounce.out',
    })
  }

  // Boss hit reaction (heaviest)
  tl.call(() => opts.onHitBoss(), [])

  if (opts.bossEl) {
    tl.to(opts.bossEl, {
      scale: 1.5,
      brightness: 4,
      duration: 0.1,
    })
    tl.to(opts.bossEl, {
      scale: 1,
      brightness: 1,
      x: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)',
    })
  }

  // Screen flash
  tl.call(() => opts.onEffectStart?.('screenFlash'), [], '-=0.3')
  tl.to({}, { duration: 0.3 })

  // Recover
  tl.call(() => opts.onPlayerRecover(), [], '+=0.15')

  return tl
}

// ---------------------------------------------------------------------------
// Boss Attack Timeline
// ---------------------------------------------------------------------------

export interface BossAttackTimelineOptions {
  bossEl: HTMLElement | null
  playerEl: HTMLElement | null
  onHitPlayer: () => void
  onRecover: () => void
  onEffectStart?: (effect: string) => void
}

export function createBossAttackTimeline(
  opts: BossAttackTimelineOptions,
): gsap.core.Timeline {
  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
  })

  // Boss lunges left
  if (opts.bossEl) {
    tl.to(opts.bossEl, {
      x: -50,
      rotation: -0.14, // ~-8deg
      duration: 0.15,
      ease: 'power3.in',
    })
  }

  // Hit callback
  tl.call(() => opts.onHitPlayer(), [])

  // Player hurt reaction
  if (opts.playerEl) {
    tl.to(
      opts.playerEl,
      {
        x: -30,
        brightness: 2,
        duration: 0.1,
      },
      '<',
    )
    tl.to(opts.playerEl, {
      x: 0,
      brightness: 1,
      duration: 0.3,
      ease: 'elastic.out(1, 0.6)',
    })
  }

  // Boss returns
  if (opts.bossEl) {
    tl.to(
      opts.bossEl,
      {
        x: 0,
        rotation: 0,
        duration: 0.2,
      },
      '-=0.2',
    )
  }

  // Recover
  tl.call(() => opts.onRecover(), [], '+=0.05')

  return tl
}

// ---------------------------------------------------------------------------
// Screen Shake (GSAP-driven, replaces CSS keyframe)
// ---------------------------------------------------------------------------

export function shakeScreen(
  element: HTMLElement | null,
  intensity: 'light' | 'medium' | 'heavy' = 'medium',
): void {
  if (!element) return

  const values = {
    light: { x: 3, duration: 0.15 },
    medium: { x: 8, duration: 0.25 },
    heavy: { x: 14, duration: 0.35 },
  }

  const { x, duration } = values[intensity]

  gsap.to(element, {
    x: () => (Math.random() - 0.5) * x * 2,
    y: () => (Math.random() - 0.5) * x * 2,
    duration: duration / 4,
    repeat: 3,
    yoyo: true,
    ease: 'none',
    onComplete: () => {
      gsap.set(element, { x: 0, y: 0 })
    },
  })
}

// ---------------------------------------------------------------------------
// Number Count-Up (for dashboard stats)
// ---------------------------------------------------------------------------

export function countUp(
  element: HTMLElement | null,
  target: number,
  duration = 0.8,
): void {
  if (!element) return

  const obj = { value: 0 }
  gsap.to(obj, {
    value: target,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      element.textContent = String(Math.round(obj.value))
    },
  })
}
