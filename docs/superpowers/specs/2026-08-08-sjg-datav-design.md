# SJG DataV 设计文档

**日期**：2026-08-08
**状态**：已批准
**版本**：v1.0

## 一、项目概述

### 1.1 项目定位
- **名称**：sjg-datav（齐鲁文化数据大屏）
- **类型**：独立 React 项目，iframe 嵌入 SJG
- **目标**：参考 sc-datav 开源项目，为 SJG 创建现代数据可视化大屏

### 1.2 核心价值
- 展示山东省 12 个城市的文化数据
- 3D 地图 + 数据图表的沉浸式体验
- 科技暗色风格，视觉冲击力强

---

## 二、技术栈

### 2.1 核心框架
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19 | 核心框架 |
| TypeScript | 5.9+ | 类型安全 |
| Vite | 8 | 构建工具 |

### 2.2 3D 渲染
| 技术 | 版本 | 用途 |
|------|------|------|
| Three.js | 0.183+ | 3D 渲染引擎 |
| @react-three/fiber | 9.4+ | React 集成 |
| @react-three/drei | 10.7+ | 3D 工具库 |

### 2.3 数据可视化
| 技术 | 版本 | 用途 |
|------|------|------|
| ECharts | 6 | 图表库 |
| GSAP | 3.13+ | 动画库 |
| autofit.js | 3.2+ | 自适应布局 |

### 2.4 状态管理
| 技术 | 版本 | 用途 |
|------|------|------|
| Zustand | 5 | 状态管理 |
| styled-components | 6 | 样式方案 |

---

## 三、功能设计

### 3.1 MVP 功能清单

#### 3.1.1 3D 地图渲染
- **功能**：山东省轮廓的 3D 立体展示
- **交互**：支持旋转、缩放、平移
- **参考**：sc-datav 的 `map/scene.tsx`
- **数据**：本地 GeoJSON 文件（山东省轮廓）

#### 3.1.2 景点散点标记
- **功能**：70 个景点在地图上的位置标记
- **交互**：悬停显示名称，点击显示详情
- **参考**：sc-datav 的 `map/city.tsx`
- **数据**：`/api/public/spots` 接口

#### 3.1.3 基础布局框架
- **结构**：
  - Header：大屏标题 + 时间显示
  - 左侧面板：诗人排行、诗词滚动
  - 中央区域：3D 地图
  - 右侧面板：朝代分布、数字统计
- **参考**：sc-datav 的 `panel/index.tsx`

#### 3.1.4 数字动画
- **功能**：关键指标的数字跳动效果
- **指标**：126 位诗人、195 首诗词、70 个景点
- **参考**：sc-datav 的 `numberAnimation.tsx`

#### 3.1.5 API 数据对接
- **方式**：复用现有 /api/public/* 接口
- **缓存**：使用 SWR 进行数据缓存
- **接口**：
  - `GET /api/public/poets` - 获取诗人列表
  - `GET /api/public/poems` - 获取诗词列表
  - `GET /api/public/spots` - 获取景点列表
  - `GET /api/public/events` - 获取事件列表
  - `GET /api/public/dynasties` - 获取朝代列表

---

## 四、项目结构

```
sjg-datav/
├── src/
│   ├── assets/                    # 静态资源
│   │   ├── shandong.json          # 山东省 GeoJSON
│   │   └── images/                # 图片资源
│   ├── components/                # 通用组件
│   │   ├── chart.tsx              # ECharts 封装
│   │   ├── numberAnimation.tsx    # 数字动画
│   │   └── autoFit.tsx            # 自适应布局
│   ├── pages/
│   │   └── DataV/                 # 大屏主页面
│   │       ├── index.tsx          # 页面入口
│   │       ├── map/               # 3D 地图组件
│   │       │   ├── index.tsx      # 地图容器
│   │       │   ├── scene.tsx      # 3D 场景
│   │       │   ├── city.tsx       # 散点标记
│   │       │   └── lights.tsx     # 光照设置
│   │       ├── panel/             # 面板组件
│   │       │   ├── index.tsx      # 面板容器
│   │       │   ├── header.tsx     # 顶部标题栏
│   │       │   ├── left.tsx       # 左侧面板
│   │       │   └── right.tsx      # 右侧面板
│   │       └── stores/            # 状态管理
│   │           └── index.ts       # Zustand store
│   ├── api/                       # API 接口
│   │   └── index.ts               # 接口封装 + SWR
│   ├── hooks/                     # 自定义 Hooks
│   │   └── useAutoFit.ts          # 自适应 Hook
│   ├── App.tsx                    # 应用入口
│   └── main.tsx                   # 主入口
├── public/
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 五、与 SJG 集成

### 5.1 集成方式
- **类型**：独立项目，通过悬浮按钮跳转
- **端口**：5180（开发环境）
- **访问**：http://localhost:5180

### 5.2 悬浮按钮设计
- **位置**：SJG 地图页（/map）右下角
- **样式**：圆形，渐变紫色（#667eea → #764ba2），带 📊 图标
- **大小**：56px × 56px
- **交互**：点击后新标签页打开数据大屏
- **实现**：修改 SJG 的 `MapView.vue` 组件

### 5.3 数据共享
- **方式**：通过 API 接口共享数据
- **缓存**：前端使用 SWR 缓存，减少请求
- **同步**：无需实时同步，数据相对静态

---

## 六、视觉风格

### 6.1 整体风格
- **类型**：科技暗色风格
- **背景**：深色（#1a1a2e）
- **主色调**：紫色渐变（#667eea → #764ba2）
- **强调色**：霓虹蓝（#4facfe）、霓虹绿（#00f2fe）

### 6.2 组件样式
- **卡片**：半透明背景 + 毛玻璃效果 + 紫色边框
- **文字**：白色主文字 + 灰色辅助文字
- **图表**：渐变色 + 发光效果
- **动画**：GSAP 平滑过渡

### 6.3 响应式设计
- **适配方案**：autofit.js 自适应布局
- **设计基准**：1920 × 1080
- **缩放策略**：等比缩放，保持宽高比

---

## 七、开发计划

### 7.1 第一周（基础功能）
| 任务 | 时间 | 说明 |
|------|------|------|
| 项目初始化 | 1 天 | 创建 React 项目，配置技术栈 |
| 3D 地图渲染 | 2 天 | 山东省轮廓的 3D 展示 |
| 散点标记 | 1 天 | 70 个景点的位置标记 |
| 基础布局 | 1 天 | Header + 左右面板框架 |

### 7.2 第二周（完善功能）
| 任务 | 时间 | 说明 |
|------|------|------|
| 数字动画 | 1 天 | 关键指标的数字跳动效果 |
| API 对接 | 1 天 | 调用现有接口获取数据 |
| SWR 缓存 | 0.5 天 | 前端数据缓存 |
| 悬浮按钮 | 0.5 天 | SJG 集成入口 |
| 测试优化 | 2 天 | 功能测试、性能优化 |

---

## 八、参考资源

### 8.1 sc-datav 项目
- **GitHub**：https://github.com/knight-L/sc-datav
- **核心技术**：React + Three.js + ECharts
- **参考文件**：
  - `src/pages/Demo1/map/` - 3D 地图组件
  - `src/pages/Demo1/panel/` - 面板组件
  - `src/components/` - 通用组件

### 8.2 GeoJSON 数据
- **来源**：阿里云 DataV.GeoAtlas
- **URL**：https://geo.datav.aliyun.com/areas_v3/bound/370000_full.json
- **处理**：下载后放在 `src/assets/shandong.json`

### 8.3 SJG 现有接口
- **诗人**：GET /api/public/poets
- **诗词**：GET /api/public/poems
- **景点**：GET /api/public/spots
- **事件**：GET /api/public/events
- **朝代**：GET /api/public/dynasties

---

## 九、风险与对策

### 9.1 技术风险
| 风险 | 影响 | 对策 |
|------|------|------|
| Three.js 学习曲线 | 开发效率 | 参考 sc-datav 代码，复用现有模式 |
| GeoJSON 数据质量 | 地图显示 | 使用阿里云官方数据，质量有保障 |
| 性能问题 | 用户体验 | 使用 WebGL 优化，减少渲染负载 |

### 9.2 集成风险
| 风险 | 影响 | 对策 |
|------|------|------|
| 跨域问题 | API 调用 | Vite 配置代理解决 |
| 样式冲突 | 视觉一致性 | 独立项目，样式隔离 |
| 数据同步 | 数据一致性 | 使用 API 接口，数据源统一 |

---

## 十、后续扩展

### 10.1 功能扩展
- **城市下钻**：点击城市进入详情页
- **飞线动画**：诗人游历路线展示
- **热力图层**：景点密度热力图
- **诗词详情**：点击诗词显示全文和赏析

### 10.2 数据扩展
- **更多城市**：扩展到山东省外其他城市
- **更多维度**：增加历史事件、文化传承等维度
- **实时数据**：接入实时访问数据、用户行为数据

### 10.3 技术扩展
- **微前端**：升级为 qiankun 微前端架构
- **GraphQL**：引入 GraphQL 接口，灵活查询
- **SSR**：服务端渲染，提升首屏性能

---

## 附录 A：sc-datav 核心组件参考

### A.1 3D 地图组件
```typescript
// src/pages/Demo1/map/scene.tsx
// 核心：使用 @react-three/fiber 渲染 3D 地图
// 关键：GeoJSON → ExtrudeGeometry → 3D 立体地图
```

### A.2 面板布局组件
```typescript
// src/pages/Demo1/panel/index.tsx
// 核心：Grid 布局 + Card 组件
// 关键：styled-components + GSAP 动画
```

### A.3 图表组件
```typescript
// src/components/chart.tsx
// 核心：ECharts 封装
// 关键：按需引入 + 响应式配置
```

---

## 附录 B：API 接口响应格式

### B.1 诗人接口
```json
GET /api/public/poets
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "name": "李白",
      "dynastyId": 1,
      "birthYear": 701,
      "deathYear": 762,
      "biography": "唐代伟大的浪漫主义诗人..."
    }
  ]
}
```

### B.2 景点接口
```json
GET /api/public/spots
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "name": "大明湖",
      "region": "济南",
      "longitude": "117.0158330",
      "latitude": "36.6700000",
      "description": "始建于北魏..."
    }
  ]
}
```

---

**文档完成时间**：2026-08-08
**下一步**：创建实现计划
