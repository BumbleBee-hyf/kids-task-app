# 抽箱子恶搞奖品 - 任务计划

- [x] Task 1: 服务端 - 修改抽箱子奖品配置与发奖逻辑
    - 1.1: 更新 BOX_PRIZES 配置（新增 type 字段，移除 20 元，新增恶搞奖品，调整 10 元权重为 5）
    - 1.2: 新增 JOKE_PRIZES 常量（4 个恶搞 emoji）
    - 1.3: 修改 weightedRandom 返回完整奖品对象（含 type 字段）而非仅 amount
    - 1.4: 修改 /api/lottery/draw 端点：恶搞奖品不创建代金券，返回 jokeEmoji 和 type 字段

- [x] Task 2: 客户端类型与接口 - 扩展 Prize 类型和 API 返回类型
    - 2.1: LuckyBox.tsx 中扩展 Prize 接口（新增 type、emoji 字段）
    - 2.2: 更新 DEFAULT_PRIZES 配置与新奖品池一致
    - 2.3: storageService.ts 中扩展 draw 返回类型（type、jokeEmoji 字段）
    - 2.4: LotteryContext.tsx 中更新 BOX_PRIZES 配置与返回类型

- [x] Task 3: LuckyBox 组件 - 支持恶搞奖品展示
    - 3.1: 修改 weightedRandom 和开箱逻辑，恶搞奖品随机选择 emoji 展示
    - 3.2: 开箱后以服务端返回结果为准（修复客户端/服务端不一致）

- [x] Task 4: LotteryResult 组件 - 区分金钱/恶搞奖品展示
    - 4.1: 扩展 LotteryResultProps（新增 type、jokeEmoji 字段）
    - 4.2: 恶搞奖品：显示搞笑标题和 emoji，不显示金额
    - 4.3: 恶搞奖品：替换彩纸效果为适合的视觉风格

- [x] Task 5: LotteryPage 页面 - 同步奖品配置
    - 5.1: 更新传给 LuckyBox 的 prizes 列表为新奖品池
    - 5.2: 适配 onWin 回调，传递完整服务端结果（含 type、jokeEmoji）给 LotteryResult

- [x] Task 6: 端到端验证
    - 6.1: 启动服务端和客户端，验证抽箱子各奖品概率分布
    - 6.2: 验证恶搞奖品不生成代金券记录
    - 6.3: 验证积分扣减正常、余额显示正确
