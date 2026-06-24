# UI Redesign - 儿童任务积分乐园视觉升级任务计划

- [x] Task 1: 更新全局样式系统 (global.css)
  - 1.1: 替换 CSS 变量为全新糖果乐园配色（橙/绿/蓝主色、暖色背景）
  - 1.2: 更新按钮样式（圆角、渐变、hover/active 动效）
  - 1.3: 更新卡片样式（更大圆角、柔和阴影、彩色变体）
  - 1.4: 更新表单样式（输入框 focus ring、标签样式）
  - 1.5: 更新状态标签/Toast/空状态样式
  - 1.6: 更新动画关键帧（slideIn、fadeInUp、float、pulse）

- [x] Task 2: 更新布局与导航样式 (Layout.module.css)
  - 2.1: 侧边栏改为暖色背景（#FFF0E0），替换深色背景
  - 2.2: 更新导航链接样式（hover/active 态配色）
  - 2.3: 更新品牌头部和用户底部区域样式
  - 2.4: 更新滚动条颜色适配新主题
  - 2.5: 更新移动端顶部导航样式

- [x] Task 3: 更新登录注册页面样式 (Login.module.css)
  - 3.1: 背景改为暖橙到暖黄弥散渐变
  - 3.2: 添加漂浮装饰元素样式（圆形伪元素动画）
  - 3.3: 更新登录卡片样式（更大圆角、暖色边框、厚阴影）
  - 3.4: 更新角色选择器样式（选中态配色）
  - 3.5: 更新错误提示和底部提示样式

- [x] Task 4: 更新抽奖页面样式 (Lottery.module.css)
  - 4.1: 转盘外圈颜色由深灰改为棕色/橙色系
  - 4.2: 中心按钮改为橙色渐变主题
  - 4.3: 盲盒阴影和颜色微调适配新主题
  - 4.4: 结果弹窗更大圆角、更活泼动画

- [x] Task 5: 更新任务管理页面样式 (TaskManagement.module.css)
  - 5.1: 表格表头改为暖色背景
  - 5.2: 行 hover 改为暖色淡底
  - 5.3: 任务卡片增加左侧彩色状态条
  - 5.4: 审批评分按钮配色改为绿/蓝系

- [x] Task 6: 更新代金券页面样式 (Voucher.module.css)
  - 6.1: 余额卡片背景由紫色改为橙色渐变
  - 6.2: 更新提现审批卡片样式

- [x] Task 7: 清理组件内联样式并添加字体
  - 7.1: 在 index.html 引入 Nunito 字体
  - 7.2: 重写 StudentDashboard.tsx，提取所有内联 style 为 CSS 类
  - 7.3: 重写 ParentDashboard.tsx，提取所有内联 style 为 CSS 类
  - 7.4: 检查并清理 StudentTaskPage.tsx、LotteryPage.tsx、VoucherPage.tsx 中的内联样式
  - 7.5: 检查其他页面和组件的内联样式

- [x] Task 8: 验证与收尾
  - 8.1: 检查所有文件是否有语法错误
  - 8.2: 确认移动端响应式样式正常
  - 8.3: 确认 prefers-reduced-motion 支持完整
