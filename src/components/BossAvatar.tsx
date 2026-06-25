import React from 'react'

/**
 * 失落城堡2风格Boss SVG头像组件
 * 每个Boss有独特的暗黑奇幻造型，配合发光特效
 */

interface BossAvatarProps {
  icon: string
  color: string
  glowColor: string
  size?: number
  className?: string
}

// 骷髅兵
const Skeleton = ({
  size,
  color,
  glowColor,
}: {
  size: number
  color: string
  glowColor: string
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="skull-bg" cx="50%" cy="45%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.3" />
        <stop offset="100%" stopColor={color} stopOpacity="0.1" />
      </radialGradient>
      <filter id="skull-glow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#skull-bg)" />
    {/* 骷髅头 */}
    <g filter="url(#skull-glow)">
      <path
        d="M50 18 C34 18 22 30 22 44 C22 52 26 58 32 62 L32 72 C32 76 36 80 40 80 L60 80 C64 80 68 76 68 72 L68 62 C74 58 78 52 78 44 C78 30 66 18 50 18Z"
        fill="#E8DCC8"
        stroke="#8B7D6B"
        strokeWidth="1.5"
      />
      {/* 左眼窝 */}
      <ellipse cx="38" cy="42" rx="8" ry="9" fill="#1a1a2e" />
      <ellipse cx="38" cy="42" rx="4" ry="5" fill={glowColor} opacity="0.8" />
      {/* 右眼窝 */}
      <ellipse cx="62" cy="42" rx="8" ry="9" fill="#1a1a2e" />
      <ellipse cx="62" cy="42" rx="4" ry="5" fill={glowColor} opacity="0.8" />
      {/* 鼻腔 */}
      <path d="M47 54 L50 60 L53 54 Z" fill="#2D2B27" />
      {/* 牙齿 */}
      <rect
        x="36"
        y="68"
        width="4"
        height="7"
        rx="1"
        fill="#E8DCC8"
        stroke="#8B7D6B"
        strokeWidth="0.5"
      />
      <rect
        x="42"
        y="68"
        width="4"
        height="8"
        rx="1"
        fill="#E8DCC8"
        stroke="#8B7D6B"
        strokeWidth="0.5"
      />
      <rect
        x="48"
        y="68"
        width="4"
        height="7"
        rx="1"
        fill="#E8DCC8"
        stroke="#8B7D6B"
        strokeWidth="0.5"
      />
      <rect
        x="54"
        y="68"
        width="4"
        height="8"
        rx="1"
        fill="#E8DCC8"
        stroke="#8B7D6B"
        strokeWidth="0.5"
      />
      <rect
        x="60"
        y="68"
        width="4"
        height="7"
        rx="1"
        fill="#E8DCC8"
        stroke="#8B7D6B"
        strokeWidth="0.5"
      />
      {/* 下颚裂缝 */}
      <line x1="50" y1="75" x2="50" y2="62" stroke="#8B7D6B" strokeWidth="0.8" />
    </g>
  </svg>
)

// 暗影蝠
const Bat = ({ size, color, glowColor }: { size: number; color: string; glowColor: string }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="bat-bg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.25" />
        <stop offset="100%" stopColor={color} stopOpacity="0.1" />
      </radialGradient>
      <filter id="bat-glow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#bat-bg)" />
    <g filter="url(#bat-glow)">
      {/* 左翼 */}
      <path
        d="M46 44 C36 30 20 22 10 30 C14 36 18 42 24 46 C20 44 12 44 8 50 C16 50 24 50 30 52 C26 54 18 58 14 66 C22 60 30 54 38 54 L46 54 Z"
        fill="#2D1B4E"
        stroke={glowColor}
        strokeWidth="0.8"
      />
      {/* 右翼 */}
      <path
        d="M54 44 C64 30 80 22 90 30 C86 36 82 42 76 46 C80 44 88 44 92 50 C84 50 76 50 70 52 C74 54 82 58 86 66 C78 60 70 54 62 54 L54 54 Z"
        fill="#2D1B4E"
        stroke={glowColor}
        strokeWidth="0.8"
      />
      {/* 身体 */}
      <ellipse
        cx="50"
        cy="50"
        rx="10"
        ry="14"
        fill="#3B1D6E"
        stroke={glowColor}
        strokeWidth="0.5"
      />
      {/* 眼睛 */}
      <circle cx="45" cy="44" r="4" fill="#1a1a2e" />
      <circle cx="45" cy="44" r="2" fill={glowColor} />
      <circle cx="55" cy="44" r="4" fill="#1a1a2e" />
      <circle cx="55" cy="44" r="2" fill={glowColor} />
      {/* 耳朵 */}
      <path d="M43 36 L40 26 L47 34 Z" fill="#2D1B4E" stroke={glowColor} strokeWidth="0.5" />
      <path d="M57 36 L60 26 L53 34 Z" fill="#2D1B4E" stroke={glowColor} strokeWidth="0.5" />
      {/* 獠牙 */}
      <path d="M46 54 L45 60" stroke="#E8DCC8" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M54 54 L55 60" stroke="#E8DCC8" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  </svg>
)

// 腐化树人
const Treant = ({ size, color, glowColor }: { size: number; color: string; glowColor: string }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="treant-bg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.2" />
        <stop offset="100%" stopColor={color} stopOpacity="0.1" />
      </radialGradient>
      <filter id="treant-glow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#treant-bg)" />
    <g filter="url(#treant-glow)">
      {/* 树干身体 */}
      <path
        d="M38 30 L36 82 L44 82 L46 50 L54 50 L56 82 L64 82 L62 30 Z"
        fill="#3D2817"
        stroke="#5C3D1E"
        strokeWidth="1"
      />
      {/* 树冠/头部 */}
      <ellipse
        cx="50"
        cy="28"
        rx="22"
        ry="18"
        fill="#2D4A1A"
        stroke={glowColor}
        strokeWidth="0.8"
      />
      <ellipse cx="38" cy="24" rx="12" ry="10" fill="#1F350F" />
      <ellipse cx="62" cy="24" rx="12" ry="10" fill="#1F350F" />
      {/* 眼睛 - 发光 */}
      <circle cx="42" cy="28" r="4" fill="#1a1a2e" />
      <circle cx="42" cy="28" r="2.5" fill={glowColor} />
      <circle cx="58" cy="28" r="4" fill="#1a1a2e" />
      <circle cx="58" cy="28" r="2.5" fill={glowColor} />
      {/* 嘴 */}
      <path d="M44 36 L50 40 L56 36" stroke="#1F350F" strokeWidth="2" fill="none" />
      {/* 手臂/树枝 */}
      <path
        d="M36 42 L18 36 L14 30"
        stroke="#3D2817"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M64 42 L82 36 L86 30"
        stroke="#3D2817"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* 腐化纹路 */}
      <path d="M44 55 L42 65" stroke={glowColor} strokeWidth="0.5" opacity="0.6" />
      <path d="M56 55 L58 65" stroke={glowColor} strokeWidth="0.5" opacity="0.6" />
      {/* 根须 */}
      <path d="M36 82 L30 90" stroke="#3D2817" strokeWidth="2" strokeLinecap="round" />
      <path d="M44 82 L46 92" stroke="#3D2817" strokeWidth="2" strokeLinecap="round" />
      <path d="M56 82 L54 92" stroke="#3D2817" strokeWidth="2" strokeLinecap="round" />
      <path d="M64 82 L70 90" stroke="#3D2817" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
)

// 亡灵骑士
const Knight = ({ size, color, glowColor }: { size: number; color: string; glowColor: string }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="knight-bg" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.2" />
        <stop offset="100%" stopColor={color} stopOpacity="0.1" />
      </radialGradient>
      <filter id="knight-glow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#knight-bg)" />
    <g filter="url(#knight-glow)">
      {/* 头盔 */}
      <path
        d="M32 36 C32 20 40 12 50 12 C60 12 68 20 68 36 L68 46 L32 46 Z"
        fill="#4A5568"
        stroke="#718096"
        strokeWidth="1"
      />
      {/* 面罩 */}
      <rect x="38" y="32" width="24" height="8" rx="2" fill="#2D3748" />
      {/* 眼缝 - 发光 */}
      <rect x="40" y="33" width="8" height="3" rx="1" fill={glowColor} />
      <rect x="52" y="33" width="8" height="3" rx="1" fill={glowColor} />
      {/* 头盔装饰 */}
      <path d="M50 12 L50 4" stroke="#718096" strokeWidth="2" />
      <circle cx="50" cy="3" r="2" fill={glowColor} />
      {/* 肩甲 */}
      <path d="M28 46 L24 52 L32 56 L32 46 Z" fill="#4A5568" stroke="#718096" strokeWidth="0.8" />
      <path d="M72 46 L76 52 L68 56 L68 46 Z" fill="#4A5568" stroke="#718096" strokeWidth="0.8" />
      {/* 胸甲 */}
      <path d="M32 46 L28 80 L72 80 L68 46 Z" fill="#374151" stroke="#4B5563" strokeWidth="1" />
      {/* 胸甲纹路 */}
      <path d="M50 46 L50 72" stroke="#4B5563" strokeWidth="1" />
      <path d="M38 60 L62 60" stroke="#4B5563" strokeWidth="0.8" />
      {/* 剑 */}
      <line x1="76" y1="50" x2="90" y2="20" stroke="#9CA3AF" strokeWidth="3" />
      <line x1="76" y1="50" x2="90" y2="20" stroke={glowColor} strokeWidth="1" opacity="0.5" />
      <rect x="73" y="48" width="8" height="3" rx="1" fill="#6B7280" />
      {/* 斗篷 */}
      <path
        d="M28 46 C20 56 18 72 22 88 L28 88 C24 74 26 60 32 52 Z"
        fill="#1F2937"
        opacity="0.8"
      />
    </g>
  </svg>
)

// 熔岩巨像
const Golem = ({ size, color, glowColor }: { size: number; color: string; glowColor: string }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="golem-bg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.3" />
        <stop offset="100%" stopColor={color} stopOpacity="0.1" />
      </radialGradient>
      <radialGradient id="lava-core" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="50%" stopColor={glowColor} />
        <stop offset="100%" stopColor={color} />
      </radialGradient>
      <filter id="golem-glow">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#golem-bg)" />
    <g filter="url(#golem-glow)">
      {/* 身体 - 岩石 */}
      <path d="M30 40 L26 82 L74 82 L70 40 Z" fill="#5C2D0E" stroke="#7C3A10" strokeWidth="1" />
      {/* 头部 */}
      <rect
        x="36"
        y="18"
        width="28"
        height="24"
        rx="4"
        fill="#6B3A12"
        stroke="#8B4A1A"
        strokeWidth="1"
      />
      {/* 岩石纹理 */}
      <path d="M32 50 L40 48 L38 56 Z" fill="#7C3A10" />
      <path d="M68 50 L60 48 L62 56 Z" fill="#7C3A10" />
      <path d="M44 60 L56 58 L54 70 L46 70 Z" fill="#7C3A10" />
      {/* 眼睛 - 熔岩 */}
      <rect x="40" y="26" width="8" height="5" rx="2" fill="url(#lava-core)" />
      <rect x="52" y="26" width="8" height="5" rx="2" fill="url(#lava-core)" />
      {/* 嘴 - 熔岩裂缝 */}
      <path
        d="M42 36 L44 38 L48 35 L52 38 L54 36 L56 38"
        stroke={glowColor}
        strokeWidth="1.5"
        fill="none"
      />
      {/* 手臂 */}
      <path
        d="M30 44 L16 52 L14 60"
        stroke="#6B3A12"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M70 44 L84 52 L86 60"
        stroke="#6B3A12"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      {/* 熔岩裂纹 */}
      <path d="M36 42 L40 50 L38 58" stroke={glowColor} strokeWidth="1" opacity="0.7" />
      <path d="M64 42 L60 50 L62 58" stroke={glowColor} strokeWidth="1" opacity="0.7" />
      <path d="M44 70 L48 78 L52 76" stroke={glowColor} strokeWidth="1" opacity="0.7" />
      {/* 胸口熔岩核心 */}
      <ellipse cx="50" cy="58" rx="6" ry="5" fill="url(#lava-core)" opacity="0.8" />
    </g>
  </svg>
)

// 深渊水灵
const Spirit = ({ size, color, glowColor }: { size: number; color: string; glowColor: string }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="spirit-bg" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.3" />
        <stop offset="100%" stopColor={color} stopOpacity="0.1" />
      </radialGradient>
      <filter id="spirit-glow">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#spirit-bg)" />
    <g filter="url(#spirit-glow)" opacity="0.9">
      {/* 灵体身体 - 透明飘渺 */}
      <path
        d="M34 42 C34 28 42 18 50 18 C58 18 66 28 66 42 C66 56 62 68 58 78 C56 84 54 90 52 94 C50 90 48 84 46 78 C42 68 38 56 34 42Z"
        fill={color}
        fillOpacity="0.6"
        stroke={glowColor}
        strokeWidth="0.8"
      />
      {/* 内部波动 */}
      <path
        d="M40 50 C44 46 48 54 52 48 C56 44 60 52 64 48"
        stroke={glowColor}
        strokeWidth="0.5"
        opacity="0.4"
        fill="none"
      />
      <path
        d="M38 60 C42 56 48 64 52 58 C56 54 60 62 66 58"
        stroke={glowColor}
        strokeWidth="0.5"
        opacity="0.3"
        fill="none"
      />
      {/* 眼睛 */}
      <ellipse cx="44" cy="36" rx="5" ry="6" fill="#0a1628" />
      <ellipse cx="44" cy="36" rx="3" ry="3.5" fill={glowColor} />
      <ellipse cx="56" cy="36" rx="5" ry="6" fill="#0a1628" />
      <ellipse cx="56" cy="36" rx="3" ry="3.5" fill={glowColor} />
      {/* 嘴 */}
      <ellipse cx="50" cy="48" rx="4" ry="2" fill="#0a1628" />
      {/* 飘散的灵气 */}
      <circle cx="30" cy="56" r="3" fill={glowColor} opacity="0.3" />
      <circle cx="70" cy="52" r="2" fill={glowColor} opacity="0.25" />
      <circle cx="28" cy="68" r="2" fill={glowColor} opacity="0.2" />
      <circle cx="72" cy="64" r="2.5" fill={glowColor} opacity="0.2" />
      <circle cx="38" cy="86" r="1.5" fill={glowColor} opacity="0.15" />
      <circle cx="62" cy="84" r="2" fill={glowColor} opacity="0.15" />
    </g>
  </svg>
)

// 噬魂火龙
const Dragon = ({ size, color, glowColor }: { size: number; color: string; glowColor: string }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="dragon-bg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.3" />
        <stop offset="100%" stopColor={color} stopOpacity="0.1" />
      </radialGradient>
      <filter id="dragon-glow">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#dragon-bg)" />
    <g filter="url(#dragon-glow)">
      {/* 龙头 */}
      <path
        d="M30 30 C30 18 40 10 50 10 C60 10 70 18 70 30 L70 50 C70 56 62 62 50 62 C38 62 30 56 30 50 Z"
        fill={color}
        stroke={glowColor}
        strokeWidth="1"
      />
      {/* 角 */}
      <path d="M36 22 L28 8 L40 20 Z" fill="#7F1D1D" stroke={glowColor} strokeWidth="0.5" />
      <path d="M64 22 L72 8 L60 20 Z" fill="#7F1D1D" stroke={glowColor} strokeWidth="0.5" />
      {/* 眼睛 */}
      <ellipse cx="40" cy="32" rx="6" ry="5" fill="#1a0a0a" />
      <ellipse cx="40" cy="32" rx="3.5" ry="3" fill="#FFD700" />
      <ellipse cx="60" cy="32" rx="6" ry="5" fill="#1a0a0a" />
      <ellipse cx="60" cy="32" rx="3.5" ry="3" fill="#FFD700" />
      {/* 鼻孔 */}
      <circle cx="44" cy="44" r="2" fill="#1a0a0a" />
      <circle cx="56" cy="44" r="2" fill="#1a0a0a" />
      {/* 嘴/獠牙 */}
      <path d="M36 50 L64 50" stroke="#1a0a0a" strokeWidth="1.5" />
      <path d="M38 50 L40 56" stroke="#E8DCC8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M62 50 L60 56" stroke="#E8DCC8" strokeWidth="1.5" strokeLinecap="round" />
      {/* 火焰呼吸 */}
      <path
        d="M42 56 L46 68 L50 62 L54 68 L58 56"
        fill={glowColor}
        fillOpacity="0.6"
        stroke={glowColor}
        strokeWidth="0.5"
      />
      {/* 翼展 */}
      <path
        d="M30 36 L8 28 L12 40 L6 46 L16 46 L12 54 L24 48 L30 44 Z"
        fill="#7F1D1D"
        stroke={glowColor}
        strokeWidth="0.5"
        opacity="0.7"
      />
      <path
        d="M70 36 L92 28 L88 40 L94 46 L84 46 L88 54 L76 48 L70 44 Z"
        fill="#7F1D1D"
        stroke={glowColor}
        strokeWidth="0.5"
        opacity="0.7"
      />
      {/* 鳞片纹路 */}
      <path d="M44 24 L46 22 L48 24" stroke={glowColor} strokeWidth="0.5" opacity="0.4" />
      <path d="M52 24 L54 22 L56 24" stroke={glowColor} strokeWidth="0.5" opacity="0.4" />
    </g>
  </svg>
)

// 冰封领主
const FrostLord = ({
  size,
  color,
  glowColor,
}: {
  size: number
  color: string
  glowColor: string
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="frost-bg" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.3" />
        <stop offset="100%" stopColor={color} stopOpacity="0.1" />
      </radialGradient>
      <filter id="frost-glow">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#frost-bg)" />
    <g filter="url(#frost-glow)">
      {/* 王冠 */}
      <path
        d="M30 28 L34 14 L40 24 L46 10 L50 22 L54 10 L60 24 L66 14 L70 28 Z"
        fill={glowColor}
        stroke="#fff"
        strokeWidth="0.5"
      />
      {/* 面部 */}
      <path
        d="M32 30 C32 20 40 14 50 14 C60 14 68 20 68 30 L68 50 C68 58 60 64 50 64 C40 64 32 58 32 50 Z"
        fill="#1E3A5F"
        stroke={glowColor}
        strokeWidth="1"
      />
      {/* 眼睛 */}
      <ellipse cx="42" cy="36" rx="5" ry="4" fill="#0F172A" />
      <ellipse cx="42" cy="36" rx="3" ry="2.5" fill={glowColor} />
      <ellipse cx="58" cy="36" rx="5" ry="4" fill="#0F172A" />
      <ellipse cx="58" cy="36" rx="3" ry="2.5" fill={glowColor} />
      {/* 冰霜胡须 */}
      <path
        d="M42 48 C44 56 46 64 48 72 L50 76 L52 72 C54 64 56 56 58 48"
        stroke={glowColor}
        strokeWidth="1.5"
        fill="none"
        opacity="0.6"
      />
      {/* 冰晶身体 */}
      <path d="M32 54 L28 86 L72 86 L68 54" fill="#1E3A5F" stroke={glowColor} strokeWidth="0.8" />
      {/* 冰霜装饰 */}
      <path
        d="M38 60 L42 58 L46 62"
        stroke={glowColor}
        strokeWidth="0.5"
        opacity="0.5"
        fill="none"
      />
      <path
        d="M54 62 L58 58 L62 60"
        stroke={glowColor}
        strokeWidth="0.5"
        opacity="0.5"
        fill="none"
      />
      {/* 冰杖 */}
      <line x1="22" y1="42" x2="16" y2="90" stroke="#93C5FD" strokeWidth="2.5" />
      <circle cx="22" cy="42" r="4" fill={glowColor} opacity="0.7" />
      <path d="M22 38 L20 34 L22 30 L24 34 Z" fill={glowColor} opacity="0.5" />
      {/* 冰霜粒子 */}
      <circle cx="18" cy="56" r="1.5" fill={glowColor} opacity="0.4" />
      <circle cx="80" cy="48" r="1.5" fill={glowColor} opacity="0.3" />
      <circle cx="14" cy="70" r="1" fill={glowColor} opacity="0.25" />
    </g>
  </svg>
)

// 雷霆兽王
const ThunderBeast = ({
  size,
  color,
  glowColor,
}: {
  size: number
  color: string
  glowColor: string
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="thunder-bg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.3" />
        <stop offset="100%" stopColor={color} stopOpacity="0.1" />
      </radialGradient>
      <filter id="thunder-glow">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#thunder-bg)" />
    <g filter="url(#thunder-glow)">
      {/* 兽头 */}
      <path
        d="M26 36 C26 18 38 8 50 8 C62 8 74 18 74 36 L74 56 C74 66 64 74 50 74 C36 74 26 66 26 56 Z"
        fill={color}
        stroke={glowColor}
        strokeWidth="1"
      />
      {/* 兽角 */}
      <path d="M30 24 L18 10 L22 8 L34 20" fill="#4C1D95" stroke={glowColor} strokeWidth="0.8" />
      <path d="M70 24 L82 10 L78 8 L66 20" fill="#4C1D95" stroke={glowColor} strokeWidth="0.8" />
      {/* 闪电纹路 */}
      <path
        d="M44 20 L48 26 L44 28 L50 36"
        stroke={glowColor}
        strokeWidth="1.2"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M56 20 L52 26 L56 28 L50 36"
        stroke={glowColor}
        strokeWidth="1.2"
        fill="none"
        opacity="0.7"
      />
      {/* 眼睛 */}
      <ellipse cx="38" cy="34" rx="7" ry="5" fill="#1a0a2e" />
      <ellipse cx="38" cy="34" rx="4" ry="3" fill={glowColor} />
      <ellipse cx="62" cy="34" rx="7" ry="5" fill="#1a0a2e" />
      <ellipse cx="62" cy="34" rx="4" ry="3" fill={glowColor} />
      {/* 鼻 */}
      <path d="M46 44 L50 48 L54 44" stroke="#1a0a2e" strokeWidth="1.5" fill="none" />
      {/* 獠牙 */}
      <path d="M36 50 L34 58" stroke="#E8DCC8" strokeWidth="2" strokeLinecap="round" />
      <path d="M64 50 L66 58" stroke="#E8DCC8" strokeWidth="2" strokeLinecap="round" />
      {/* 身体 */}
      <path d="M26 56 L22 86 L78 86 L74 56" fill={color} stroke={glowColor} strokeWidth="0.8" />
      {/* 雷电纹身 */}
      <path
        d="M42 60 L46 68 L42 70 L48 80"
        stroke={glowColor}
        strokeWidth="1"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M58 60 L54 68 L58 70 L52 80"
        stroke={glowColor}
        strokeWidth="1"
        fill="none"
        opacity="0.6"
      />
      {/* 闪电特效 */}
      <path
        d="M10 16 L14 28 L10 28 L16 42"
        stroke={glowColor}
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M90 16 L86 28 L90 28 L84 42"
        stroke={glowColor}
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />
    </g>
  </svg>
)

// 黑暗魔王
const DemonLord = ({
  size,
  color,
  glowColor,
}: {
  size: number
  color: string
  glowColor: string
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="demon-bg" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.4" />
        <stop offset="100%" stopColor={color} stopOpacity="0.15" />
      </radialGradient>
      <radialGradient id="demon-eye" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="60%" stopColor={glowColor} />
        <stop offset="100%" stopColor="#7F1D1D" />
      </radialGradient>
      <filter id="demon-glow">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#demon-bg)" />
    <g filter="url(#demon-glow)">
      {/* 巨角 */}
      <path
        d="M28 28 C22 20 16 6 10 2 C12 12 14 22 22 30 Z"
        fill="#1C1917"
        stroke={glowColor}
        strokeWidth="1"
      />
      <path
        d="M72 28 C78 20 84 6 90 2 C88 12 86 22 78 30 Z"
        fill="#1C1917"
        stroke={glowColor}
        strokeWidth="1"
      />
      {/* 面部 */}
      <path
        d="M28 30 C28 16 38 8 50 8 C62 8 72 16 72 30 L72 56 C72 64 62 72 50 72 C38 72 28 64 28 56 Z"
        fill={color}
        stroke={glowColor}
        strokeWidth="1.2"
      />
      {/* 第三只眼 */}
      <ellipse cx="50" cy="24" rx="4" ry="5" fill="#1a0a0a" />
      <ellipse cx="50" cy="24" rx="2.5" ry="3" fill="url(#demon-eye)" />
      {/* 左右眼 */}
      <ellipse cx="38" cy="38" rx="7" ry="6" fill="#1a0a0a" />
      <ellipse cx="38" cy="38" rx="4" ry="3.5" fill="url(#demon-eye)" />
      <ellipse cx="62" cy="38" rx="7" ry="6" fill="#1a0a0a" />
      <ellipse cx="62" cy="38" rx="4" ry="3.5" fill="url(#demon-eye)" />
      {/* 邪恶笑容 */}
      <path
        d="M36 54 C40 60 44 62 50 62 C56 62 60 60 64 54"
        stroke={glowColor}
        strokeWidth="1.5"
        fill="none"
      />
      {/* 獠牙 */}
      <path d="M38 54 L36 62" stroke="#E8DCC8" strokeWidth="2" strokeLinecap="round" />
      <path d="M62 54 L64 62" stroke="#E8DCC8" strokeWidth="2" strokeLinecap="round" />
      <path d="M46 58 L48 64" stroke="#E8DCC8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M54 58 L52 64" stroke="#E8DCC8" strokeWidth="1.5" strokeLinecap="round" />
      {/* 身体 - 暗黑铠甲 */}
      <path d="M28 56 L24 90 L76 90 L72 56" fill="#1C1917" stroke={glowColor} strokeWidth="0.8" />
      {/* 胸口符文 */}
      <path d="M44 64 L50 60 L56 64 L50 68 Z" fill={glowColor} opacity="0.5" />
      <circle cx="50" cy="64" r="3" fill={glowColor} opacity="0.7" />
      {/* 暗黑翅膀 */}
      <path
        d="M28 44 C16 40 6 46 4 56 C10 52 16 50 22 52 L28 48 Z"
        fill="#1C1917"
        stroke={glowColor}
        strokeWidth="0.5"
        opacity="0.6"
      />
      <path
        d="M72 44 C84 40 94 46 96 56 C90 52 84 50 78 52 L72 48 Z"
        fill="#1C1917"
        stroke={glowColor}
        strokeWidth="0.5"
        opacity="0.6"
      />
      {/* 暗能量粒子 */}
      <circle cx="12" cy="36" r="2" fill={glowColor} opacity="0.3" />
      <circle cx="88" cy="36" r="2" fill={glowColor} opacity="0.3" />
      <circle cx="8" cy="52" r="1.5" fill={glowColor} opacity="0.2" />
      <circle cx="92" cy="52" r="1.5" fill={glowColor} opacity="0.2" />
    </g>
  </svg>
)

// === 我的世界 Boss ===

// 僵尸
const Zombie = ({ size, color, glowColor }: { size: number; color: string; glowColor: string }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="zombie-bg" cx="50%" cy="45%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.3" />
        <stop offset="100%" stopColor={color} stopOpacity="0.1" />
      </radialGradient>
      <filter id="zombie-glow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#zombie-bg)" />
    <g filter="url(#zombie-glow)">
      {/* 头 */}
      <rect
        x="28"
        y="18"
        width="44"
        height="38"
        rx="2"
        fill="#4CAF50"
        stroke="#388E3C"
        strokeWidth="1.5"
      />
      {/* 眼睛 */}
      <rect x="36" y="26" width="10" height="10" rx="0" fill="#1a1a2e" />
      <rect x="54" y="26" width="10" height="10" rx="0" fill="#1a1a2e" />
      {/* 鼻子 */}
      <rect x="45" y="38" width="10" height="8" rx="0" fill="#388E3C" />
      {/* 上衣 */}
      <rect
        x="28"
        y="56"
        width="44"
        height="32"
        rx="2"
        fill="#1976D2"
        stroke="#1565C0"
        strokeWidth="1"
      />
      {/* 裤子 */}
      <rect x="32" y="88" width="16" height="12" rx="1" fill="#5D4037" />
      <rect x="52" y="88" width="16" height="12" rx="1" fill="#5D4037" />
    </g>
  </svg>
)

// 骷髅射手
const MCSkeleton = ({
  size,
  color,
  glowColor,
}: {
  size: number
  color: string
  glowColor: string
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="mcskel-bg" cx="50%" cy="45%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.3" />
        <stop offset="100%" stopColor={color} stopOpacity="0.1" />
      </radialGradient>
      <filter id="mcskel-glow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#mcskel-bg)" />
    <g filter="url(#mcskel-glow)">
      {/* 头骨 */}
      <rect
        x="30"
        y="16"
        width="40"
        height="34"
        rx="2"
        fill="#E0E0E0"
        stroke="#9E9E9E"
        strokeWidth="1.5"
      />
      {/* 眼窝 */}
      <rect x="38" y="24" width="8" height="10" rx="0" fill="#1a1a2e" />
      <rect x="54" y="24" width="8" height="10" rx="0" fill="#1a1a2e" />
      {/* 鼻洞 */}
      <rect x="47" y="36" width="6" height="5" rx="0" fill="#555" />
      {/* 弓 */}
      <path
        d="M16 45 C30 30 70 30 84 45"
        fill="none"
        stroke="#8D6E63"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line x1="16" y1="45" x2="84" y2="45" stroke="#6D4C41" strokeWidth="1.5" />
      {/* 肋骨 */}
      <rect x="36" y="52" width="28" height="2" rx="1" fill="#E0E0E0" />
      <rect x="34" y="58" width="32" height="2" rx="1" fill="#E0E0E0" />
      <rect x="36" y="64" width="28" height="2" rx="1" fill="#E0E0E0" />
    </g>
  </svg>
)

// 苦力怕
const Creeper = ({
  size,
  color,
  glowColor,
}: {
  size: number
  color: string
  glowColor: string
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="creeper-bg" cx="50%" cy="45%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.3" />
        <stop offset="100%" stopColor={color} stopOpacity="0.1" />
      </radialGradient>
      <filter id="creeper-glow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#creeper-bg)" />
    <g filter="url(#creeper-glow)">
      {/* 头 */}
      <rect
        x="28"
        y="18"
        width="44"
        height="44"
        rx="1"
        fill="#4CAF50"
        stroke="#388E3C"
        strokeWidth="1.5"
      />
      {/* 经典苦力怕眼 */}
      <rect x="36" y="26" width="10" height="14" rx="0" fill="#1a1a2e" />
      <rect x="54" y="26" width="10" height="14" rx="0" fill="#1a1a2e" />
      {/* 嘴部（苦力怕标志性折线嘴） */}
      <path
        d="M34 48 L40 42 L46 48 L50 42 L54 48 L60 42 L66 48"
        fill="none"
        stroke="#1a1a2e"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* 身体 */}
      <rect
        x="32"
        y="62"
        width="36"
        height="26"
        rx="2"
        fill="#4CAF50"
        stroke="#388E3C"
        strokeWidth="1"
      />
      {/* 腿 */}
      <rect x="34" y="88" width="14" height="12" rx="1" fill="#388E3C" />
      <rect x="52" y="88" width="14" height="12" rx="1" fill="#388E3C" />
    </g>
  </svg>
)

// 末影人
const Enderman = ({
  size,
  color,
  glowColor,
}: {
  size: number
  color: string
  glowColor: string
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="enderman-bg" cx="50%" cy="45%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.4" />
        <stop offset="100%" stopColor={color} stopOpacity="0.1" />
      </radialGradient>
      <filter id="enderman-glow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#enderman-bg)" />
    <g filter="url(#enderman-glow)">
      {/* 头 */}
      <rect
        x="32"
        y="12"
        width="36"
        height="34"
        rx="1"
        fill="#1a1a2e"
        stroke="#0d0d1a"
        strokeWidth="1.5"
      />
      {/* 紫色眼睛 */}
      <rect x="40" y="20" width="8" height="8" rx="0" fill={glowColor} opacity="0.95" />
      <rect x="52" y="20" width="8" height="8" rx="0" fill={glowColor} opacity="0.95" />
      {/* 张嘴 */}
      <rect x="42" y="36" width="16" height="4" rx="0" fill="#2a2a4e" />
      {/* 身体（细长） */}
      <rect
        x="38"
        y="46"
        width="24"
        height="38"
        rx="0"
        fill="#1a1a2e"
        stroke="#0d0d1a"
        strokeWidth="1"
      />
      {/* 手臂 */}
      <rect x="20" y="48" width="14" height="6" rx="1" fill="#1a1a2e" />
      <rect x="66" y="48" width="14" height="6" rx="1" fill="#1a1a2e" />
    </g>
  </svg>
)

// 烈焰人
const Blaze = ({ size, color, glowColor }: { size: number; color: string; glowColor: string }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="blaze-bg" cx="50%" cy="45%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.4" />
        <stop offset="100%" stopColor={color} stopOpacity="0.1" />
      </radialGradient>
      <filter id="blaze-glow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#blaze-bg)" />
    <g filter="url(#blaze-glow)">
      {/* 头 */}
      <rect
        x="36"
        y="22"
        width="28"
        height="28"
        rx="2"
        fill="#F59E0B"
        stroke="#D97706"
        strokeWidth="1.5"
      />
      {/* 眼睛 */}
      <rect x="42" y="30" width="6" height="6" rx="0" fill="#1a1a2e" />
      <rect x="52" y="30" width="6" height="6" rx="0" fill="#1a1a2e" />
      {/* 嘴 */}
      <rect x="44" y="40" width="12" height="4" rx="1" fill="#B45309" />
      {/* 身体 */}
      <rect
        x="40"
        y="50"
        width="20"
        height="20"
        rx="2"
        fill="#F59E0B"
        stroke="#D97706"
        strokeWidth="1"
      />
      {/* 烈焰棒 */}
      <rect
        x="24"
        y="42"
        width="4"
        height="26"
        rx="2"
        fill="#FBBF24"
        transform="rotate(-15 26 55)"
      />
      <rect
        x="72"
        y="42"
        width="4"
        height="26"
        rx="2"
        fill="#FBBF24"
        transform="rotate(15 74 55)"
      />
      <rect x="44" y="74" width="4" height="22" rx="2" fill="#FBBF24" />
      {/* 烟雾粒子 */}
      <circle cx="24" cy="30" r="3" fill={glowColor} opacity="0.5" />
      <circle cx="76" cy="28" r="2.5" fill={glowColor} opacity="0.4" />
      <circle cx="50" cy="14" r="3" fill={glowColor} opacity="0.5" />
    </g>
  </svg>
)

// 凋零
const Wither = ({ size, color, glowColor }: { size: number; color: string; glowColor: string }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="wither-bg" cx="50%" cy="45%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.3" />
        <stop offset="100%" stopColor={color} stopOpacity="0.1" />
      </radialGradient>
      <filter id="wither-glow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#wither-bg)" />
    <g filter="url(#wither-glow)">
      {/* 中间头 */}
      <rect
        x="38"
        y="8"
        width="24"
        height="22"
        rx="1"
        fill="#1C1917"
        stroke="#44403C"
        strokeWidth="1"
      />
      <rect x="42" y="12" width="6" height="6" rx="0" fill={glowColor} opacity="0.9" />
      <rect x="52" y="12" width="6" height="6" rx="0" fill={glowColor} opacity="0.9" />
      {/* 左头 */}
      <rect
        x="14"
        y="18"
        width="20"
        height="18"
        rx="1"
        fill="#1C1917"
        stroke="#44403C"
        strokeWidth="1"
      />
      <rect x="18" y="22" width="5" height="5" rx="0" fill={glowColor} opacity="0.8" />
      <rect x="26" y="22" width="5" height="5" rx="0" fill={glowColor} opacity="0.8" />
      {/* 右头 */}
      <rect
        x="66"
        y="18"
        width="20"
        height="18"
        rx="1"
        fill="#1C1917"
        stroke="#44403C"
        strokeWidth="1"
      />
      <rect x="69" y="22" width="5" height="5" rx="0" fill={glowColor} opacity="0.8" />
      <rect x="77" y="22" width="5" height="5" rx="0" fill={glowColor} opacity="0.8" />
      {/* 脊椎连接 */}
      <rect x="46" y="28" width="8" height="12" rx="1" fill="#1C1917" />
      {/* 肋骨 */}
      <rect x="28" y="40" width="44" height="3" rx="1" fill="#292524" />
      <rect x="26" y="47" width="48" height="3" rx="1" fill="#292524" />
      <rect x="28" y="54" width="44" height="3" rx="1" fill="#292524" />
      <rect x="30" y="61" width="40" height="3" rx="1" fill="#292524" />
      {/* 身体 */}
      <rect x="34" y="40" width="6" height="24" rx="1" fill="#1C1917" />
      <rect x="60" y="40" width="6" height="24" rx="1" fill="#1C1917" />
    </g>
  </svg>
)

// 末影龙
const EnderDragon = ({
  size,
  color,
  glowColor,
}: {
  size: number
  color: string
  glowColor: string
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="edragon-bg" cx="50%" cy="45%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.4" />
        <stop offset="100%" stopColor={color} stopOpacity="0.1" />
      </radialGradient>
      <filter id="edragon-glow">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#edragon-bg)" />
    <g filter="url(#edragon-glow)">
      {/* 龙头 */}
      <path
        d="M30 35 L22 28 L28 40 L22 50 L36 52 L44 38 Z"
        fill="#1C1917"
        stroke="#44403C"
        strokeWidth="1.5"
      />
      {/* 下颌 */}
      <path d="M24 48 L20 54 L34 54 Z" fill="#2D2420" stroke="#44403C" strokeWidth="1" />
      {/* 眼睛 */}
      <rect x="30" y="34" width="6" height="6" rx="0" fill={glowColor} opacity="0.95" />
      {/* 颈部 */}
      <rect x="36" y="38" width="12" height="30" rx="0" fill="#1C1917" />
      {/* 身体 */}
      <rect
        x="44"
        y="46"
        width="40"
        height="20"
        rx="2"
        fill="#1C1917"
        stroke="#44403C"
        strokeWidth="1"
      />
      {/* 翅膀 */}
      <path
        d="M48 46 L38 28 L56 28 L66 42 Z"
        fill="#2D2420"
        stroke="#44403C"
        strokeWidth="1"
        opacity="0.8"
      />
      <path
        d="M68 46 L78 28 L86 28 L66 42 Z"
        fill="#2D2420"
        stroke="#44403C"
        strokeWidth="1"
        opacity="0.8"
      />
      {/* 龙角 */}
      <path
        d="M26 30 L18 18 L30 28"
        fill="none"
        stroke="#44403C"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </g>
  </svg>
)

// === PvZ 植物大战僵尸 Boss ===
const PvzBasic = ({
  size,
  color,
  glowColor,
}: {
  size: number
  color: string
  glowColor: string
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="pvzb-bg" cx="50%" cy="45%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.3" />
        <stop offset="100%" stopColor={color} stopOpacity="0.1" />
      </radialGradient>
      <filter id="pvzb-g">
        <feGaussianBlur stdDeviation="2" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#pvzb-bg)" />
    <g filter="url(#pvzb-g)">
      <rect
        x="30"
        y="22"
        width="40"
        height="34"
        rx="2"
        fill="#6B8E4E"
        stroke="#556B2F"
        strokeWidth="1.5"
      />
      <rect x="36" y="28" width="8" height="10" fill="#FFE4B5" />
      <rect x="56" y="28" width="8" height="10" fill="#FFE4B5" />
      <circle cx="40" cy="33" r="3" fill="#1a1a2e" />
      <circle cx="60" cy="33" r="3" fill="#1a1a2e" />
      <rect x="38" y="42" width="24" height="4" rx="1" fill="#4A3728" />
      <rect x="32" y="56" width="36" height="28" rx="2" fill="#8B7355" />
      <rect x="28" y="58" width="4" height="20" rx="1" fill="#6B8E4E" />
      <rect x="68" y="58" width="4" height="20" rx="1" fill="#6B8E4E" />
    </g>
  </svg>
)
const PvzCone = ({
  size,
  color,
  glowColor,
}: {
  size: number
  color: string
  glowColor: string
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="pvzc-bg" cx="50%" cy="45%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.3" />
        <stop offset="100%" stopColor={color} stopOpacity="0.1" />
      </radialGradient>
      <filter id="pvzc-g">
        <feGaussianBlur stdDeviation="2" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#pvzc-bg)" />
    <g filter="url(#pvzc-g)">
      <polygon points="32,24 68,24 60,46 40,46" fill="#FF8C00" stroke="#E07000" strokeWidth="1.5" />
      <rect
        x="30"
        y="46"
        width="40"
        height="30"
        rx="2"
        fill="#6B8E4E"
        stroke="#556B2F"
        strokeWidth="1"
      />
      <rect x="36" y="50" width="8" height="8" fill="#FFE4B5" />
      <rect x="56" y="50" width="8" height="8" fill="#FFE4B5" />
      <circle cx="40" cy="54" r="2.5" fill="#1a1a2e" />
      <circle cx="60" cy="54" r="2.5" fill="#1a1a2e" />
      <rect x="40" y="62" width="20" height="4" rx="1" fill="#4A3728" />
    </g>
  </svg>
)
const PvzBucket = ({
  size,
  color,
  glowColor,
}: {
  size: number
  color: string
  glowColor: string
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="pvzbu-bg" cx="50%" cy="45%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.3" />
        <stop offset="100%" stopColor={color} stopOpacity="0.1" />
      </radialGradient>
      <filter id="pvzbu-g">
        <feGaussianBlur stdDeviation="2" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#pvzbu-bg)" />
    <g filter="url(#pvzbu-g)">
      <rect
        x="32"
        y="14"
        width="36"
        height="20"
        rx="1"
        fill="#808080"
        stroke="#606060"
        strokeWidth="1.5"
      />
      <rect
        x="30"
        y="34"
        width="40"
        height="34"
        rx="2"
        fill="#6B8E4E"
        stroke="#556B2F"
        strokeWidth="1"
      />
      <rect x="36" y="40" width="8" height="8" fill="#FFE4B5" />
      <rect x="56" y="40" width="8" height="8" fill="#FFE4B5" />
      <circle cx="40" cy="44" r="2.5" fill="#1a1a2e" />
      <circle cx="60" cy="44" r="2.5" fill="#1a1a2e" />
      <rect x="38" y="52" width="24" height="4" rx="1" fill="#4A3728" />
    </g>
  </svg>
)
const PvzDisco = ({
  size,
  color,
  glowColor,
}: {
  size: number
  color: string
  glowColor: string
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="pvzd-bg" cx="50%" cy="45%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.3" />
        <stop offset="100%" stopColor={color} stopOpacity="0.1" />
      </radialGradient>
      <filter id="pvzd-g">
        <feGaussianBlur stdDeviation="2" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#pvzd-bg)" />
    <g filter="url(#pvzd-g)">
      <rect x="30" y="18" width="40" height="20" rx="2" fill="#FF1493" />
      <rect x="24" y="14" width="10" height="10" rx="1" fill={glowColor} opacity="0.7" />
      <rect x="66" y="14" width="10" height="10" rx="1" fill={glowColor} opacity="0.7" />
      <rect
        x="30"
        y="38"
        width="40"
        height="34"
        rx="2"
        fill="#6B8E4E"
        stroke="#556B2F"
        strokeWidth="1"
      />
      <rect x="36" y="44" width="8" height="8" fill="#FFE4B5" />
      <rect x="56" y="44" width="8" height="8" fill="#FFE4B5" />
      <circle cx="40" cy="48" r="2.5" fill="#1a1a2e" />
      <circle cx="60" cy="48" r="2.5" fill="#1a1a2e" />
    </g>
  </svg>
)
const PvzFootball = ({
  size,
  color,
  glowColor,
}: {
  size: number
  color: string
  glowColor: string
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="pvzf-bg" cx="50%" cy="45%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.3" />
        <stop offset="100%" stopColor={color} stopOpacity="0.1" />
      </radialGradient>
      <filter id="pvzf-g">
        <feGaussianBlur stdDeviation="2" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#pvzf-bg)" />
    <g filter="url(#pvzf-g)">
      <ellipse cx="50" cy="22" rx="16" ry="10" fill="#8B0000" />
      <rect x="46" y="28" width="8" height="4" fill="#4A3728" />
      <rect
        x="30"
        y="32"
        width="40"
        height="34"
        rx="2"
        fill="#6B8E4E"
        stroke="#556B2F"
        strokeWidth="1"
      />
      <rect x="36" y="38" width="8" height="8" fill="#FFE4B5" />
      <rect x="56" y="38" width="8" height="8" fill="#FFE4B5" />
      <circle cx="40" cy="42" r="2.5" fill="#ff0000" />
      <circle cx="60" cy="42" r="2.5" fill="#ff0000" />
      <rect x="34" y="50" width="32" height="16" rx="2" fill="#8B0000" />
      <ellipse cx="50" cy="58" rx="10" ry="6" fill="#FFF" stroke="#CCC" strokeWidth="1" />
    </g>
  </svg>
)
const PvzGargantuar = ({
  size,
  color,
  glowColor,
}: {
  size: number
  color: string
  glowColor: string
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="pvzg-bg" cx="50%" cy="45%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.3" />
        <stop offset="100%" stopColor={color} stopOpacity="0.1" />
      </radialGradient>
      <filter id="pvzg-g">
        <feGaussianBlur stdDeviation="2" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#pvzg-bg)" />
    <g filter="url(#pvzg-g)">
      <rect
        x="34"
        y="8"
        width="32"
        height="26"
        rx="2"
        fill="#8B4513"
        stroke="#6B3410"
        strokeWidth="1.5"
      />
      <rect x="38" y="12" width="6" height="8" fill="#FFE4B5" />
      <rect x="56" y="12" width="6" height="8" fill="#FFE4B5" />
      <circle cx="41" cy="16" r="2" fill="#ff0000" />
      <circle cx="59" cy="16" r="2" fill="#ff0000" />
      <rect
        x="30"
        y="34"
        width="40"
        height="44"
        rx="2"
        fill="#6B8E4E"
        stroke="#556B2F"
        strokeWidth="1"
      />
      <rect x="20" y="36" width="10" height="30" rx="1.5" fill="#8B4513" />
      <rect x="70" y="36" width="10" height="30" rx="1.5" fill="#8B4513" />
    </g>
  </svg>
)
const PvzZomboss = ({
  size,
  color,
  glowColor,
}: {
  size: number
  color: string
  glowColor: string
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="pvzz-bg" cx="50%" cy="45%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.3" />
        <stop offset="100%" stopColor={color} stopOpacity="0.1" />
      </radialGradient>
      <filter id="pvzz-g">
        <feGaussianBlur stdDeviation="2" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#pvzz-bg)" />
    <g filter="url(#pvzz-g)">
      <rect
        x="34"
        y="18"
        width="32"
        height="22"
        rx="2"
        fill="#4B0082"
        stroke="#3A0068"
        strokeWidth="1.5"
      />
      <rect x="38" y="22" width="6" height="6" fill="#FFE4B5" />
      <rect x="56" y="22" width="6" height="6" fill="#FFE4B5" />
      <circle cx="41" cy="25" r="2" fill="#ff0000" />
      <circle cx="59" cy="25" r="2" fill="#ff0000" />
      <rect x="42" y="30" width="16" height="4" rx="1" fill="#2a1a3e" />
      <rect
        x="30"
        y="40"
        width="40"
        height="36"
        rx="3"
        fill="#4B0082"
        stroke="#3A0068"
        strokeWidth="1"
      />
      <circle cx="40" cy="52" r="6" fill={glowColor} opacity="0.5" />
      <circle cx="60" cy="52" r="6" fill={glowColor} opacity="0.5" />
      <rect x="24" y="44" width="8" height="20" rx="1.5" fill="#6B8E4E" />
      <rect x="68" y="44" width="8" height="20" rx="1.5" fill="#6B8E4E" />
    </g>
  </svg>
)
// === 超能装甲兵团 Boss ===

// 黑熊坦克 — 艾布拉姆斯被生命珠复活，黑暗生物，周身布满武器，贪婪吞噬
const TankDarkbear = ({
  size,
  color,
  glowColor,
}: {
  size: number
  color: string
  glowColor: string
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="tdb-bg" cx="50%" cy="45%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.25" />
        <stop offset="100%" stopColor={color} stopOpacity="0.05" />
      </radialGradient>
      <filter id="tdb-g">
        <feGaussianBlur stdDeviation="1.5" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#tdb-bg)" />
    <g filter="url(#tdb-g)">
      {/* 车体 */}
      <rect
        x="10"
        y="42"
        width="80"
        height="24"
        rx="3"
        fill="#1C1917"
        stroke="#44403C"
        strokeWidth="1.5"
      />
      {/* 履带 */}
      <rect
        x="8"
        y="60"
        width="84"
        height="10"
        rx="5"
        fill="#292524"
        stroke="#1C1917"
        strokeWidth="1"
      />
      <circle cx="20" cy="65" r="4" fill="#44403C" />
      <circle cx="35" cy="65" r="4" fill="#44403C" />
      <circle cx="50" cy="65" r="4" fill="#44403C" />
      <circle cx="65" cy="65" r="4" fill="#44403C" />
      <circle cx="80" cy="65" r="4" fill="#44403C" />
      {/* 炮塔 */}
      <rect
        x="30"
        y="26"
        width="30"
        height="18"
        rx="4"
        fill="#292524"
        stroke="#44403C"
        strokeWidth="1"
      />
      {/* 主炮 */}
      <rect x="56" y="32" width="30" height="6" rx="2" fill="#44403C" />
      {/* 副武器（遍布全身） */}
      <rect x="14" y="38" width="4" height="12" rx="1" fill="#EF4444" opacity="0.6" />
      <rect x="22" y="38" width="4" height="10" rx="1" fill="#EF4444" opacity="0.5" />
      <rect x="82" y="38" width="4" height="12" rx="1" fill="#EF4444" opacity="0.6" />
      <rect x="74" y="40" width="4" height="8" rx="1" fill="#EF4444" opacity="0.5" />
      {/* 黑暗光环 */}
      <circle cx="45" cy="35" r="3" fill={glowColor} opacity="0.8" />
      <circle cx="55" cy="35" r="3" fill={glowColor} opacity="0.6" />
      {/* 吞噬符号 */}
      <text x="44" y="56" fontSize="10" fill="#EF4444" fontWeight="bold">
        ⚔
      </text>
    </g>
  </svg>
)

// 小渣 — 黑暗能量体，可脱离附身，紫色幽灵状+坦克轮廓
const TankXiaozha = ({
  size,
  color,
  glowColor,
}: {
  size: number
  color: string
  glowColor: string
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="txz-bg" cx="50%" cy="45%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.4" />
        <stop offset="100%" stopColor={color} stopOpacity="0.05" />
      </radialGradient>
      <filter id="txz-g">
        <feGaussianBlur stdDeviation="2" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#txz-bg)" />
    <g filter="url(#txz-g)">
      {/* 底层坦克轮廓（半透明，因为附在上面） */}
      <rect x="18" y="50" width="64" height="18" rx="3" fill="#2D1B4E" opacity="0.4" />
      <rect x="8" y="62" width="84" height="8" rx="4" fill="#1a1025" opacity="0.3" />
      {/* 黑暗能量体 — 幽灵形态 */}
      <ellipse cx="50" cy="38" rx="22" ry="24" fill="#2D1B4E" opacity="0.7" />
      <ellipse cx="50" cy="38" rx="16" ry="18" fill="#4C1D95" opacity="0.5" />
      {/* 发光双眼 */}
      <ellipse cx="42" cy="32" rx="5" ry="6" fill={glowColor} opacity="0.95" />
      <ellipse cx="58" cy="32" rx="5" ry="6" fill={glowColor} opacity="0.95" />
      <ellipse cx="42" cy="32" rx="2" ry="2.5" fill="#fff" opacity="0.6" />
      <ellipse cx="58" cy="32" rx="2" ry="2.5" fill="#fff" opacity="0.6" />
      {/* 飘散的能量触手 */}
      <path
        d="M28 50 Q22 44 18 50 Q14 56 20 60"
        fill="none"
        stroke={glowColor}
        strokeWidth="2"
        opacity="0.5"
      />
      <path
        d="M72 50 Q78 44 82 50 Q86 56 80 60"
        fill="none"
        stroke={glowColor}
        strokeWidth="2"
        opacity="0.5"
      />
      {/* 粒子 */}
      <circle cx="32" cy="20" r="2" fill={glowColor} opacity="0.4" />
      <circle cx="68" cy="22" r="1.5" fill={glowColor} opacity="0.3" />
      <circle cx="50" cy="14" r="2.5" fill={glowColor} opacity="0.5" />
    </g>
  </svg>
)

// 希曼 — M4谢尔曼，爱吹牛炫耀，幻影+星芒
const TankSherman = ({
  size,
  color,
  glowColor,
}: {
  size: number
  color: string
  glowColor: string
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="tsh-bg" cx="50%" cy="45%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.3" />
        <stop offset="100%" stopColor={color} stopOpacity="0.05" />
      </radialGradient>
      <filter id="tsh-g">
        <feGaussianBlur stdDeviation="1.5" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#tsh-bg)" />
    <g filter="url(#tsh-g)">
      {/* 车体 — 土黄色 */}
      <rect
        x="12"
        y="46"
        width="76"
        height="20"
        rx="3"
        fill="#B45309"
        stroke="#92400E"
        strokeWidth="1.5"
      />
      {/* 履带 */}
      <rect x="8" y="62" width="84" height="10" rx="5" fill="#78350F" />
      <circle cx="20" cy="67" r="4" fill="#92400E" />
      <circle cx="36" cy="67" r="4" fill="#92400E" />
      <circle cx="52" cy="67" r="4" fill="#92400E" />
      <circle cx="68" cy="67" r="4" fill="#92400E" />
      <circle cx="80" cy="67" r="4" fill="#92400E" />
      {/* 炮塔 */}
      <rect
        x="32"
        y="28"
        width="26"
        height="20"
        rx="4"
        fill="#D97706"
        stroke="#B45309"
        strokeWidth="1"
      />
      {/* 主炮 */}
      <rect x="56" y="36" width="28" height="5" rx="2" fill="#F59E0B" />
      {/* 副炮 */}
      <rect x="30" y="34" width="4" height="10" rx="1.5" fill="#FBBF24" />
      {/* 幻影分身（半透明） */}
      <rect x="20" y="44" width="24" height="8" rx="2" fill="#FDE68A" opacity="0.2" />
      <rect x="16" y="34" width="10" height="6" rx="2" fill="#FDE68A" opacity="0.15" />
      {/* 星芒 — 炫耀光环 */}
      <circle cx="45" cy="38" r="8" fill={glowColor} opacity="0.15" />
      <circle cx="45" cy="38" r="4" fill={glowColor} opacity="0.3" />
      {/* 闪电符号（炫耀） */}
      <text x="42" y="56" fontSize="10" fill="#FBBF24" fontWeight="bold">
        ★
      </text>
    </g>
  </svg>
)

// 小半 — 63A水陆两栖，冲动，操控水火电三元素
const TankXiaoban = ({
  size,
  color,
  glowColor,
}: {
  size: number
  color: string
  glowColor: string
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="txb-bg" cx="50%" cy="45%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.3" />
        <stop offset="100%" stopColor={color} stopOpacity="0.05" />
      </radialGradient>
      <filter id="txb-g">
        <feGaussianBlur stdDeviation="1.5" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#txb-bg)" />
    <g filter="url(#txb-g)">
      {/* 车体 — 水陆两栖外形更扁宽 */}
      <rect
        x="8"
        y="46"
        width="84"
        height="18"
        rx="5"
        fill="#0E7490"
        stroke="#155E75"
        strokeWidth="1.5"
      />
      {/* 履带+浮箱 */}
      <rect x="6" y="60" width="88" height="10" rx="5" fill="#164E63" />
      <circle cx="18" cy="65" r="4" fill="#155E75" />
      <circle cx="34" cy="65" r="4" fill="#155E75" />
      <circle cx="50" cy="65" r="4" fill="#155E75" />
      <circle cx="66" cy="65" r="4" fill="#155E75" />
      <circle cx="82" cy="65" r="4" fill="#155E75" />
      {/* 炮塔 */}
      <rect
        x="36"
        y="30"
        width="22"
        height="18"
        rx="4"
        fill="#0891B2"
        stroke="#0E7490"
        strokeWidth="1"
      />
      {/* 炮管 */}
      <rect x="56" y="38" width="24" height="5" rx="2" fill="#22D3EE" />
      {/* 三元素 */}
      {/* 水 💧 */}
      <ellipse cx="24" cy="34" rx="6" ry="8" fill="#3B82F6" opacity="0.6" />
      <ellipse cx="24" cy="32" rx="3" ry="4" fill="#93C5FD" opacity="0.5" />
      {/* 火 🔥 */}
      <path
        d="M76 28 Q78 20 74 24 Q72 18 76 22 Q80 16 78 24 Q82 20 80 28 Z"
        fill="#F97316"
        opacity="0.7"
      />
      <path d="M77 24 Q78 20 76 22 Q74 18 77 22 Q79 16 78 22 Z" fill="#FBBF24" opacity="0.6" />
      {/* 电 ⚡ */}
      <path
        d="M44 18 L48 26 L42 24 L46 32"
        fill="none"
        stroke="#FDE047"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.8"
      />
    </g>
  </svg>
)

// 小绿 — T-34，温柔不自信，时钟/时间静止
const TankXiaolv = ({
  size,
  color,
  glowColor,
}: {
  size: number
  color: string
  glowColor: string
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="txl-bg" cx="50%" cy="45%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.35" />
        <stop offset="100%" stopColor={color} stopOpacity="0.05" />
      </radialGradient>
      <filter id="txl-g">
        <feGaussianBlur stdDeviation="1.5" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#txl-bg)" />
    <g filter="url(#txl-g)">
      {/* 车体 — T-34经典圆弧 */}
      <rect
        x="10"
        y="46"
        width="80"
        height="20"
        rx="3"
        fill="#166534"
        stroke="#14532D"
        strokeWidth="1.5"
      />
      {/* 履带 */}
      <rect x="8" y="62" width="84" height="10" rx="5" fill="#052E16" />
      <circle cx="20" cy="67" r="4" fill="#14532D" />
      <circle cx="36" cy="67" r="4" fill="#14532D" />
      <circle cx="52" cy="67" r="4" fill="#14532D" />
      <circle cx="68" cy="67" r="4" fill="#14532D" />
      <circle cx="80" cy="67" r="4" fill="#14532D" />
      {/* 炮塔 — T-34标志性的圆炮塔 */}
      <ellipse cx="44" cy="38" rx="16" ry="12" fill="#15803D" stroke="#166534" strokeWidth="1" />
      {/* 炮管 */}
      <rect x="58" y="35" width="26" height="5" rx="2" fill="#4ADE80" />
      {/* 时钟 — 时间静止 */}
      <circle cx="44" cy="38" r="7" fill="#0A2E14" stroke={glowColor} strokeWidth="1.5" />
      <line
        x1="44"
        y1="38"
        x2="44"
        y2="33"
        stroke={glowColor}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="44"
        y1="38"
        x2="48"
        y2="38"
        stroke={glowColor}
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* 时空涟漪 */}
      <circle
        cx="44"
        cy="38"
        r="11"
        fill="none"
        stroke={glowColor}
        strokeWidth="0.5"
        opacity="0.4"
      />
      <circle
        cx="44"
        cy="38"
        r="15"
        fill="none"
        stroke={glowColor}
        strokeWidth="0.3"
        opacity="0.25"
      />
      {/* 柔和光芒 */}
      <circle cx="30" cy="48" r="2" fill={glowColor} opacity="0.3" />
      <circle cx="70" cy="48" r="2" fill={glowColor} opacity="0.3" />
    </g>
  </svg>
)

// 朱古力 — 古斯塔夫巨炮，体型巨大，胆小但勇猛，虫洞通道
const TankZhuguli = ({
  size,
  color,
  glowColor,
}: {
  size: number
  color: string
  glowColor: string
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="tzg-bg" cx="50%" cy="45%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.3" />
        <stop offset="100%" stopColor={color} stopOpacity="0.05" />
      </radialGradient>
      <filter id="tzg-g">
        <feGaussianBlur stdDeviation="1.5" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#tzg-bg)" />
    <g filter="url(#tzg-g)">
      {/* 底盘 — 巨大的铁路炮基座 */}
      <rect
        x="4"
        y="54"
        width="92"
        height="14"
        rx="2"
        fill="#78350F"
        stroke="#451A03"
        strokeWidth="1.5"
      />
      {/* 铁路轮子 */}
      <circle cx="16" cy="64" r="5" fill="#451A03" stroke="#291002" strokeWidth="1" />
      <circle cx="30" cy="64" r="5" fill="#451A03" stroke="#291002" strokeWidth="1" />
      <circle cx="44" cy="64" r="5" fill="#451A03" stroke="#291002" strokeWidth="1" />
      <circle cx="58" cy="64" r="5" fill="#451A03" stroke="#291002" strokeWidth="1" />
      <circle cx="72" cy="64" r="5" fill="#451A03" stroke="#291002" strokeWidth="1" />
      <circle cx="86" cy="64" r="5" fill="#451A03" stroke="#291002" strokeWidth="1" />
      {/* 巨炮身管 — 古斯塔夫标志性超长炮管 */}
      <rect x="28" y="34" width="10" height="24" rx="3" fill="#B45309" />
      <rect
        x="22"
        y="20"
        width="64"
        height="16"
        rx="4"
        fill="#92400E"
        stroke="#78350F"
        strokeWidth="1"
      />
      {/* 炮口 */}
      <rect
        x="84"
        y="22"
        width="8"
        height="12"
        rx="2"
        fill="#D97706"
        stroke="#B45309"
        strokeWidth="1"
      />
      {/* 虫洞 — 行星跳跃 */}
      <circle cx="38" cy="28" r="6" fill="#1a0a00" stroke={glowColor} strokeWidth="1.5" />
      <circle cx="38" cy="28" r="3" fill={glowColor} opacity="0.4" />
      {/* 穿甲弹光芒 */}
      <circle cx="88" cy="28" r="3" fill="#EF4444" opacity="0.7" />
    </g>
  </svg>
)

// 大虎 — 虎式坦克，沉着博学，赋予生命，虎纹+生命之光
const TankDahu = ({
  size,
  color,
  glowColor,
}: {
  size: number
  color: string
  glowColor: string
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <radialGradient id="tdh-bg" cx="50%" cy="45%" r="50%">
        <stop offset="0%" stopColor={glowColor} stopOpacity="0.35" />
        <stop offset="100%" stopColor={color} stopOpacity="0.05" />
      </radialGradient>
      <filter id="tdh-g">
        <feGaussianBlur stdDeviation="1.5" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#tdh-bg)" />
    <g filter="url(#tdh-g)">
      {/* 车体 — 虎式坦克方正厚重的灰色装甲 */}
      <rect
        x="8"
        y="44"
        width="84"
        height="22"
        rx="2"
        fill="#6B7280"
        stroke="#4B5563"
        strokeWidth="2"
      />
      {/* 灰色装甲纹理 */}
      <path d="M20 44 L24 54 L28 44" fill="#9CA3AF" opacity="0.3" />
      <path d="M38 44 L42 56 L46 44" fill="#9CA3AF" opacity="0.3" />
      <path d="M56 44 L60 54 L64 44" fill="#9CA3AF" opacity="0.3" />
      <path d="M74 44 L78 56 L82 44" fill="#9CA3AF" opacity="0.3" />
      {/* 履带 */}
      <rect x="6" y="62" width="88" height="10" rx="5" fill="#374151" />
      <circle cx="18" cy="67" r="4.5" fill="#4B5563" />
      <circle cx="34" cy="67" r="4.5" fill="#4B5563" />
      <circle cx="50" cy="67" r="4.5" fill="#4B5563" />
      <circle cx="66" cy="67" r="4.5" fill="#4B5563" />
      <circle cx="82" cy="67" r="4.5" fill="#4B5563" />
      {/* 炮塔 — 灰色棱角分明 */}
      <rect
        x="28"
        y="24"
        width="28"
        height="22"
        rx="2"
        fill="#9CA3AF"
        stroke="#6B7280"
        strokeWidth="1"
      />
      {/* 长炮管 — 88mm炮 */}
      <rect x="54" y="34" width="36" height="5" rx="2" fill="#6B7280" />
      <rect x="88" y="33" width="6" height="7" rx="1" fill="#9CA3AF" />
      {/* 五颗星 — 虎式王牌标志 */}
      <text x="14" y="58" fontSize="7" fill="#FBBF24" opacity="0.9">
        ★
      </text>
      <text x="24" y="58" fontSize="7" fill="#FBBF24" opacity="0.9">
        ★
      </text>
      <text x="34" y="58" fontSize="7" fill="#FBBF24" opacity="0.9">
        ★
      </text>
      <text x="44" y="58" fontSize="7" fill="#FBBF24" opacity="0.9">
        ★
      </text>
      <text x="54" y="58" fontSize="7" fill="#FBBF24" opacity="0.9">
        ★
      </text>
      {/* 生命之光 — 赋予其他玩具生命 */}
      <circle cx="42" cy="35" r="8" fill={glowColor} opacity="0.12" />
      <circle cx="42" cy="35" r="5" fill={glowColor} opacity="0.25" />
      <circle cx="42" cy="35" r="2.5" fill={glowColor} opacity="0.6" />
      {/* 生命能量射线 */}
      <line x1="48" y1="34" x2="58" y2="28" stroke={glowColor} strokeWidth="0.8" opacity="0.4" />
      <line x1="48" y1="36" x2="60" y2="38" stroke={glowColor} strokeWidth="0.8" opacity="0.3" />
      <circle cx="60" cy="28" r="1.5" fill={glowColor} opacity="0.5" />
      <circle cx="62" cy="38" r="1.5" fill={glowColor} opacity="0.4" />
    </g>
  </svg>
)

const BOSS_SVG_MAP: Record<string, React.FC<{ size: number; color: string; glowColor: string }>> = {
  skeleton: Skeleton,
  bat: Bat,
  treant: Treant,
  knight: Knight,
  golem: Golem,
  spirit: Spirit,
  dragon: Dragon,
  frostlord: FrostLord,
  thunderbeast: ThunderBeast,
  demonlord: DemonLord,
  zombie: Zombie,
  mc_skeleton: MCSkeleton,
  creeper: Creeper,
  enderman: Enderman,
  blaze: Blaze,
  wither: Wither,
  ender_dragon: EnderDragon,
  pvz_basic: PvzBasic,
  pvz_cone: PvzCone,
  pvz_bucket: PvzBucket,
  pvz_disco: PvzDisco,
  pvz_football: PvzFootball,
  pvz_gargantuar: PvzGargantuar,
  pvz_zomboss: PvzZomboss,
  tank_light: TankDarkbear,
  tank_medium: TankXiaozha,
  tank_heavy: TankSherman,
  tank_rocket: TankXiaoban,
  tank_laser: TankXiaolv,
  tank_stealth: TankZhuguli,
  tank_super: TankDahu,
  tank_darkbear: TankDarkbear,
  tank_xiaozha: TankXiaozha,
  tank_sherman: TankSherman,
  tank_xiaoban: TankXiaoban,
  tank_xiaolv: TankXiaolv,
  tank_zhuguli: TankZhuguli,
  tank_dahu: TankDahu,
}

export default function BossAvatar({
  icon,
  color,
  glowColor,
  size = 56,
  className,
}: BossAvatarProps) {
  const SvgComponent = BOSS_SVG_MAP[icon]
  if (!SvgComponent) return null
  return (
    <div className={className} style={{ width: size, height: size, flexShrink: 0 }}>
      <SvgComponent size={size} color={color} glowColor={glowColor} />
    </div>
  )
}
