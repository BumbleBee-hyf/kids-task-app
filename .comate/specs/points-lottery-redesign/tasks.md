# 任务积分抽奖提现 - 逻辑重构任务计划

- [x] Task 1: 新增积分数据模型与类型定义
  - 1.1: 在 `types/index.ts` 中新增 PointRecord 接口和 PointSource 类型
  - 1.2: 修改 VoucherSource 类型，移除 `task_bonus`（保留兼容说明）
  - 1.3: 新增抽奖积分消耗常量 `LOTTERY_POINT_COST`

- [x] Task 2: 后端 - 新增积分 API 与修改审批逻辑
  - 2.1: 在 `server/db.json` 中新增 `points` 数组
  - 2.2: 新增 `GET /api/points/student/:id` 获取学生积分记录
  - 2.3: 新增 `GET /api/points/student/:id/balance` 获取学生积分余额
  - 2.4: 修改 `POST /api/tasks/:id/approve`，审批通过后创建积分记录而非代金券
  - 2.5: 修改 `POST /api/lottery/increment` 为 `POST /api/lottery/draw`，实现积分扣减 + 代金券发放逻辑

- [x] Task 3: 前端 - 新增积分上下文（PointsContext）
  - 3.1: 创建 `PointsContext.tsx`，包含积分余额、积分记录的获取方法
  - 3.2: 在 `App.tsx` 中注册 PointsContext Provider

- [x] Task 4: 前端 - 修改抽奖逻辑（LotteryContext & LotteryPage）
  - 4.1: 修改 `LotteryContext.tsx`，抽奖前校验积分余额，调用新 API `/api/lottery/draw`
  - 4.2: 移除每日免费次数相关逻辑（MAX_LOTTERY_PER_DAY 等）
  - 4.3: 修改 `LotteryPage.tsx`，展示积分余额、抽奖消耗提示、积分不足提示

- [x] Task 5: 前端 - 修改任务与代金券相关逻辑
  - 5.1: 修改 `TaskContext.tsx`，审批通过后刷新积分而非代金券
  - 5.2: 修改 `VoucherContext.tsx`，移除 task_bonus 相关逻辑，兼容历史数据
  - 5.3: 修改 `StudentDashboard.tsx`，展示积分余额（替代或补充原有余额）
  - 5.4: 修改 `LotteryCountCard.tsx`，改为展示积分余额和抽奖消耗信息
  - 5.5: 修改 `VoucherPage.tsx`，调整展示逻辑，增加积分明细入口

- [x] Task 6: 测试与数据兼容
  - 6.1: 验证完整链路：任务完成 → 获得积分 → 积分抽奖 → 获得代金券 → 提现
  - 6.2: 验证边界情况：积分不足抽奖、余额为0提现、历史 task_bonus 数据兼容
