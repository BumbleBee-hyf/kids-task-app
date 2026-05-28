# 抽箱子恶搞奖品 - 完成总结

## 变更概要

修改抽箱子的奖品池，新增"恶搞奖品"类别，移除 20 元奖品，降低 10 元概率。

### 新奖品池

| 奖品 | 权重 | 概率 |
|---|---|---|
| 1 元代金券 | 35 | 35% |
| 2 元代金券 | 30 | 30% |
| 5 元代金券 | 20 | 20% |
| 恶搞奖品（🪰/💩/🐍/🐛 随机） | 10 | 10% |
| 10 元代金券 | 5 | 5% |

## 修改文件清单

| 文件 | 修改内容 |
|---|---|
| `server/server.js` | BOX_PRIZES 新增 type 字段和恶搞奖品配置，新增 JOKE_PRIZES 常量，weightedRandom 返回完整对象，发奖逻辑：恶搞奖品不创建代金券，返回 type/jokeEmoji 字段 |
| `src/services/storageService.ts` | draw 返回类型新增 type、jokeEmoji 字段 |
| `src/contexts/LotteryContext.tsx` | BOX_PRIZES 配置同步，drawBox 返回类型扩展，传递 type/jokeEmoji |
| `src/components/LuckyBox.tsx` | Prize 接口新增 type/emoji 字段，DEFAULT_PRIZES 更新，开箱时恶搞奖品随机选 emoji，箱子图标区分金钱/恶搞，LotteryResult 调用传参扩展 |
| `src/components/LotteryResult.tsx` | Props 新增 type/jokeEmoji，区分金钱（🎉 + 金额）和恶搞（😂 + emoji）两种展示样式 |
| `src/pages/student/LotteryPage.tsx` | LuckyBox prizes 配置同步为新奖品池 |

## 核心设计决策

- **恶搞奖品不发放代金券**：`type === 'joke'` 时跳过 Voucher 创建，不影响提现逻辑
- **积分扣减统一**：无论金钱还是恶搞奖品，都扣除 10 积分
- **客户端/服务端配置一致**：三处 BOX_PRIZES 配置（server.js、LuckyBox.tsx、LotteryContext.tsx）已同步
- **TypeScript 类型检查通过**，服务端语法检查通过
