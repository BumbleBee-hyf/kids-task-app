# 任务积分抽奖提现 - 逻辑重构总结

## 改动概述

将业务逻辑从「任务直接给代金券 → 免费抽奖 → 提现」重构为「任务给积分 → 积分抽奖 → 抽奖得代金券 → 提现」的三段式链路。

## 修改文件清单

### 后端
| 文件 | 变更 |
|------|------|
| `server/server.js` | 新增积分 API（4个端点）、修改审批逻辑（发积分而非代金券）、新增抽奖 draw API（积分扣减+代金券发放）、保留旧 lottery/increment 兼容 |
| `server/db.json` | 新增 `points` 数组，清理旧代金券数据 |

### 前端 - 类型与服务
| 文件 | 变更 |
|------|------|
| `src/types/index.ts` | 新增 PointRecord、PointSource 类型、LOTTERY_POINT_COST 常量、POINTS 存储 Key |
| `src/services/storageService.ts` | 新增 pointStorage（4个方法）、lotteryStorage.draw 方法 |

### 前端 - 上下文
| 文件 | 变更 |
|------|------|
| `src/contexts/PointsContext.tsx` | **新建** - 积分余额、积分记录管理 |
| `src/contexts/LotteryContext.tsx` | 重写 - 移除免费次数逻辑，改为积分消耗模式 |
| `src/contexts/VoucherContext.tsx` | 未改动（逻辑不变，兼容 task_bonus 历史数据） |
| `src/contexts/TaskContext.tsx` | 未改动（审批后积分发放由后端处理） |

### 前端 - 页面与组件
| 文件 | 变更 |
|------|------|
| `src/App.tsx` | 注册 PointsProvider |
| `src/pages/student/StudentDashboard.tsx` | 展示积分余额 + 代金券余额（原代金券余额改为积分余额卡片） |
| `src/pages/student/LotteryPage.tsx` | 使用积分校验、调用新 draw API、积分不足时禁用 |
| `src/pages/student/VoucherPage.tsx` | 新增积分/代金券双余额展示、积分明细 Tab、兼容 task_bonus 历史数据 |
| `src/components/LotteryCountCard.tsx` | 重写为展示积分余额、可抽奖次数、每次消耗积分数 |
| `src/components/LuckyBox.tsx` | 提示文案改为"积分不足" |
| `src/components/LuckyWheel.tsx` | 规则文案改为"每次抽奖消耗10积分" |

## 核心业务链路

```
任务审批通过 → server 创建 PointRecord(source: task_reward, amount: +N)
             → 前端展示积分余额增加

学生点击抽奖 → 前端校验积分余额 >= 10
             → POST /api/lottery/draw (studentId, type)
             → server 校验余额 → 扣减积分(-10) → 随机奖品 → 创建代金券
             → 前端展示结果 + 刷新积分余额 + 刷新代金券余额

学生提现 → 代金券余额校验 → 提现申请 → 家长审批 → FIFO 扣减代金券（不变）
```

## 关键配置

- `LOTTERY_POINT_COST = 10`：每次抽奖消耗 10 积分（定义在 `types/index.ts` 和 `server.js`）

## 兼容性

- VoucherSource 保留了 `task_bonus`，历史数据中的 task_bonus 代金券可正常显示
- 旧的 `/api/lottery/increment` 接口保留，但不再被前端主动调用
- 数据库新增 `points` 数组，初始化为空
