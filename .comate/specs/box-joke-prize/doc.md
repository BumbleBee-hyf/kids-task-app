# 抽箱子恶搞奖品功能

## 需求场景

修改抽箱子的奖品池，将原来的 20 元奖品移除，新增"恶搞奖品"类别（10% 概率），同时将 10 元概率从 10% 降为 5%。

### 新奖品池

| 奖品                                       | 权重 | 概率 |
| ------------------------------------------ | ---- | ---- |
| 1 元代金券                                 | 35   | 35%  |
| 2 元代金券                                 | 30   | 30%  |
| 5 元代金券                                 | 20   | 20%  |
| 恶搞奖品（小苍蝇/💩/蛇/毛毛虫 随机四选一） | 10   | 10%  |
| 10 元代金券                                | 5    | 5%   |

恶搞奖品为 4 种等概率随机：

- 🪰 一只小苍蝇（2.5%）
- 💩 一坨💩（2.5%）
- 🐍 一条蛇（2.5%）
- 🐛 一条毛毛虫（2.5%）

期望值计算：(1×0.35) + (2×0.30) + (5×0.20) + (0×0.10) + (10×0.05) = 1.95 元/次

## 技术方案

### 核心设计：奖品类型区分

引入 `type` 字段区分普通奖品和恶搞奖品：

- `'money'`：金额类奖品，中奖后发放代金券
- `'joke'`：恶搞奖品，中奖后不发放代金券，仅展示搞笑结果

### 奖品数据结构

**服务端 BOX_PRIZES：**

```javascript
const BOX_PRIZES = [
  { amount: 1, weight: 35, type: 'money' },
  { amount: 2, weight: 30, type: 'money' },
  { amount: 5, weight: 20, type: 'money' },
  { amount: 0, weight: 10, type: 'joke' }, // 恶搞奖品
  { amount: 10, weight: 5, type: 'money' },
]

const JOKE_PRIZES = ['🪰', '💩', '🐍', '🐛']
```

**客户端 Prize 接口扩展：**

```typescript
interface Prize {
  id: string
  label: string
  amount: number
  weight: number
  color: string
  type: 'money' | 'joke' // 新增
  emoji?: string // 恶搞奖品专用
}
```

### 服务端发奖逻辑变更

当 `weightedRandom` 返回的奖品 `type === 'joke'` 时：

- 仍然扣除 10 积分
- **不创建代金券记录**
- 从 `JOKE_PRIZES` 中随机选一个返回
- 返回值增加 `jokeEmoji` 和 `type` 字段

```javascript
// 返回结构
{
  success: true,
  type: 'joke' | 'money',
  amount: prizeAmount,      // joke 时为 0
  jokeEmoji: '🐍',          // 仅 type=joke 时存在
  segmentIndex,
  pointBalance,
}
```

### 客户端展示逻辑变更

**LuckyBox 组件：**

- 恶搞奖品箱子显示在宝箱网格中，打开后展示对应 emoji
- 客户端随机选中恶搞奖品时，从 4 个 emoji 中随机选一个用于动画展示

**LotteryResult 组件：**

- 金钱奖品：显示"🎉 恭喜中奖！+{amount} 元代金券"（现有逻辑）
- 恶搞奖品：显示"😂 恶搞奖品！{emoji}"，不显示金额，彩纸效果改为特殊效果

## 涉及文件

| 文件                                | 修改类型 | 说明                                       |
| ----------------------------------- | -------- | ------------------------------------------ |
| `server/server.js`                  | 修改     | BOX_PRIZES 配置、发奖逻辑、返回结构        |
| `src/components/LuckyBox.tsx`       | 修改     | Prize 接口扩展、默认奖品配置、恶搞奖品展示 |
| `src/components/LotteryResult.tsx`  | 修改     | 支持恶搞奖品结果展示（不同 UI）            |
| `src/contexts/LotteryContext.tsx`   | 修改     | BOX_PRIZES 配置同步、返回类型扩展          |
| `src/pages/student/LotteryPage.tsx` | 修改     | 奖品配置同步                               |
| `src/services/storageService.ts`    | 修改     | draw 返回类型扩展                          |

## 数据流

1. 用户点击箱子 → 客户端加权随机选中某个奖品（含恶搞）
2. 客户端播放开箱动画（恶搞奖品展示随机 emoji）
3. 同时调用 `POST /api/lottery/draw` → 服务端独立加权随机
4. 服务端返回 `{ type, amount, jokeEmoji?, pointBalance }`
5. 客户端用**服务端结果**覆盖本地动画结果，展示最终弹窗
6. 如果是恶搞奖品，弹窗显示搞笑样式；如果是金钱奖品，弹窗显示代金券

## 边界条件

- 恶搞奖品不创建代金券记录，不影响提现逻辑
- 积分扣减对所有类型奖品一致（都是 -10）
- 客户端动画结果以服务端返回为准（修复原有的客户端/服务端不一致问题）
- 恶搞奖品 amount 为 0，不会出现在代金券列表中

## 预期结果

- 抽箱子奖品池按新配置生效
- 恶搞奖品展示为搞笑效果，不发放代金券
- 服务端和客户端概率完全一致
