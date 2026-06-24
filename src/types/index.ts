// ============ 用户 ============
export interface User {
  id: string
  username: string
  password: string
  role: 'student' | 'parent'
  displayName: string
  createdAt: string
}

// ============ 任务 ============
export type TaskStatus = 'pending' | 'submitted' | 'approved' | 'rejected'
export type TaskRating = 'excellent' | 'good'
export type TaskType = 'temporary' | 'daily' | 'periodic'

export interface Task {
  id: string
  parentId: string
  studentId: string
  name: string
  quantity: number
  basePoints: number
  taskType: TaskType
  weekdays?: number[] // 周期任务：1-7 表示周一到周日
  taskDate?: string // 任务所属日期 YYYY-MM-DD（每日/周期任务每日生成）
  status: TaskStatus
  rating?: TaskRating
  finalPoints?: number
  createdAt: string
  submittedAt?: string
  approvedAt?: string
}

// ============ 积分 ============
export type PointSource =
  | 'task_reward'
  | 'lottery_cost'
  | 'admin_grant'
  | 'checkin'
  | 'math_boss_cost'
  | 'math_boss_reward'
  | 'math_boss_hidden_cost'
  | 'math_boss_hidden_reward'

export interface PointRecord {
  id: string
  studentId: string
  amount: number // 正数为获得，负数为消耗
  source: PointSource
  description: string
  relatedId?: string // 关联ID（任务ID等）
  createdAt: string
}

// ============ 代金券 ============
export type VoucherSource = 'lottery' | 'task_bonus' | 'admin_grant'

export interface Voucher {
  id: string
  studentId: string
  amount: number
  source: VoucherSource
  createdAt: string
}

// ============ 提现申请 ============
export type WithdrawStatus = 'pending' | 'approved' | 'rejected'

export interface WithdrawRequest {
  id: string
  studentId: string
  amount: number
  status: WithdrawStatus
  parentId?: string
  createdAt: string
  approvedAt?: string
}

// ============ 抽奖配置 ============
export const LOTTERY_POINT_COST = 10 // 每次抽奖消耗的积分数（默认值）

export interface LotteryPrizeItem {
  amount: number
  weight: number
  type: 'money' | 'joke'
  label: string
  color: string
}

export interface LotteryConfig {
  boxPrizes: LotteryPrizeItem[]
  wheelSegments: LotteryPrizeItem[]
  pointCost: number
  _customized?: boolean
}

// ============ 抽奖记录 ============
export interface LotteryRecord {
  date: string // YYYY-MM-DD
  count: number
}

// ============ 签到 ============
export const CHECKIN_POINTS = 10 // 每次签到获得的积分数

// ============ 数学打Boss ============
export const MATH_BOSS_COST = 10 // 每次挑战消耗的积分数
export const PLAYER_MAX_HEARTS = 5 // 玩家最大心值

// Boss定义 - 失落城堡2暗黑奇幻风格
export interface MathBossDef {
  name: string
  icon: string // Boss图标标识（用于BossAvatar组件渲染SVG）
  difficulty: 'easy' | 'medium' | 'hard'
  hearts: number // Boss心值（需要答对几题才能击败）
  type: string // 题型描述
  color: string // 主题色
  glowColor: string // 发光色
  attackEffect: string // 攻击特效
}

export const MATH_BOSSES: MathBossDef[] = [
  {
    name: '骷髅兵',
    icon: 'skeleton',
    difficulty: 'easy',
    hearts: 1,
    type: '不进位加',
    color: '#6B7280',
    glowColor: '#4ADE80',
    attackEffect: '🦴',
  },
  {
    name: '暗影蝠',
    icon: 'bat',
    difficulty: 'easy',
    hearts: 1,
    type: '不退位减',
    color: '#6B21A8',
    glowColor: '#A855F7',
    attackEffect: '🌙',
  },
  {
    name: '腐化树人',
    icon: 'treant',
    difficulty: 'easy',
    hearts: 1,
    type: '不进位加/不退位减',
    color: '#4D7C0F',
    glowColor: '#84CC16',
    attackEffect: '🍃',
  },
  {
    name: '亡灵骑士',
    icon: 'knight',
    difficulty: 'medium',
    hearts: 2,
    type: '不进位加',
    color: '#475569',
    glowColor: '#60A5FA',
    attackEffect: '⚔️',
  },
  {
    name: '熔岩巨像',
    icon: 'golem',
    difficulty: 'medium',
    hearts: 2,
    type: '进位加',
    color: '#C2410C',
    glowColor: '#F97316',
    attackEffect: '🔥',
  },
  {
    name: '深渊水灵',
    icon: 'spirit',
    difficulty: 'medium',
    hearts: 2,
    type: '混合',
    color: '#0E7490',
    glowColor: '#22D3EE',
    attackEffect: '💧',
  },
  {
    name: '噬魂火龙',
    icon: 'dragon',
    difficulty: 'hard',
    hearts: 3,
    type: '退位减',
    color: '#B91C1C',
    glowColor: '#EF4444',
    attackEffect: '🔥',
  },
  {
    name: '冰封领主',
    icon: 'frostlord',
    difficulty: 'hard',
    hearts: 3,
    type: '进位加',
    color: '#1E40AF',
    glowColor: '#93C5FD',
    attackEffect: '🧊',
  },
  {
    name: '雷霆兽王',
    icon: 'thunderbeast',
    difficulty: 'hard',
    hearts: 3,
    type: '退位减',
    color: '#5B21B6',
    glowColor: '#A78BFA',
    attackEffect: '⚡',
  },
  {
    name: '黑暗魔王',
    icon: 'demonlord',
    difficulty: 'hard',
    hearts: 4,
    type: '进位加/退位减',
    color: '#292524',
    glowColor: '#DC2626',
    attackEffect: '🌀',
  },
]

// 阶梯奖励表：击败Boss数 → 返还积分
export const MATH_BOSS_REWARDS: Record<number, number> = {
  0: 0,
  1: 0,
  2: 0,
  3: 0,
  4: 4,
  5: 7,
  6: 10,
  7: 13,
  8: 16,
  9: 19,
  10: 25,
}

// ============ 隐藏关卡：我的世界 Boss ============
export const MINECRAFT_BOSS_COST = 10

export interface MinecraftBossDef {
  name: string
  icon: string
  difficulty: 'easy' | 'medium' | 'hard'
  hearts: number
  color: string
  glowColor: string
  attackEffect: string
}

export const MINECRAFT_BOSSES: MinecraftBossDef[] = [
  {
    name: '僵尸',
    icon: 'zombie',
    difficulty: 'easy',
    hearts: 1,
    color: '#2D5016',
    glowColor: '#7BC74D',
    attackEffect: '🧟',
  },
  {
    name: '骷髅射手',
    icon: 'mc_skeleton',
    difficulty: 'easy',
    hearts: 1,
    color: '#C0C0C0',
    glowColor: '#E5E7EB',
    attackEffect: '🏹',
  },
  {
    name: '苦力怕',
    icon: 'creeper',
    difficulty: 'medium',
    hearts: 2,
    color: '#4CAF50',
    glowColor: '#81C784',
    attackEffect: '💥',
  },
  {
    name: '末影人',
    icon: 'enderman',
    difficulty: 'medium',
    hearts: 2,
    color: '#1a1a2e',
    glowColor: '#8B5CF6',
    attackEffect: '👁️',
  },
  {
    name: '烈焰人',
    icon: 'blaze',
    difficulty: 'hard',
    hearts: 3,
    color: '#F59E0B',
    glowColor: '#FBBF24',
    attackEffect: '🔥',
  },
  {
    name: '凋零',
    icon: 'wither',
    difficulty: 'hard',
    hearts: 3,
    color: '#1C1917',
    glowColor: '#6B7280',
    attackEffect: '💀',
  },
  {
    name: '末影龙',
    icon: 'ender_dragon',
    difficulty: 'hard',
    hearts: 4,
    color: '#1C1917',
    glowColor: '#EC4899',
    attackEffect: '🐉',
  },
]

export const MINECRAFT_BOSS_REWARDS: Record<number, number> = {
  0: 0,
  1: 0,
  2: 0,
  3: 0,
  4: 6,
  5: 11,
  6: 15,
  7: 20,
  8: 24,
  9: 29,
  10: 38,
}

export interface HiddenModeUnlock {
  id: string
  studentId: string
  unlockedAt: string
  unlockedBy: { bossesDefeated: number; playerHearts: number }
}

// 皮肤解锁
export interface SkinUnlock {
  id: string
  studentId: string
  bossIcon: string // 哪个Boss的皮肤
  theme: HiddenTheme // 来自哪个隐藏主题
  unlockedAt: string
}

// 隐藏关卡主题
export type HiddenTheme = 'minecraft' | 'pvz' | 'tank'

// 植物大战僵尸 Boss
export const PVZ_BOSSES: MinecraftBossDef[] = [
  {
    name: '普通僵尸',
    icon: 'pvz_basic',
    difficulty: 'easy',
    hearts: 1,
    color: '#6B8E4E',
    glowColor: '#9ACD32',
    attackEffect: '🧟',
  },
  {
    name: '路障僵尸',
    icon: 'pvz_cone',
    difficulty: 'easy',
    hearts: 1,
    color: '#FF8C00',
    glowColor: '#FFA500',
    attackEffect: '🚧',
  },
  {
    name: '铁桶僵尸',
    icon: 'pvz_bucket',
    difficulty: 'medium',
    hearts: 2,
    color: '#808080',
    glowColor: '#A9A9A9',
    attackEffect: '🪣',
  },
  {
    name: '舞王僵尸',
    icon: 'pvz_disco',
    difficulty: 'medium',
    hearts: 2,
    color: '#FF1493',
    glowColor: '#FF69B4',
    attackEffect: '🕺',
  },
  {
    name: '橄榄球僵尸',
    icon: 'pvz_football',
    difficulty: 'hard',
    hearts: 3,
    color: '#8B0000',
    glowColor: '#DC143C',
    attackEffect: '🏈',
  },
  {
    name: '巨人僵尸',
    icon: 'pvz_gargantuar',
    difficulty: 'hard',
    hearts: 3,
    color: '#8B4513',
    glowColor: '#D2691E',
    attackEffect: '💪',
  },
  {
    name: '僵王博士',
    icon: 'pvz_zomboss',
    difficulty: 'hard',
    hearts: 4,
    color: '#4B0082',
    glowColor: '#8B00FF',
    attackEffect: '🤖',
  },
]

// 超级坦克 Boss（超能装甲兵团）
export const TANK_BOSSES: MinecraftBossDef[] = [
  {
    name: '黑熊坦克',
    icon: 'tank_darkbear',
    difficulty: 'easy',
    hearts: 1,
    color: '#1a1a2e',
    glowColor: '#EF4444',
    attackEffect: '💥',
  },
  {
    name: '小渣',
    icon: 'tank_xiaozha',
    difficulty: 'easy',
    hearts: 1,
    color: '#2D1B4E',
    glowColor: '#A855F7',
    attackEffect: '🌑',
  },
  {
    name: '希曼',
    icon: 'tank_sherman',
    difficulty: 'medium',
    hearts: 2,
    color: '#1E40AF',
    glowColor: '#60A5FA',
    attackEffect: '✨',
  },
  {
    name: '小半',
    icon: 'tank_xiaoban',
    difficulty: 'medium',
    hearts: 2,
    color: '#0E7490',
    glowColor: '#22D3EE',
    attackEffect: '⚡',
  },
  {
    name: '小绿',
    icon: 'tank_xiaolv',
    difficulty: 'hard',
    hearts: 3,
    color: '#166534',
    glowColor: '#4ADE80',
    attackEffect: '⏰',
  },
  {
    name: '朱古力',
    icon: 'tank_zhuguli',
    difficulty: 'hard',
    hearts: 3,
    color: '#78350F',
    glowColor: '#F59E0B',
    attackEffect: '🕳️',
  },
  {
    name: '大虎',
    icon: 'tank_dahu',
    difficulty: 'hard',
    hearts: 4,
    color: '#451A03',
    glowColor: '#F97316',
    attackEffect: '🐯',
  },
]

export const HIDDEN_BOSS_MAP: Record<HiddenTheme, MinecraftBossDef[]> = {
  minecraft: MINECRAFT_BOSSES,
  pvz: PVZ_BOSSES,
  tank: TANK_BOSSES,
}

export interface MathQuestion {
  a: number
  b: number
  operator: '+' | '-'
  answer: number
  difficulty: 'easy' | 'medium' | 'hard'
  // 隐藏模式字段
  mode?: 'hidden'
  blank?: 'a' | 'b' // 隐藏哪个数字
  result?: number // 等号右边的结果
}

export interface MathBossRecord {
  id: string
  studentId: string
  date: string // YYYY-MM-DD
  bossesDefeated: number
  totalQuestions: number
  correctCount: number
  reward: number // 获得积分
  createdAt: string
}

export interface CheckinRecord {
  id: string
  studentId: string
  date: string // YYYY-MM-DD
  createdAt: string
}

// ============ Toast ============
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  message: string
}

// ============ 存储 Key ============
export const STORAGE_KEYS = {
  USERS: 'app_users',
  TASKS: 'app_tasks',
  POINTS: 'app_points',
  VOUCHERS: 'app_vouchers',
  WITHDRAWS: 'app_withdraws',
  CURRENT_USER: 'app_currentUser',
  LOTTERY_RECORDS: 'app_lottery_records',
} as const
