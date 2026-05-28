# 大转盘恶搞奖品 + 超级大奖 - 任务计划

- [x] Task 1: 服务端 - 修改大转盘奖品配置与发奖逻辑
    - 1.1: WHEEL_SEGMENTS 改为带 weight/type 的对象数组（9 扇区）
    - 1.2: wheel 发奖改用 weightedRandom，返回 segmentIndex
    - 1.3: wheel 恶搞奖品不创建代金券，返回 jokeEmoji 和 type 字段
    - 1.4: 100 元大奖正常发放代金券，返回 type='money'

- [x] Task 2: LuckyWheel 组件 - 9 扇区配置与加权随机
    - 2.1: WheelPrize 接口扩展 type、emoji 字段
    - 2.2: 默认奖品配置更新为 9 扇区（含恶搞和 100 元）
    - 2.3: 转盘绘制适配 9 扇区，100 元扇区特殊高亮，恶搞扇区显示 👻
    - 2.4: handleSpin 使用加权随机选中奖扇区
    - 2.5: LotteryResult 调用传入 type、jokeEmoji、tier 字段

- [x] Task 3: LotteryResult 组件 - 超级大奖特殊动画
    - 3.1: LotteryResultProps 新增 tier 字段（'normal' | 'joke' | 'grand'）
    - 3.2: 超级大奖渲染：🏆 超级大奖！+ 金色彩纸 + 脉冲发光弹窗 + 文字弹跳
    - 3.3: LuckyBox 中调用 LotteryResult 时根据金额判断 tier

- [x] Task 4: CSS 样式 - 超级大奖动画效果
    - 4.1: 新增 .resultGrand* 系列样式（弹窗脉冲发光、金额弹跳缩放、图标旋转闪光）
    - 4.2: 金色彩纸颜色配置

- [x] Task 5: LotteryContext 与 LotteryPage - 配置同步
    - 5.1: LotteryContext 中 WHEEL_SEGMENTS 配置同步，spinWheel 返回类型扩展
    - 5.2: LotteryPage 中转盘 prizes 配置同步为 9 扇区

- [x] Task 6: 端到端验证
    - 6.1: TypeScript 类型检查通过
    - 6.2: 服务端语法检查通过
