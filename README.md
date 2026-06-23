# 任务积分乐园 - 儿童每日任务管理系统

一个给小朋友每日任务打卡获取积分、抽取代金券的互动应用，家长可以发布任务并审批。

## 功能介绍

### 两种角色

| 角色 | 说明 |
|------|------|
| 小朋友（Student） | 查看任务、提交完成、签到领积分、数学打怪、抽奖、提现代金券 |
| 家长（Parent） | 发布/管理任务、审批任务完成情况、配置抽奖概率、审批提现请求 |

### 核心功能

**任务管理**
- 支持三种任务类型：临时任务、每日任务、周期任务（按星期几重复）
- 每日/周期任务每天自动生成，未完成的昨日任务自动清理
- 任务流转：待完成 → 已提交 → 已通过/已驳回
- 审批时可选评级：优秀（100%积分）、良好（80%积分）

**积分体系**
- 完成任务经家长审批后获得积分
- 每日签到获得 10 积分，需先完成至少一项任务才能签到
- 支持连续签到天数统计
- 数学打怪消耗 10 积分/次，抽奖消耗 10 积分/次

**数学打怪 ⚔️**
- 消耗积分入场挑战，每日限 2 次
- 普通模式：10 关失落城堡暗黑奇幻 Boss，从骷髅兵到黑暗魔王逐级递增
- 三种难度题型：简单（不进位加/不退位减）、中等（进位加/混合）、困难（退位减/进位加退位减）
- 连击系统：连续答对积累连击，3 连击解锁「暗影突刺」（-2❤️），5 连击解锁「升龙斩」（-3❤️）
- 后期 Boss（第 8-10 关）答错扣 2 颗心
- 通关 7 关以上解锁隐藏关卡

**隐藏关卡 🌀**
- 三个主题：我的世界 🌀、植物大战僵尸 🌻、超能装甲兵团 🔫
- 每个主题 7 个专属 Boss（僵尸→末影龙、普通僵尸→僵王博士、黑熊坦克→大虎）
- 填空题模式：算式中隐藏一个数字，需填入正确答案
- 每日限 2 次，独立消耗积分入场
- 通关可获得 Boss 皮肤，替换战斗形象

**抽奖中心 🎰**
- 抽箱子：随机礼盒开启，有机会获得代金券或恶搞表情
- 大转盘：9 格旋转轮盘，最高可中 100 元大奖
- 家长可在后台自定义奖品概率和积分消耗

**代金券与提现**
- 抽奖获得的代金券自动存入钱包
- 小朋友可发起提现请求，家长审批后按 FIFO 顺序扣减代金券

## 项目结构

```
kids-task-app/
├── src/
│   ├── components/        # 通用组件
│   │   ├── BossAvatar     # Boss 头像渲染（SVG）
│   │   ├── HeroAvatar     # 玩家英雄头像
│   │   ├── LuckyBox       # 抽箱子游戏
│   │   ├── LuckyWheel     # 大转盘游戏
│   │   ├── TaskCard       # 任务卡片
│   │   ├── TaskForm       # 任务创建表单
│   │   ├── ApprovalForm   # 审批表单
│   │   ├── WithdrawForm   # 提现申请表单
│   │   └── ...
│   ├── contexts/          # React Context 状态管理
│   │   ├── AuthContext     # 登录认证
│   │   ├── TaskContext     # 任务数据
│   │   ├── PointsContext   # 积分数据
│   │   ├── VoucherContext  # 代金券数据
│   │   ├── LotteryContext  # 抽奖数据
│   │   └── MathBossContext # 数学打怪游戏状态
│   ├── pages/
│   │   ├── student/       # 学生端页面
│   │   │   ├── StudentDashboard  # 首页（统计+签到）
│   │   │   ├── StudentTaskPage   # 任务列表
│   │   │   ├── MathBossPage      # 数学打怪
│   │   │   ├── LotteryPage       # 抽奖中心
│   │   │   └── VoucherPage       # 钱包（代金券+积分记录）
│   │   └── parent/        # 家长端页面
│   │       ├── ParentDashboard   # 首页（统计）
│   │       ├── TaskManagementPage # 任务管理
│   │       ├── ApprovalPage      # 审批中心
│   │       └── LotteryConfigPage # 抽奖概率配置
│   ├── services/          # API 服务层
│   ├── styles/            # CSS 模块样式
│   └── types/             # TypeScript 类型定义
├── server/
│   ├── server.js          # Node.js 后端服务
│   └── db.json            # JSON 文件数据库
├── nginx.conf             # Nginx 反向代理配置
└── package.json
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装与启动

```bash
# 安装依赖
npm install

# 启动开发环境（前端 + 后端同时运行）
npm run dev:full
```

启动后访问 http://localhost:5173

### 测试账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 家长 | parent1 | 1234 |
| 小朋友 | student1 | 1234 |

## 其他命令

```bash
# 仅启动前端开发服务器
npm run dev

# 仅启动后端 API 服务
npm run server

# 生产构建
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

## 生产部署

1. 构建前端：`npm run build`，生成 `dist/` 目录
2. 启动后端：`node server/server.js`（默认端口 3001）
3. 使用 nginx 反向代理，参考项目中的 `nginx.conf`
4. ⚠️ **不要覆盖服务器上已有的 `server/db.json`**，否则用户数据会丢失

## 技术栈

- **前端**：React 19 + TypeScript + Vite + React Router
- **后端**：Node.js 原生 HTTP 服务（无框架依赖）
- **数据存储**：JSON 文件（server/db.json）
- **游戏组件**：@play-kit/games（抽奖动画）
