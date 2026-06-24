# 大转盘恶搞奖品 + 超级大奖功能

## 需求场景

修改大转盘的奖品分布：

1. 将 20 元替换为恶搞奖品（🪰/💩/🐍/🐛 随机）
2. 新增 100 元超级大奖（0.5% 概率）
3. 服务端从均匀随机改为加权随机，与客户端保持一致

### 新奖品分布

| 奖品                     | 权重 | 概率  |
| ------------------------ | ---- | ----- |
| 1 元                     | 37   | 37%   |
| 2 元                     | 25   | 25%   |
| 5 元                     | 12.5 | 12.5% |
| 10 元                    | 12.5 | 12.5% |
| 恶搞（🪰/💩/🐍/🐛 随机） | 12.5 | 12.5% |
| 100 元                   | 0.5  | 0.5%  |

**合计**：37 + 25 + 12.5 + 12.5 + 12.5 + 0.5 = 100

### 转盘显示（9 个扇区）

转盘视觉展示 9 个扇区，指针停在哪个扇区由加权随机决定（非均匀），动画效果同抽箱子逻辑。

| 扇区 | 标签  | 金额 | 权重 | 颜色    |
| ---- | ----- | ---- | ---- | ------- |
| 0    | 100元 | 100  | 0.5  | #FF2D55 |
| 1    | 1元   | 1    | 37   | #FBBF24 |
| 2    | 2元   | 2    | 25   | #FCD34D |
| 3    | 1元   | 1    | 37   | #4ADE80 |
| 4    | 5元   | 5    | 12.5 | #2DD4BF |
| 5    | 恶搞  | 0    | 12.5 | #FB923C |
| 6    | 2元   | 2    | 25   | #818CF8 |
| 7    | 10元  | 10   | 12.5 | #A78BFA |
| 8    | 1元   | 1    | 37   | #38BDF8 |

注意：多个扇区显示相同金额是因为视觉上需要均匀分布扇区，实际中奖概率由权重决定。

## 技术方案

### 服务端变更

`WHEEL_SEGMENTS` 改为带权重和类型的对象数组，发奖逻辑改为加权随机：

```javascript
const WHEEL_SEGMENTS = [
  { amount: 100, weight: 0.5, type: 'money' },
  { amount: 1, weight: 37, type: 'money' },
  { amount: 2, weight: 25, type: 'money' },
  { amount: 1, weight: 37, type: 'money' },
  { amount: 5, weight: 12.5, type: 'money' },
  { amount: 0, weight: 12.5, type: 'joke' },
  { amount: 2, weight: 25, type: 'money' },
  { amount: 10, weight: 12.5, type: 'money' },
  { amount: 1, weight: 37, type: 'money' },
]
```

- wheel 发奖从 `Math.random() * length` 改为 `weightedRandom(WHEEL_SEGMENTS)`
- 返回值增加 `segmentIndex`（加权随机选中的索引）
- 恶搞奖品复用 `JOKE_PRIZES`，不创建代金券

### 超级大奖特殊动画

100 元超级大奖中奖时，LotteryResult 弹窗展示特殊的华丽效果，与普通金钱奖品和恶搞奖品区分：

**三层展示区分：**
| 奖品层级 | 弹窗标题 | 图标 | 金额文字 | 动画效果 |
|---|---|---|---|---|
| 普通金钱 | 🎉 恭喜中奖！ | 🎉 | +{amount} 元代金券 | 彩纸飘落 |
| 恶搞 | 😂 恶搞奖品！ | 😂 | emoji（🪰💩🐍🐛） | 彩纸飘落 |
| 超级大奖 | 🏆 超级大奖！ | 🏆 | +100 元代金券 | 金色彩纸 + 弹窗脉冲发光 + 文字缩放动画 |

**超级大奖动画细节：**

- 彩纸颜色改为金色系：`['#FFD700', '#FFA500', '#FF8C00', '#FFE4B5', '#F0E68C']`
- 弹窗添加脉冲发光效果（CSS animation: box-shadow 缩放 + 金色光晕）
- 金额文字添加缩放弹跳动画（CSS animation: scale 弹跳）
- 顶部图标 🏆 添加旋转闪光动画

**实现方式：**

- `LotteryResultProps` 新增 `tier: 'normal' | 'joke' | 'grand'` 字段
- 弹窗根据 `tier` 渲染不同样式
- `Lottery.module.css` 新增 `.resultGrand*` 系列样式

### 客户端变更

- `WheelPrize` 接口扩展 `type`、`emoji` 字段
- `LuckyWheel` 默认奖品配置更新为 9 扇区
- 转盘绘制逻辑适配 9 扇区
- 旋转动画使用加权随机确定中奖扇区
- 恶搞扇区展示特殊图标，100 元扇区特殊高亮
- `LotteryResult` 传入 `type`、`jokeEmoji`、`tier` 字段
- `LotteryContext` 和 `LotteryPage` 配置同步

## 涉及文件

| 文件                                | 修改类型 | 说明                                                                   |
| ----------------------------------- | -------- | ---------------------------------------------------------------------- |
| `server/server.js`                  | 修改     | WHEEL_SEGMENTS 改为对象数组，wheel 改用 weightedRandom，处理恶搞/100元 |
| `src/components/LuckyWheel.tsx`     | 修改     | WheelPrize 扩展，9 扇区配置，加权随机，恶搞/100元展示                  |
| `src/components/LotteryResult.tsx`  | 修改     | 新增 tier 字段，超级大奖特殊动画样式                                   |
| `src/styles/Lottery.module.css`     | 新增     | 超级大奖脉冲发光、文字弹跳、金色彩纸等样式                             |
| `src/contexts/LotteryContext.tsx`   | 修改     | WHEEL_SEGMENTS 配置同步，spinWheel 返回类型扩展                        |
| `src/pages/student/LotteryPage.tsx` | 修改     | 转盘 prizes 配置同步                                                   |

## 预期结果

- 大转盘按新加权分布运行
- 100 元超级大奖概率 0.5%，扇区在转盘上视觉可见
- 恶搞奖品概率 12.5%，不发放代金券
- 服务端和客户端使用相同加权随机算法，概率完全一致
- 超级大奖中奖时展示华丽金光动画，与普通奖品明显区分
