# 任务积分抽奖提现 - 逻辑重构

## 需求场景

将现有的"任务直接给代金券"逻辑重构为三段式链路：

**完成任务 → 获得积分 → 消耗积分抽奖 → 抽奖获得代金券 → 代金券提现**

### 当前逻辑

- 完成任务 → 直接获得代金券（`source: 'task_bonus'`）
- 抽奖免费（每天5次上限）→ 获得代金券（`source: 'lottery'`）
- 代金券可提现

### 目标逻辑

- 完成任务 → 获得积分
- 消耗积分进行抽奖（取消每日免费次数限制，改为积分消耗）
- 抽奖获得代金券
- 代金券可提现（保持不变）

## 架构与技术方案

### 数据模型变更

#### 1. 新增积分（Points）模型

```ts
export type PointSource = 'task_reward' | 'admin_grant'
export interface PointRecord {
  id: string
  studentId: string
  amount: number // 正数为获得，负数为消耗
  source: PointSource // 来源
  description: string // 描述，如"完成任务：洗碗"
  relatedId?: string // 关联ID（任务ID等）
  createdAt: string
}
```

#### 2. 修改代金券（Voucher）来源

```ts
export type VoucherSource = 'lottery' | 'admin_grant'
// 移除 'task_bonus'，代金券只来源于抽奖或管理员发放
```

#### 3. 修改抽奖逻辑

- 新增抽奖消耗积分的配置（如：每次抽奖消耗 N 积分）
- 取消每日免费次数限制
- 增加积分不足的校验

#### 4. 数据库 db.json 新增字段

```json
{
  "points": [] // PointRecord[]
}
```

### API 变更

| 变更类型 | 端点                                  | 说明                                     |
| -------- | ------------------------------------- | ---------------------------------------- |
| 新增     | `GET /api/points/student/:id`         | 获取学生积分记录                         |
| 新增     | `GET /api/points/student/:id/balance` | 获取学生积分余额                         |
| 新增     | `POST /api/points`                    | 创建积分记录（内部调用）                 |
| 修改     | `POST /api/tasks/:id/approve`         | 审批任务后发放积分而非代金券             |
| 修改     | `POST /api/lottery/increment`         | 改为消耗积分进行抽奖                     |
| 修改     | `GET /api/lottery/today`              | 可移除或保留兼容                         |
| 删除     | 代金券不再由任务直接产生              | 移除审批时的 `task_bonus` 代金券创建逻辑 |

### 前端变更

#### 新增积分上下文（PointsContext）

- 管理积分余额、积分记录
- 提供 `fetchBalance`、`fetchRecords` 方法

#### 修改学生仪表板（StudentDashboard）

- 展示积分余额（替代或补充原有余额展示）
- 展示抽奖按钮（标注积分消耗）

#### 修改抽奖中心（LotteryPage）

- 显示当前积分余额
- 抽奖前校验积分是否足够
- 抽奖成功后扣减积分、展示获得的代金券

#### 修改我的钱包（VoucherPage）

- 保持代金券余额、提现功能不变
- 可选：增加积分明细入口

#### 修改审批逻辑（ApprovalForm / server）

- 审批通过时发放积分而非代金券

## 涉及文件

| 文件                                                   | 修改类型 | 说明                                                   |
| ------------------------------------------------------ | -------- | ------------------------------------------------------ |
| `kids-task-app/src/types/index.ts`                     | 修改     | 新增 PointRecord、PointSource 类型，修改 VoucherSource |
| `kids-task-app/server/db.json`                         | 修改     | 新增 `points` 数组，清理现有 `task_bonus` 代金券数据   |
| `kids-task-app/server/server.js`                       | 修改     | 新增积分 API，修改审批逻辑，修改抽奖逻辑               |
| `kids-task-app/src/contexts/PointsContext.tsx`         | 新增     | 积分上下文                                             |
| `kids-task-app/src/contexts/LotteryContext.tsx`        | 修改     | 抽奖消耗积分，移除每日免费次数逻辑                     |
| `kids-task-app/src/contexts/VoucherContext.tsx`        | 修改     | 移除 task_bonus 相关逻辑                               |
| `kids-task-app/src/contexts/TaskContext.tsx`           | 修改     | 审批通过后调用积分发放而非代金券                       |
| `kids-task-app/src/pages/student/StudentDashboard.tsx` | 修改     | 展示积分余额                                           |
| `kids-task-app/src/pages/student/LotteryPage.tsx`      | 修改     | 展示积分余额、抽奖消耗积分                             |
| `kids-task-app/src/pages/student/VoucherPage.tsx`      | 修改     | 调整展示逻辑                                           |
| `kids-task-app/src/components/LotteryCountCard.tsx`    | 修改     | 改为展示积分余额/抽奖消耗                              |
| `kids-task-app/src/App.tsx`                            | 修改     | 注册 PointsContext Provider                            |

## 实现细节

### 1. 抽奖积分消耗配置

```ts
// 每次抽奖消耗的积分数
const LOTTERY_POINT_COST = 10
```

### 2. 任务审批发放积分逻辑（server.js）

```js
// 原逻辑：审批通过后创建代金券
// 新逻辑：审批通过后创建积分记录
if (finalPoints > 0) {
  db.points.push({
    id: generateId(),
    studentId: task.studentId,
    amount: finalPoints,
    source: 'task_reward',
    description: `完成任务：${task.name}`,
    relatedId: task.id,
    createdAt: now(),
  })
}
```

### 3. 抽奖消耗积分逻辑（server.js）

```js
// 原逻辑：检查每日免费次数
// 新逻辑：检查积分余额是否足够
const balance = db.points
  .filter((p) => p.studentId === studentId)
  .reduce((sum, p) => sum + p.amount, 0)

if (balance < LOTTERY_POINT_COST) {
  return res.status(400).json({ error: '积分不足' })
}

// 扣减积分
db.points.push({
  id: generateId(),
  studentId,
  amount: -LOTTERY_POINT_COST,
  source: 'task_reward', // 或新增 'lottery_cost' 来源
  description: '抽奖消耗',
  createdAt: now(),
})

// 发放代金券
db.vouchers.push({
  id: generateId(),
  studentId,
  amount: prizeAmount,
  source: 'lottery',
  createdAt: now(),
})
```

### 4. 积分来源类型补充

```ts
export type PointSource = 'task_reward' | 'lottery_cost' | 'admin_grant'
// task_reward: 任务奖励（正数）
// lottery_cost: 抽奖消耗（负数）
// admin_grant: 管理员发放（正数）
```

## 边界条件与异常处理

1. **积分不足时抽奖** → 前端禁用抽奖按钮 + 后端返回 400 错误
2. **并发抽奖** → JSON 文件存储无事务，需在 server 端做余额校验后再扣减
3. **数据迁移** → 现有 `task_bonus` 类型的代金券记录需保留（历史数据），但新增的不再产生
4. **积分余额计算** → 对该学生所有积分记录求和（正负相抵），需考虑性能（可缓存）
5. **代金券来源校验** → 移除 `task_bonus` 后，前端需兼容历史数据中已有的 `task_bonus` 记录

## 数据流路径

```
任务审批通过 → server 创建 PointRecord(source: task_reward, amount: +N)
            → 前端刷新积分余额

学生点击抽奖 → 前端校验积分余额 ≥ LOTTERY_POINT_COST
            → POST /api/lottery/draw (携带 studentId)
            → server 校验余额 → 扣减积分 → 随机奖品 → 创建代金券
            → 返回奖品信息
            → 前端展示抽奖结果 + 刷新积分余额 + 刷新代金券余额

学生提现 → 代金券余额校验 → 提现申请 → 家长审批 → FIFO 扣减代金券
```

## 预期结果

1. 完成任务后学生获得积分（而非代金券）
2. 学生可在抽奖中心用积分抽奖
3. 抽奖获得代金券（金额按概率分布）
4. 代金券可提现（逻辑不变）
5. 积分不足时无法抽奖
6. 旧数据中的 `task_bonus` 代金券保留，不影响历史记录
