# 任务积分乐园 (Kids Task App)

> 儿童日常任务管理积分系统 — 游戏化家务/学习任务追踪应用

## 项目概览

- **前端**: React 19 + TypeScript 6 + Vite 8 + CSS Modules
- **后端**: Node.js 原生 HTTP 服务器 + JSON 文件数据库 (`server/db.json`)
- **路由**: react-router-dom v7
- **游戏**: @play-kit/games (抽奖动画)、自研数学打Boss系统
- **部署**: Nginx 反向代理 (静态文件 + API)

## 项目结构

```
src/
  components/     可复用 UI 组件
  contexts/       React Context 状态管理 (Auth, Task, Points, Lottery, MathBoss, Voucher)
  pages/
    student/      学生端页面 (Dashboard, Task, Lottery, MathBoss, Voucher)
    parent/       家长端页面 (Dashboard, TaskManagement, Approval, LotteryConfig)
  services/       API 客户端层 (storageService.ts)
  styles/         CSS Modules + 全局样式
  types/          TypeScript 类型定义 + 常量
server/
  server.js       后端 HTTP 服务器 (1365行，所有路由和业务逻辑)
  db.json         JSON 文件数据库 (gitignored)
```

## 开发命令

```bash
npm run dev          # 前端开发服务器 (port 5173, 代理 /api -> :3001)
npm run server       # 后端服务器 (port 3001)
npm run dev:full     # 同时启动前后端 (concurrently)
npm run build        # TypeScript 检查 + Vite 生产构建
npm run lint         # ESLint 检查
npm run test         # 运行 Vitest 测试
npm run test:run     # 运行测试 (单次，不 watch)
npm run test:coverage # 运行测试并生成覆盖率报告
npm run format       # Prettier 格式化所有文件
npm run format:check # Prettier 格式检查 (CI 用)
npm run type-check   # TypeScript 类型检查
```

## 测试

- **框架**: Vitest + @testing-library/react + jsdom
- **配置**: `vitest.config.ts`
- **Setup**: `src/test/setup.ts` (jest-dom matchers)
- **前端测试**: `src/**/*.test.{ts,tsx}`
- **后端测试**: `server/**/*.test.{js,ts}` (集成测试，需启动 server)
- **运行**: `npm test` (watch mode) / `npm run test:run` (single run)

## 质量门禁 (CI)

GitHub Actions 在 PR 和 push to main 时自动运行:

1. **Lint**: ESLint 检查
2. **Type Check**: `tsc -b --noEmit`
3. **Format Check**: Prettier 格式检查
4. **Test**: Vitest 测试 + 覆盖率
5. **Build**: 生产构建验证

## Pre-commit Hooks

Husky + lint-staged 在 git commit 前自动运行:

- `*.{ts,tsx}`: ESLint --fix + Prettier --write
- `*.{json,css,md,html}`: Prettier --write

## 代码规范

- TypeScript 严格模式: `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`
- ESLint: `@eslint/js` recommended + `typescript-eslint` recommended + React Hooks
- Prettier: 无分号、单引号、尾逗号、100字符行宽
- CSS: CSS Modules (组件级) + 全局 CSS 变量 (`global.css`)

## 测试账号

| 用户名   | 密码 | 角色 |
| -------- | ---- | ---- |
| parent1  | 1234 | 家长 |
| student1 | 1234 | 学生 |

## 关键业务逻辑

- **任务**: 三种类型 (临时/每日/周期)，状态流: pending -> submitted -> approved/rejected
- **积分**: 签到(10分)、任务奖励(excellent=100%, good=80%)、数学打Boss阶梯奖励
- **抽奖**: 消耗积分，加权随机，发放代金券（恶搞奖品只发 emoji）
- **数学打Boss**: 10关阶梯难度，隐藏模式（通关10关且血量>3解锁），3个隐藏主题(我的世界/植物大战僵尸/坦克)
- **提现**: FIFO 代金券扣减

## 注意事项

- `server/db.json` 是 gitignored，首次运行 server 会自动创建含测试数据的数据库
- 后端无认证中间件，所有 API 无权限保护
- 密码明文存储（仅用于学习项目）
- 前端 API 基地址硬编码为 `/api`，通过 Vite proxy 转发
