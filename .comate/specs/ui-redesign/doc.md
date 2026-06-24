# UI redesign - 儿童任务积分乐园视觉升级方案

## 1. 项目背景与现状分析

当前 `kids-task-app` 是一个面向儿童的每日任务积分与奖励系统，使用 React + TypeScript + Vite 构建。现有 UI 存在以下核心问题：

| 问题类别         | 具体表现                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------ |
| **色彩沉闷**     | 主色为冷紫色(#6366F1)，侧边栏深灰(#1E293B)，整体色调偏成人商务风，缺乏儿童产品应有的活泼感 |
| **童趣元素不足** | 仅有 emoji 点缀，缺少圆角、柔和渐变、卡通化卡片等儿童友好设计                              |
| **代码维护性差** | 大量内联 `style={{...}}` 分散在各组件中，难以统一调整                                      |
| **视觉层次弱**   | 页面信息密度不均，重点不突出，卡片 hover 效果单一                                          |
| **移动端粗糙**   | 部分页面移动端适配不够精细，如转盘抽奖在窄屏下尺寸未做合理缩放                             |

## 2. 设计目标

打造一套 **"温暖、活泼、可信赖"** 的儿童任务激励系统视觉风格：

- **温暖**：使用暖黄、暖绿、天蓝为主色，传递积极向上的情绪
- **活泼**：大圆角、柔和阴影、微动效，贴合儿童审美
- **可信赖**：清晰的信息层级、统一的组件规范、良好的可用性

## 3. 设计系统 (Design System)

### 3.1 色彩系统

采用全新的 **"糖果乐园"** 配色方案，以暖色为主，冷暖搭配：

```css
:root {
  /* === 主色板 - 活泼糖果色 === */
  --color-primary: #ff8c42; /* 活力橙 - 主按钮、强调 */
  --color-primary-light: #ffb380; /* 浅橙 - hover、轻强调 */
  --color-primary-dark: #e66a20; /* 深橙 - active */

  --color-secondary: #4ade80; /* 嫩芽绿 - 成功、正向操作 */
  --color-secondary-light: #86efac; /* 浅绿 */
  --color-secondary-dark: #22c55e; /* 深绿 */

  --color-accent: #38bdf8; /* 天空蓝 - 信息、辅助 */
  --color-accent-light: #7dd3fc; /* 浅蓝 */
  --color-accent-dark: #0ea5e9; /* 深蓝 */

  /* 功能色 */
  --color-success: #4ade80;
  --color-warning: #fbbf24; /* 金黄 */
  --color-error: #fb7185; /* 柔和红 */
  --color-info: #38bdf8;

  /* 背景色 - 更温暖的米白/奶油色 */
  --bg-page: #fff8f0; /* 奶油白 */
  --bg-card: #ffffff;
  --bg-sidebar: #fff0e0; /* 暖色侧边栏背景 */
  --bg-elevated: #fff5eb;
  --bg-warm: #ffecd2; /* 暖色区块背景 */

  /* 文字色 - 降低对比度，更柔和 */
  --text-primary: #2d2a26; /* 暖黑 */
  --text-secondary: #6b6560; /* 暖灰 */
  --text-muted: #a8a29e; /* 浅暖灰 */
  --text-inverse: #ffffff;

  /* 边框与装饰 */
  --border-color: #fde8d0; /* 暖色边框 */
  --border-radius-xl: 24px; /* 卡片圆角 */
  --border-radius-lg: 16px; /* 大按钮/弹窗 */
  --border-radius-md: 12px; /* 普通按钮/输入框 */
  --border-radius-sm: 8px; /* 小标签 */
  --border-radius-full: 9999px; /* 圆形 */

  /* 阴影 - 更柔和的弥散阴影 */
  --shadow-sm: 0 2px 6px rgba(255, 140, 66, 0.06);
  --shadow-md: 0 4px 16px rgba(255, 140, 66, 0.1);
  --shadow-lg: 0 8px 30px rgba(255, 140, 66, 0.14);
  --shadow-xl: 0 16px 48px rgba(255, 140, 66, 0.18);
  --shadow-colored: 0 6px 20px rgba(255, 140, 66, 0.25);
}
```

**配色原则**：

- 橙色代表"行动与奖励"，用于主按钮、积分显示
- 绿色代表"成长与完成"，用于成功状态、任务完成
- 蓝色代表"信息与帮助"，用于提示、辅助信息
- 背景使用暖米白色，避免纯白刺眼

### 3.2 字体系统

```css
--font-family:
  'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei',
  sans-serif;

--font-size-xs: 0.75rem; /* 12px - 辅助文字 */
--font-size-sm: 0.875rem; /* 14px - 次要信息 */
--font-size-md: 1rem; /* 16px - 正文 */
--font-size-lg: 1.25rem; /* 20px - 小标题 */
--font-size-xl: 1.5rem; /* 24px - 页面标题 */
--font-size-2xl: 2rem; /* 32px - 大标题/数字 */
--font-size-3xl: 2.5rem; /* 40px - 大数字/余额 */
```

**设计说明**：

- 引入 Google Fonts 的 `Nunito`（圆角无衬线字体），更加儿童友好
- 中文字体使用系统默认，保证加载速度
- 大数字使用更粗的字重(800)，强调积分、余额等关键数据

### 3.3 间距系统

保持现有间距体系，微调增大呼吸感：

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
--spacing-3xl: 64px;
```

## 4. 全局组件样式改造

### 4.1 按钮 (Button)

全新按钮样式，更圆润、更有质感：

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: 12px 28px;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  font-weight: 700;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.02em;
}

/* 主按钮 - 橙色渐变 */
.btn-primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 140, 66, 0.35);
}
.btn-primary:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 24px rgba(255, 140, 66, 0.45);
}
.btn-primary:active {
  transform: translateY(0) scale(0.98);
}

/* 次要按钮 - 绿色 */
.btn-secondary {
  background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-dark) 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(74, 222, 128, 0.35);
}

/* 轮廓按钮 */
.btn-outline {
  background: white;
  border-color: var(--border-color);
  color: var(--text-secondary);
}
.btn-outline:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: rgba(255, 140, 66, 0.06);
  transform: translateY(-2px);
}

/* 大按钮 - 用于首页CTA */
.btn-lg {
  padding: 16px 36px;
  font-size: var(--font-size-lg);
  border-radius: var(--border-radius-lg);
}

/* 小按钮 */
.btn-sm {
  padding: 8px 18px;
  font-size: var(--font-size-sm);
}

/* 禁用状态 */
.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none !important;
  filter: grayscale(0.5);
}
```

### 4.2 卡片 (Card)

全新卡片设计，更大圆角、更柔和阴影：

```css
.card {
  background: var(--bg-card);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
  border: 1px solid var(--border-color);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

/* 彩色卡片变体 - 用于统计/强调 */
.card-orange {
  background: linear-gradient(135deg, #fff5eb 0%, #ffedd5 100%);
  border-color: #fed7aa;
}

.card-green {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: #bbf7d0;
}

.card-blue {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-color: #bae6fd;
}
```

### 4.3 表单输入 (Input)

更圆润、更友好的输入框：

```css
.form-input {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  transition: all 0.2s ease;
  background: white;
  color: var(--text-primary);
}

.form-input:focus {
  border-color: var(--color-primary-light);
  box-shadow: 0 0 0 4px rgba(255, 140, 66, 0.12);
}

.form-input::placeholder {
  color: var(--text-muted);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 700;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}
```

### 4.4 状态标签 (Badge)

圆角药丸形状，更活泼：

```css
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-xs);
  font-weight: 700;
  letter-spacing: 0.02em;
}

.status-pending {
  background: #fef3c7;
  color: #b45309;
}
.status-submitted {
  background: #dbeafe;
  color: #1d4ed8;
}
.status-approved {
  background: #dcfce7;
  color: #15803d;
}
.status-rejected {
  background: #fee2e2;
  color: #b91c1c;
}
```

### 4.5 Toast 提示

圆角、带图标、更柔和：

```css
.toast {
  padding: 16px 28px;
  border-radius: var(--border-radius-lg);
  color: white;
  font-weight: 700;
  box-shadow: var(--shadow-lg);
  animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.toast-success {
  background: rgba(74, 222, 128, 0.95);
}
.toast-error {
  background: rgba(251, 113, 133, 0.95);
}
.toast-warning {
  background: rgba(251, 191, 36, 0.95);
}
.toast-info {
  background: rgba(56, 189, 248, 0.95);
}
```

## 5. 页面级设计改造

### 5.1 登录/注册页面 (LoginPage / RegisterPage)

**现状问题**：

- 背景是紫色渐变，太冷
- 卡片圆角 20px 但无 border，显得单薄
- emoji 浮动动画单一

**改造方案**：

- **背景**：改为暖橙到暖黄的弥散渐变，加入漂浮的几何形状装饰（圆形、星星）
- **卡片**：更大圆角(24px)，加暖色边框，更厚的阴影
- **输入框**：橙色 focus ring
- **角色选择**：更明显的选中态，橙色边框 + 浅橙背景
- **动画**：emoji 浮动 + 装饰元素缓慢漂浮

```css
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fff5eb 0%, #ffedd5 30%, #fde68a 100%);
  padding: var(--spacing-md);
  position: relative;
  overflow: hidden;
}

/* 漂浮装饰 */
.login-page::before,
.login-page::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  opacity: 0.15;
  animation: float 8s ease-in-out infinite;
}
.login-page::before {
  width: 300px;
  height: 300px;
  background: var(--color-primary);
  top: -100px;
  right: -50px;
}
.login-page::after {
  width: 200px;
  height: 200px;
  background: var(--color-secondary);
  bottom: -50px;
  left: -30px;
  animation-delay: -4s;
}

.login-card {
  width: 100%;
  max-width: 440px;
  padding: var(--spacing-2xl);
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(24px);
  border: 2px solid rgba(255, 140, 66, 0.15);
  box-shadow: 0 24px 60px rgba(255, 140, 66, 0.15);
  border-radius: var(--border-radius-xl);
}
```

### 5.2 侧边栏布局 (Layout)

**现状问题**：

- 侧边栏是深灰色(#1E293B)，与暖色主题冲突
- 导航选中态是紫色渐变，与整体不协调
- 移动端顶部导航过于紧凑

**改造方案**：

- **侧边栏背景**：改为奶油色(#FFF0E0)，搭配橙色品牌色
- **导航链接**：默认暖灰色，hover 浅橙背景，选中态橙色渐变 + 白色文字
- **用户区域**：增加头像占位（圆形 + 渐变背景）
- **品牌区**：更大的 emoji + 品牌名，更突出
- **移动端**：顶部导航改为圆角药丸形状，可横向滚动

```css
.sidebar {
  width: 260px;
  background: var(--bg-sidebar);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
  box-shadow: 4px 0 24px rgba(255, 140, 66, 0.08);
  border-right: 1px solid var(--border-color);
}

.sidebar-header {
  padding: var(--spacing-xl) var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
}

.sidebar-header h2 {
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  font-weight: 800;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 12px 16px;
  border-radius: var(--border-radius-md);
  color: var(--text-secondary);
  font-weight: 700;
  font-size: var(--font-size-md);
  transition: all 0.2s ease;
  text-decoration: none;
  margin: 2px 8px;
}

.nav-link:hover {
  background: rgba(255, 140, 66, 0.08);
  color: var(--color-primary);
  transform: translateX(3px);
}

.nav-link.active {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: white;
  box-shadow: 0 4px 12px rgba(255, 140, 66, 0.35);
}
```

### 5.3 学生首页 Dashboard

**现状问题**：

- 大量内联样式
- 三个统计卡片样式完全一致，没有区分度
- 今日统计区域过于朴素
- 底部按钮不够醒目

**改造方案**：

- **统计卡片**：使用彩色卡片变体（card-orange、card-blue、card-green），每个卡片有不同主题色
- **数字展示**：更大字体(2rem)，加粗，使用对应主题色
- **今日统计**：改为横向进度条/指标卡片样式
- **CTA 按钮**：更大的圆角，更醒目的渐变
- **欢迎语**：增加装饰元素

### 5.4 任务管理页面

**现状问题**：

- 表格头部灰色背景偏冷
- 任务卡片样式普通
- 审批页面评分按钮 hover 效果不够明显

**改造方案**：

- **表格**：表头使用暖色渐变背景，行 hover 使用暖色淡底
- **任务卡片**：更大的圆角，左侧加彩色竖条区分状态
- **评分按钮**：excellent 用绿色系、good 用蓝色系，hover 时有更明显视觉反馈

### 5.5 抽奖页面

**现状问题**：

- 转盘外圈黑色(#1E293B)与暖色主题冲突
- 中心按钮红色太突兀
- 盲盒的黄色 OK，但可更精致

**改造方案**：

- **转盘外圈**：改为深棕色(#5D4037)或橙色渐变，更像木质/糖果感
- **中心按钮**：改为橙色渐变，与主题统一
- **盲盒**：更立体的 3D 效果，阴影更柔和
- **结果弹窗**：更大的圆角，更活泼的动画

### 5.6 代金券页面

**现状问题**：

- 余额卡片背景是紫色渐变，需要改为橙色
- 整体缺少趣味性

**改造方案**：

- **余额卡片**：改为橙色渐变背景，更大的数字
- **代金券列表**：增加图标、更清晰的交易类型区分
- **提现审批**：更明显的金额颜色、更圆润的卡片

## 6. 动效系统

### 6.1 全局动画

```css
/* 入场动画 */
@keyframes slideIn {
  from {
    transform: translateX(100%) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 浮动动画 - 用于emoji和装饰元素 */
@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  33% {
    transform: translateY(-10px) rotate(2deg);
  }
  66% {
    transform: translateY(-5px) rotate(-1deg);
  }
}

/* 脉冲 - 用于按钮、提示 */
@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(255, 140, 66, 0.4);
  }
  50% {
    box-shadow: 0 0 0 12px rgba(255, 140, 66, 0);
  }
}

/* 页面内容入场 */
.page-fade-in {
  animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

### 6.2 微交互

- 按钮 hover：上浮 3px + 放大 1.02 + 阴影加深
- 卡片 hover：上浮 2px + 阴影变化
- 导航 hover：右移 3px + 背景色变
- 输入框 focus：4px 宽的外发光环
- 数字变化：简单的缩放脉冲

## 7. 响应式设计要点

- **PC**：侧边栏固定，内容区自适应
- **平板(768px)**：侧边栏宽度缩减至 220px
- **手机(640px)**：
  - 顶部横向导航栏，可滚动
  - 卡片单列显示
  - 转盘尺寸缩减至 300px
  - 盲盒网格调整为 3 列小尺寸
  - 按钮全宽显示

## 8. 代码组织与实现策略

### 8.1 样式文件调整

| 文件                        | 修改类型 | 说明                                       |
| --------------------------- | -------- | ------------------------------------------ |
| `global.css`                | 重写     | 全新色彩系统、字体、按钮、卡片、表单、动画 |
| `Layout.module.css`         | 重写     | 暖色侧边栏、新导航样式、移动端适配         |
| `Login.module.css`          | 重写     | 暖色背景、新卡片样式、装饰元素             |
| `Lottery.module.css`        | 修改     | 转盘/盲盒颜色适配新主题、弹窗样式          |
| `TaskManagement.module.css` | 修改     | 表格颜色、任务卡片样式                     |
| `Voucher.module.css`        | 修改     | 余额卡片颜色、列表样式                     |

### 8.2 组件内联样式清理

将以下组件中的内联 `style={{...}}` 提取为 CSS 类：

| 组件                   | 说明                         |
| ---------------------- | ---------------------------- |
| `StudentDashboard.tsx` | 统计卡片、数字样式、按钮样式 |
| `ParentDashboard.tsx`  | 类似的统计卡片               |
| `StudentTaskPage.tsx`  | 任务卡片样式                 |
| `LotteryPage.tsx`      | 页面容器样式                 |
| `VoucherPage.tsx`      | 余额展示样式                 |

### 8.3 字体加载

在 `index.html` 中引入 Nunito 字体：

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap"
  rel="stylesheet"
/>
```

## 9. 边界条件与异常处理

- **字体加载失败**：使用系统字体栈兜底，保证可读性
- **减少动画偏好**：保留 `prefers-reduced-motion` 支持，所有动画降级
- **旧浏览器兼容**：CSS 变量有原生支持，不使用嵌套选择器
- **移动端低性能设备**：阴影和模糊效果适度降低

## 10. 预期效果

改造完成后，应用将呈现以下视觉效果：

1. **整体氛围**：温暖、活泼、充满童趣，适合儿童使用场景
2. **色彩协调**：橙色主色贯穿全局，绿色成功态、蓝色信息态搭配合理
3. **视觉层次**：通过色彩、阴影、圆角大小建立清晰的信息层级
4. **交互反馈**：hover、focus、active 状态均有明显且愉悦的反馈
5. **代码质量**：无内联样式，所有样式集中管理，易于后续维护
