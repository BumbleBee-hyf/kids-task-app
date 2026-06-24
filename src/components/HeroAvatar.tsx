/**
 * 小勇士 SVG头像组件
 * 可爱但不失英勇的小骑士风格，配合绿色发光特效
 */

interface HeroAvatarProps {
  size?: number
  className?: string
  animClass?: string
}

export default function HeroAvatar({ size = 52, className, animClass }: HeroAvatarProps) {
  return (
    <div
      className={`${className || ''} ${animClass || ''}`}
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <defs>
          <radialGradient id="hero-aura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#22C55E" stopOpacity="0.05" />
          </radialGradient>
          <filter id="hero-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="sword-blade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
          <linearGradient id="shield-surface" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>

        {/* 背景光环 */}
        <circle cx="50" cy="50" r="48" fill="url(#hero-aura)" />

        <g filter="url(#hero-glow)">
          {/* ===== 剑（右手举起）===== */}
          <line
            x1="72"
            y1="48"
            x2="82"
            y2="18"
            stroke="url(#sword-blade)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <line x1="72" y1="48" x2="82" y2="18" stroke="#4ADE80" strokeWidth="1" opacity="0.4" />
          {/* 剑柄护手 */}
          <line
            x1="67"
            y1="46"
            x2="77"
            y2="50"
            stroke="#D97706"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* 剑柄 */}
          <line
            x1="64"
            y1="48"
            x2="69"
            y2="50"
            stroke="#92400E"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* 剑尖光芒 */}
          <circle cx="82" cy="18" r="3" fill="#4ADE80" opacity="0.6" />

          {/* ===== 盾牌（左手）===== */}
          <path
            d="M22 40 L18 56 L28 62 L38 56 L34 40 Z"
            fill="url(#shield-surface)"
            stroke="#60A5FA"
            strokeWidth="1"
          />
          {/* 盾牌星星 */}
          <path
            d="M28 44 L29.5 48 L34 48 L30.5 51 L32 55 L28 52.5 L24 55 L25.5 51 L22 48 L26.5 48 Z"
            fill="#FBBF24"
            opacity="0.9"
          />

          {/* ===== 身体/铠甲 ===== */}
          <path
            d="M36 42 L34 76 L66 76 L64 42 Z"
            fill="#3B82F6"
            stroke="#60A5FA"
            strokeWidth="0.8"
          />
          {/* 铠甲中线 */}
          <line x1="50" y1="44" x2="50" y2="72" stroke="#60A5FA" strokeWidth="0.8" opacity="0.5" />
          {/* 腰带 */}
          <rect x="34" y="60" width="32" height="4" rx="1" fill="#D97706" />
          <circle cx="50" cy="62" r="3" fill="#FBBF24" />
          {/* 铠甲肩甲 */}
          <path
            d="M34 42 L28 44 L30 50 L36 48 Z"
            fill="#2563EB"
            stroke="#60A5FA"
            strokeWidth="0.5"
          />
          <path
            d="M66 42 L72 44 L70 50 L64 48 Z"
            fill="#2563EB"
            stroke="#60A5FA"
            strokeWidth="0.5"
          />

          {/* ===== 头部 ===== */}
          {/* 头盔 */}
          <path
            d="M36 34 C36 18 42 12 50 12 C58 12 64 18 64 34 L64 40 L36 40 Z"
            fill="#6366F1"
            stroke="#818CF8"
            strokeWidth="0.8"
          />
          {/* 头盔帽檐 */}
          <path d="M34 38 L66 38 L64 42 L36 42 Z" fill="#4F46E5" />
          {/* 头盔装饰线 */}
          <path d="M50 12 L50 38" stroke="#818CF8" strokeWidth="0.8" opacity="0.5" />
          {/* 头盔羽毛 */}
          <path d="M50 12 C48 6 44 4 42 6 C44 8 48 10 50 12" fill="#EF4444" />
          <path d="M50 12 C52 6 56 4 58 6 C56 8 52 10 50 12" fill="#DC2626" />

          {/* 面部 */}
          <rect x="40" y="30" width="20" height="8" rx="2" fill="#1E1B4B" />
          {/* 眼睛 - 发光 */}
          <rect x="42" y="31" width="7" height="4" rx="1.5" fill="#4ADE80" />
          <rect x="51" y="31" width="7" height="4" rx="1.5" fill="#4ADE80" />
          {/* 眼睛高光 */}
          <rect x="43" y="31.5" width="2" height="1.5" rx="0.5" fill="#BBF7D0" opacity="0.8" />
          <rect x="52" y="31.5" width="2" height="1.5" rx="0.5" fill="#BBF7D0" opacity="0.8" />

          {/* ===== 腿部 ===== */}
          <rect x="36" y="76" width="10" height="12" rx="2" fill="#1D4ED8" />
          <rect x="54" y="76" width="10" height="12" rx="2" fill="#1D4ED8" />
          {/* 靴子 */}
          <rect x="34" y="86" width="14" height="6" rx="2" fill="#7C3AED" />
          <rect x="52" y="86" width="14" height="6" rx="2" fill="#7C3AED" />

          {/* ===== 披风 ===== */}
          <path
            d="M34 42 C28 52 26 66 28 84 L34 84 C32 68 34 54 36 46 Z"
            fill="#7C3AED"
            opacity="0.5"
          />

          {/* ===== 光效粒子 ===== */}
          <circle cx="16" cy="30" r="2" fill="#4ADE80" opacity="0.4" />
          <circle cx="86" cy="26" r="1.5" fill="#4ADE80" opacity="0.3" />
          <circle cx="20" cy="70" r="1.5" fill="#FBBF24" opacity="0.3" />
          <circle cx="80" cy="66" r="2" fill="#FBBF24" opacity="0.25" />
        </g>
      </svg>
    </div>
  )
}
