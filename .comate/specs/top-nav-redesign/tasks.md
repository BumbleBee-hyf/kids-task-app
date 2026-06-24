# 顶部导航栏重构任务计划

- [x] Task 1: 重写全局样式，新增顶部导航和首页组件工具类
  - 1.1: 在 global.css 中新增 `.top-navbar`、`.navbar-brand`、`.navbar-nav`、`.nav-item`、`.navbar-user` 等导航栏工具类
  - 1.2: 新增 `.welcome-card`、`.welcome-avatar`、`.welcome-greeting`、`.welcome-subtitle`、`.welcome-checkin` 欢迎卡片样式
  - 1.3: 新增 `.stat-card-arrow`、`.stat-card-icon`、`.stat-card-value`、`.stat-card-label` 统计卡片样式
  - 1.4: 新增 `.page-header-bar`、`.page-header-title`、`.page-header-action` 页面标题栏样式
  - 1.5: 更新 `.page-container` 为无侧边栏 margin 的全宽布局

- [x] Task 2: 重写布局导航样式 (Layout.module.css)
  - 2.1: 移除侧边栏样式，重写为顶部导航栏样式
  - 2.2: 品牌区（emoji + 名称 + 标语）样式
  - 2.3: 导航项（图标 + 文字 + active 下划线指示器）样式
  - 2.4: 用户区（头像 + 名称 + 下拉箭头）样式
  - 2.5: 主内容区移除左侧 margin，增加顶部 padding
  - 2.6: 移动端导航栏适配（精简版）

- [x] Task 3: 重写学生端布局组件 (StudentLayout.tsx)
  - 3.1: 将 aside 侧边栏改为顶部 nav 导航栏结构
  - 3.2: 品牌区使用 emoji + "学生中心" + 标语
  - 3.3: 导航项：首页、我的任务、抽奖中心、我的钱包
  - 3.4: 用户区：头像 + displayName + 下拉退出
  - 3.5: 主内容区直接使用 Outlet

- [x] Task 4: 重写家长端布局组件 (ParentLayout.tsx)
  - 4.1: 同样的顶部导航结构
  - 4.2: 品牌区："家长中心" + "陪伴成长 · 见证进步"
  - 4.3: 导航项：首页、任务管理、审批中心
  - 4.4: 用户区：头像 + displayName + 下拉退出

- [x] Task 5: 重写学生首页 (StudentDashboard.tsx)
  - 5.1: 添加欢迎卡片（头像 + 问候语 + 连续签到 mock）
  - 5.2: 页面标题栏（"🏠 学生首页" + "签到领积分" 按钮）
  - 5.3: 三个统计卡片（待完成/余额/抽奖）带箭头
  - 5.4: 今日统计卡片（已提交 | 已通过 | 今日积分）
  - 5.5: CTA 按钮（去做任务 / 去抽奖）

- [x] Task 6: 重写家长首页 (ParentDashboard.tsx)
  - 6.1: 添加欢迎卡片（头像 + 问候语）
  - 6.2: 页面标题栏（"🏠 家长首页"）
  - 6.3: 三个统计卡片（已发布/待审批/今日审批）带箭头
  - 6.4: 今日统计区域
  - 6.5: CTA 按钮（管理任务 / 去审批）

- [x] Task 7: 验证与移动端适配
  - 7.1: 检查所有页面在不同屏幕尺寸下的显示效果
  - 7.2: 移动端导航栏精简（隐藏标语、导航只留 emoji）
  - 7.3: 移动端欢迎卡片和统计卡片堆叠适配
  - 7.4: npm run build 验证无编译错误
