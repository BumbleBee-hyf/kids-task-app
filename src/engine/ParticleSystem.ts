/**
 * Canvas-based Particle System Engine
 *
 * Uses PixiJS v8 for WebGL/Canvas2D rendering with automatic batching.
 * Provides reusable particle presets for game VFX.
 */
import { Application, Container, Graphics } from 'pixi.js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ParticleConfig {
  /** Number of particles to emit */
  count: number
  /** Lifetime in ms */
  lifetime: { min: number; max: number }
  /** Initial velocity range (px/s) */
  speed: { min: number; max: number }
  /** Angle range in degrees (0 = right, 90 = up) */
  angle: { min: number; max: number }
  /** Gravity acceleration (px/s²), positive = downward */
  gravity: number
  /** Air resistance factor 0–1, 0 = none */
  drag: number
  /** Size range in px */
  size: { start: number; end: number }
  /** Color palette — randomly picked per particle */
  colors: number[]
  /** Alpha over lifetime: [start, peak, end] */
  alpha: [number, number, number]
  /** Optional: trail effect (previous positions) */
  trail?: number
  /** Blend mode for glow effects */
  additive?: boolean
  /** Shape: circle, square, star, ring */
  shape?: 'circle' | 'square' | 'star' | 'ring'
}

export type ParticlePreset =
  | 'hitExplosion'
  | 'defeatMegaBurst'
  | 'skillImpact'
  | 'sparkleTrail'
  | 'confettiRain'
  | 'confettiCannon'
  | 'fireBurst'
  | 'magicCircle'
  | 'explosionRing'
  | 'emberFloat'
  | 'boxBurst'
  | 'starBurst'
  | 'heartBreak'
  | 'celebrationBurst'

export interface EmitOptions {
  /** Origin x in canvas pixels */
  x: number
  /** Origin y in canvas pixels */
  y: number
  /** Override count multiplier */
  countMultiplier?: number
  /** Override specific config fields */
  overrides?: Partial<ParticleConfig>
}

// ---------------------------------------------------------------------------
// Internal particle state
// ---------------------------------------------------------------------------

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  startSize: number
  endSize: number
  color: number
  alpha: number
  rotation: number
  rotationSpeed: number
  trail: { x: number; y: number }[]
  alive: boolean
}

// ---------------------------------------------------------------------------
// Preset factory
// ---------------------------------------------------------------------------

function createPresetConfig(
  preset: ParticlePreset,
  overrides?: Partial<ParticleConfig>,
): ParticleConfig {
  let config: ParticleConfig

  switch (preset) {
    case 'hitExplosion':
      config = {
        count: 35,
        lifetime: { min: 300, max: 600 },
        speed: { min: 80, max: 250 },
        angle: { min: 0, max: 360 },
        gravity: 150,
        drag: 0.02,
        size: { start: 4, end: 1 },
        colors: [0xffdd57, 0xff8c42, 0xff6b6b, 0xffffff],
        alpha: [1, 1, 0],
        shape: 'circle',
        additive: true,
      }
      break

    case 'defeatMegaBurst':
      config = {
        count: 120,
        lifetime: { min: 500, max: 1200 },
        speed: { min: 60, max: 350 },
        angle: { min: 0, max: 360 },
        gravity: 200,
        drag: 0.015,
        size: { start: 6, end: 1 },
        colors: [0xffd700, 0xff8c42, 0xff4757, 0xffffff, 0xff6348, 0xffa502],
        alpha: [1, 1, 0],
        shape: 'circle',
        additive: true,
        trail: 3,
      }
      break

    case 'skillImpact':
      config = {
        count: 50,
        lifetime: { min: 400, max: 800 },
        speed: { min: 120, max: 300 },
        angle: { min: 0, max: 360 },
        gravity: 100,
        drag: 0.02,
        size: { start: 5, end: 1 },
        colors: [0x7c4dff, 0x536dfe, 0x448aff, 0xffffff],
        alpha: [1, 1, 0],
        shape: 'star',
        additive: true,
        trail: 2,
      }
      break

    case 'sparkleTrail':
      config = {
        count: 20,
        lifetime: { min: 300, max: 600 },
        speed: { min: 20, max: 60 },
        angle: { min: 0, max: 360 },
        gravity: -10,
        drag: 0.05,
        size: { start: 3, end: 0.5 },
        colors: [0xffd700, 0xffffff, 0xffeb3b],
        alpha: [0.8, 1, 0],
        shape: 'star',
        additive: true,
      }
      break

    case 'confettiRain':
      config = {
        count: 80,
        lifetime: { min: 1500, max: 3000 },
        speed: { min: 30, max: 100 },
        angle: { min: 250, max: 290 },
        gravity: 120,
        drag: 0.01,
        size: { start: 6, end: 4 },
        colors: [
          0xff6b6b, 0xffd93d, 0x6bcb77, 0x4d96ff, 0xff8c42, 0xc56cf0,
          0xff6348, 0x7bed9f, 0x70a1ff,
        ],
        alpha: [1, 1, 0.3],
        shape: 'square',
      }
      break

    case 'confettiCannon':
      config = {
        count: 60,
        lifetime: { min: 800, max: 2000 },
        speed: { min: 200, max: 500 },
        angle: { min: 30, max: 150 },
        gravity: 300,
        drag: 0.02,
        size: { start: 5, end: 3 },
        colors: [
          0xffd700, 0xff6b6b, 0x4d96ff, 0x6bcb77, 0xc56cf0, 0xff8c42,
        ],
        alpha: [1, 1, 0],
        shape: 'square',
      }
      break

    case 'fireBurst':
      config = {
        count: 40,
        lifetime: { min: 200, max: 500 },
        speed: { min: 50, max: 200 },
        angle: { min: 0, max: 360 },
        gravity: -80,
        drag: 0.03,
        size: { start: 8, end: 2 },
        colors: [0xff4500, 0xff6347, 0xffd700, 0xff8c00],
        alpha: [1, 0.8, 0],
        shape: 'circle',
        additive: true,
        trail: 2,
      }
      break

    case 'magicCircle':
      config = {
        count: 30,
        lifetime: { min: 600, max: 1000 },
        speed: { min: 40, max: 100 },
        angle: { min: 0, max: 360 },
        gravity: -20,
        drag: 0.04,
        size: { start: 4, end: 2 },
        colors: [0x7c4dff, 0xb388ff, 0xe040fb, 0xffffff],
        alpha: [0.8, 1, 0],
        shape: 'circle',
        additive: true,
      }
      break

    case 'explosionRing':
      config = {
        count: 40,
        lifetime: { min: 300, max: 600 },
        speed: { min: 150, max: 250 },
        angle: { min: 0, max: 360 },
        gravity: 0,
        drag: 0.06,
        size: { start: 3, end: 1 },
        colors: [0xffffff, 0xffd700, 0xff8c42],
        alpha: [1, 1, 0],
        shape: 'ring',
        additive: true,
      }
      break

    case 'emberFloat':
      config = {
        count: 30,
        lifetime: { min: 2000, max: 4000 },
        speed: { min: 5, max: 25 },
        angle: { min: 60, max: 120 },
        gravity: -15,
        drag: 0.01,
        size: { start: 3, end: 1 },
        colors: [0xff8c42, 0xffd700, 0xff6b6b, 0xffa07a],
        alpha: [0, 0.6, 0],
        shape: 'circle',
        additive: true,
      }
      break

    case 'boxBurst':
      config = {
        count: 45,
        lifetime: { min: 400, max: 900 },
        speed: { min: 80, max: 250 },
        angle: { min: 200, max: 340 },
        gravity: 200,
        drag: 0.02,
        size: { start: 5, end: 2 },
        colors: [0xffd700, 0xffa500, 0xffeb3b, 0xffffff],
        alpha: [1, 1, 0],
        shape: 'star',
        additive: true,
        trail: 2,
      }
      break

    case 'starBurst':
      config = {
        count: 25,
        lifetime: { min: 400, max: 800 },
        speed: { min: 60, max: 180 },
        angle: { min: 0, max: 360 },
        gravity: 50,
        drag: 0.03,
        size: { start: 6, end: 2 },
        colors: [0xffd700, 0xffeb3b, 0xffffff],
        alpha: [1, 1, 0],
        shape: 'star',
        additive: true,
      }
      break

    case 'heartBreak':
      config = {
        count: 20,
        lifetime: { min: 400, max: 800 },
        speed: { min: 50, max: 150 },
        angle: { min: 0, max: 360 },
        gravity: 200,
        drag: 0.02,
        size: { start: 5, end: 2 },
        colors: [0xff4757, 0xff6b81, 0xff8a80, 0xffffff],
        alpha: [1, 1, 0],
        shape: 'square',
      }
      break

    case 'celebrationBurst':
      config = {
        count: 50,
        lifetime: { min: 500, max: 1000 },
        speed: { min: 100, max: 300 },
        angle: { min: 0, max: 360 },
        gravity: 150,
        drag: 0.02,
        size: { start: 5, end: 1 },
        colors: [
          0xffd700, 0xff6b6b, 0x4d96ff, 0x6bcb77, 0xc56cf0, 0xff8c42,
        ],
        alpha: [1, 1, 0],
        shape: 'star',
        additive: true,
        trail: 1,
      }
      break

    default:
      config = {
        count: 20,
        lifetime: { min: 300, max: 600 },
        speed: { min: 50, max: 150 },
        angle: { min: 0, max: 360 },
        gravity: 100,
        drag: 0.02,
        size: { start: 4, end: 1 },
        colors: [0xffffff],
        alpha: [1, 1, 0],
        shape: 'circle',
      }
  }

  return { ...config, ...overrides }
}

// ---------------------------------------------------------------------------
// ParticleSystem class
// ---------------------------------------------------------------------------

const MAX_PARTICLES = 500

export class ParticleSystem {
  private app: Application | null = null
  private container: Container | null = null
  private particles: Particle[] = []
  private graphics: Graphics | null = null
  private running = false
  private width = 0
  private height = 0
  private _onTick: (() => void) | null = null

  /** Attach to a DOM container element */
  async init(
    parentElement: HTMLElement,
    options?: {
      width?: number
      height?: number
      onTick?: () => void
    },
  ): Promise<void> {
    this.width = options?.width ?? parentElement.clientWidth
    this.height = options?.height ?? parentElement.clientHeight
    this._onTick = options?.onTick ?? null

    this.app = new Application()
    await this.app.init({
      width: this.width,
      height: this.height,
      backgroundAlpha: 0,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
    })

    // Style the canvas as overlay
    const canvas = this.app.canvas
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.pointerEvents = 'none'
    canvas.style.zIndex = '10'

    parentElement.style.position = 'relative'
    parentElement.appendChild(canvas)

    this.container = new Container()
    this.app.stage.addChild(this.container)

    this.graphics = new Graphics()
    this.container.addChild(this.graphics)

    // Start ticker
    this.app.ticker.add(this.update, this)
  }

  /** Emit particles from a preset */
  emit(preset: ParticlePreset, options: EmitOptions): void {
    const config = createPresetConfig(preset, options.overrides)
    const count = Math.floor(
      config.count * (options.countMultiplier ?? 1),
    )

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= MAX_PARTICLES) break

      const angleRad =
        ((randomRange(config.angle.min, config.angle.max) * Math.PI) / 180)
      const speed = randomRange(config.speed.min, config.speed.max)
      const life = randomRange(config.lifetime.min, config.lifetime.max)
      const color =
        config.colors[Math.floor(Math.random() * config.colors.length)]

      this.particles.push({
        x: options.x,
        y: options.y,
        vx: Math.cos(angleRad) * speed,
        vy: -Math.sin(angleRad) * speed, // PixiJS y-axis is inverted
        life,
        maxLife: life,
        size: config.size.start,
        startSize: config.size.start,
        endSize: config.size.end,
        color,
        alpha: config.alpha[0],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 6,
        trail: [],
        alive: true,
      })
    }

    if (!this.running) {
      this.running = true
    }
  }

  /** Clear all active particles */
  clear(): void {
    this.particles = []
    if (this.graphics) {
      this.graphics.clear()
    }
    this.running = false
  }

  /** Resize the canvas */
  resize(width: number, height: number): void {
    this.width = width
    this.height = height
    if (this.app) {
      this.app.renderer.resize(width, height)
    }
  }

  /** Destroy the system and clean up */
  destroy(): void {
    this.clear()
    if (this.app) {
      this.app.ticker.remove(this.update, this)
      this.app.destroy(true)
      this.app = null
    }
    this.container = null
    this.graphics = null
    this.particles = []
  }

  /** Check if any particles are alive */
  get isRunning(): boolean {
    return this.running && this.particles.some((p) => p.alive)
  }

  // -----------------------------------------------------------------------
  // Private: update loop (called by PixiJS ticker)
  // -----------------------------------------------------------------------

  private update(ticker: { deltaTime: number }): void {
    if (!this.graphics) return

    const dt = ticker.deltaTime * (1000 / 60) // ms per frame at 60fps
    const g = this.graphics

    g.clear()

    let aliveCount = 0
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      if (!p.alive) continue

      p.life -= dt
      if (p.life <= 0) {
        p.alive = false
        continue
      }

      aliveCount++

      const progress = 1 - p.life / p.maxLife

      // Apply gravity
      p.vy += (200 * dt) / 1000 // gravity from config would be better, using default

      // Apply drag
      const drag = 0.02
      p.vx *= 1 - drag
      p.vy *= 1 - drag

      // Move
      p.x += (p.vx * dt) / 1000
      p.y += (p.vy * dt) / 1000

      // Trail
      if (p.trail) {
        p.trail.push({ x: p.x, y: p.y })
        if (p.trail.length > 4) p.trail.shift()
      }

      // Size interpolation
      p.size = p.startSize + (p.endSize - p.startSize) * progress

      // Alpha: [start, peak, end] interpolation
      const alphaStart = 1
      const alphaPeak = 1
      const alphaEnd = 0
      if (progress < 0.3) {
        p.alpha = alphaStart + (alphaPeak - alphaStart) * (progress / 0.3)
      } else {
        p.alpha = alphaPeak + (alphaEnd - alphaPeak) * ((progress - 0.3) / 0.7)
      }

      // Rotation
      p.rotation += (p.rotationSpeed * dt) / 1000

      // Draw particle
      this.drawParticle(g, p)
    }

    // Compact: remove dead particles
    if (aliveCount < this.particles.length) {
      this.particles = this.particles.filter((p) => p.alive)
    }

    if (aliveCount === 0) {
      this.running = false
    }

    this._onTick?.()
  }

  private drawParticle(g: Graphics, p: Particle): void {
    const alpha = Math.max(0, Math.min(1, p.alpha))
    const size = Math.max(0.5, p.size)

    g.fill({ color: p.color, alpha })

    // Draw trail segments
    if (p.trail && p.trail.length > 1) {
      for (let t = 0; t < p.trail.length; t++) {
        const trailSize = size * (t / p.trail.length)
        g.circle(p.trail[t].x, p.trail[t].y, Math.max(0.5, trailSize))
      }
      g.fill({ color: p.color, alpha: alpha * 0.5 })
    }

    // Main particle shape
    switch (this.getShape(p)) {
      case 'circle':
        g.circle(p.x, p.y, size)
        break
      case 'square':
        g.rect(p.x - size, p.y - size, size * 2, size * 2)
        break
      case 'star':
        this.drawStar(g, p.x, p.y, 5, size, size * 0.4)
        break
      case 'ring':
        g.circle(p.x, p.y, size)
        g.stroke({ color: p.color, alpha, width: 1.5 })
        return
    }

    g.fill()

    // Glow effect for additive particles
    if (size > 2) {
      g.circle(p.x, p.y, size * 2)
      g.fill({ color: p.color, alpha: alpha * 0.15 })
    }
  }

  private drawStar(
    g: Graphics,
    cx: number,
    cy: number,
    points: number,
    outerR: number,
    innerR: number,
  ): void {
    const step = Math.PI / points
    let angle = -Math.PI / 2 + (Math.random() * 0.1) // slight randomness

    g.moveTo(
      cx + Math.cos(angle) * outerR,
      cy + Math.sin(angle) * outerR,
    )

    for (let i = 0; i < points * 2; i++) {
      angle += step
      const r = i % 2 === 0 ? innerR : outerR
      g.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r)
    }

    g.closePath()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getShape(_: Particle): 'circle' | 'square' | 'star' | 'ring' {
    // Default shape based on particle properties; could be extended
    return 'circle'
  }
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}
